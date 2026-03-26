import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockRes } from '../test/helpers.js';

const {
  subscriptionFindOneMock,
  subscriptionCreateMock,
  subscriptionFindMock,
  subscriptionCountDocumentsMock,
  subscriptionFindByIdMock,
  generatePassIdMock,
  calculateEndDateMock,
  generateQRCodeMock,
  createAccessLogMock,
  getFacilityOccupancySummaryMock,
  getLatestAccessActionMock,
  getScopedSubscriptionTypesMock,
  normalizeSubscriptionTypeMock,
  parseSubscriptionScanPayloadMock,
} = vi.hoisted(() => ({
  subscriptionFindOneMock: vi.fn(),
  subscriptionCreateMock: vi.fn(),
  subscriptionFindMock: vi.fn(),
  subscriptionCountDocumentsMock: vi.fn(),
  subscriptionFindByIdMock: vi.fn(),
  generatePassIdMock: vi.fn(),
  calculateEndDateMock: vi.fn(),
  generateQRCodeMock: vi.fn(),
  createAccessLogMock: vi.fn(),
  getFacilityOccupancySummaryMock: vi.fn(),
  getLatestAccessActionMock: vi.fn(),
  getScopedSubscriptionTypesMock: vi.fn(),
  normalizeSubscriptionTypeMock: vi.fn((value) => value),
  parseSubscriptionScanPayloadMock: vi.fn(),
}));

vi.mock('../models/SubscriptionV2.js', () => ({
  default: {
    findOne: subscriptionFindOneMock,
    create: subscriptionCreateMock,
    find: subscriptionFindMock,
    countDocuments: subscriptionCountDocumentsMock,
    findById: subscriptionFindByIdMock,
  },
}));

vi.mock('../services/subscriptionService.js', () => ({
  generatePassId: generatePassIdMock,
  calculateEndDate: calculateEndDateMock,
  generateQRCode: generateQRCodeMock,
}));

vi.mock('../services/accessService.js', () => ({
  createAccessLog: createAccessLogMock,
  getFacilityOccupancySummary: getFacilityOccupancySummaryMock,
  getLatestAccessAction: getLatestAccessActionMock,
  getScopedSubscriptionTypes: getScopedSubscriptionTypesMock,
  normalizeSubscriptionType: normalizeSubscriptionTypeMock,
  parseSubscriptionScanPayload: parseSubscriptionScanPayloadMock,
}));

import {
  adminReview,
  apply,
  getOccupancySummary,
  verifyEntry,
} from './subscriptionControllerV2.js';

describe('subscriptionControllerV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new subscription application when no active one exists', async () => {
    subscriptionFindOneMock.mockResolvedValueOnce(null);
    subscriptionCreateMock.mockResolvedValueOnce({
      _id: 'sub-1',
      facilityType: 'Gym',
      plan: 'Monthly',
      status: 'Pending',
    });

    const req = {
      body: { facilityType: 'Gym', plan: 'Monthly' },
      files: {
        medicalCert: [{ path: 'uploads\\medical.pdf' }],
        paymentReceipt: [{ path: 'uploads\\receipt.pdf' }],
      },
      user: { _id: 'user-1' },
    };
    const res = createMockRes();

    await apply(req, res);

    expect(subscriptionCreateMock).toHaveBeenCalledWith({
      userId: 'user-1',
      facilityType: 'Gym',
      plan: 'Monthly',
      medicalCertUrl: 'uploads/medical.pdf',
      paymentReceiptUrl: 'uploads/receipt.pdf',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('blocks duplicate active or pending subscription applications', async () => {
    subscriptionFindOneMock.mockResolvedValueOnce({ _id: 'sub-1' });

    const req = {
      body: { facilityType: 'Gym', plan: 'Monthly' },
      files: {
        medicalCert: [{ path: 'uploads/medical.pdf' }],
        paymentReceipt: [{ path: 'uploads/receipt.pdf' }],
      },
      user: { _id: 'user-1' },
    };
    const res = createMockRes();

    await apply(req, res);

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe('ACTIVE_SUBSCRIPTION_EXISTS');
  });

  it('approves a pending subscription and issues pass metadata', async () => {
    const saveMock = vi.fn();
    const endDate = new Date('2026-04-25T00:00:00.000Z');
    subscriptionFindByIdMock.mockResolvedValueOnce({
      _id: 'sub-1',
      userId: 'user-1',
      facilityType: 'Gym',
      plan: 'Monthly',
      status: 'Pending',
      save: saveMock,
    });
    getScopedSubscriptionTypesMock.mockReturnValueOnce(['Gym']);
    calculateEndDateMock.mockReturnValueOnce(endDate);
    generatePassIdMock.mockResolvedValueOnce('GYM-2026-001');
    generateQRCodeMock.mockResolvedValueOnce('qr-data-url');

    const req = {
      params: { subscriptionId: 'sub-1' },
      body: { action: 'approve', comments: 'Looks good' },
      user: { _id: 'admin-1', roles: ['gym_admin'] },
    };
    const res = createMockRes();

    await adminReview(req, res);

    expect(generatePassIdMock).toHaveBeenCalledWith('Gym');
    expect(generateQRCodeMock).toHaveBeenCalledWith('GYM-2026-001', 'user-1');
    expect(saveMock).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.data.passId).toBe('GYM-2026-001');
  });

  it('verifies entry by alternating from the latest access action when none is supplied', async () => {
    parseSubscriptionScanPayloadMock.mockReturnValueOnce({ passId: 'GYM-2026-001' });
    subscriptionFindOneMock.mockReturnValueOnce({
      populate: vi.fn().mockResolvedValue({
        _id: 'sub-1',
        userId: { _id: 'user-1', name: 'Aarya', email: 'aarya@iitk.ac.in' },
        facilityType: 'Gym',
        passId: 'GYM-2026-001',
        status: 'Approved',
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }),
    });
    getScopedSubscriptionTypesMock.mockReturnValueOnce(['Gym']);
    getLatestAccessActionMock.mockResolvedValueOnce({ action: 'entry' });
    createAccessLogMock.mockResolvedValueOnce({ scannedAt: new Date('2026-03-26T10:00:00.000Z') });
    getFacilityOccupancySummaryMock.mockResolvedValueOnce({ facilityType: 'Gym', totalSlots: 100, occupiedSlots: 40, availableSlots: 60 });

    const req = {
      body: { qrPayload: '{"passId":"GYM-2026-001"}' },
      user: { _id: 'caretaker-1', roles: ['caretaker'] },
    };
    const res = createMockRes();

    await verifyEntry(req, res);

    expect(createAccessLogMock).toHaveBeenCalledWith({
      userId: 'user-1',
      subscriptionId: 'sub-1',
      facilityType: 'Gym',
      action: 'exit',
      scannedBy: 'caretaker-1',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.action).toBe('exit');
  });

  it('returns occupancy data for allowed facility scopes', async () => {
    getScopedSubscriptionTypesMock.mockReturnValueOnce(['Gym']);
    getFacilityOccupancySummaryMock.mockResolvedValueOnce({ facilityType: 'Gym', totalSlots: 100, occupiedSlots: 10, availableSlots: 90 });

    const req = {
      query: { facilityType: 'Gym' },
      user: { roles: ['gym_admin'] },
    };
    const res = createMockRes();

    await getOccupancySummary(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.occupancy).toEqual([
      { facilityType: 'Gym', totalSlots: 100, occupiedSlots: 10, availableSlots: 90 },
    ]);
  });
});
