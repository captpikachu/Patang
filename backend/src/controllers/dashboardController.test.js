import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createChain, createMockRes } from '../test/helpers.js';

const {
  sportsBookingFindMock,
  sportsBookingCountDocumentsMock,
  bookingFindMock,
  bookingCountDocumentsMock,
  subscriptionFindMock,
  penaltyFindMock,
  accessLogFindMock,
  eventFindMock,
} = vi.hoisted(() => ({
  sportsBookingFindMock: vi.fn(),
  sportsBookingCountDocumentsMock: vi.fn(),
  bookingFindMock: vi.fn(),
  bookingCountDocumentsMock: vi.fn(),
  subscriptionFindMock: vi.fn(),
  penaltyFindMock: vi.fn(),
  accessLogFindMock: vi.fn(),
  eventFindMock: vi.fn(),
}));

vi.mock('../models/SportsBooking.js', () => ({
  default: {
    find: sportsBookingFindMock,
    countDocuments: sportsBookingCountDocumentsMock,
  },
}));

vi.mock('../models/Booking.js', () => ({
  default: {
    find: bookingFindMock,
    countDocuments: bookingCountDocumentsMock,
  },
}));

vi.mock('../models/SubscriptionV2.js', () => ({
  default: {
    find: subscriptionFindMock,
  },
}));

vi.mock('../models/Penalty.js', () => ({
  default: {
    find: penaltyFindMock,
  },
}));

vi.mock('../models/AccessLog.js', () => ({
  default: {
    find: accessLogFindMock,
  },
}));

vi.mock('../models/Event.js', () => ({
  default: {
    find: eventFindMock,
  },
}));

import { getDashboard } from './dashboardController.js';

describe('dashboardController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when there is no authenticated user', async () => {
    const req = {};
    const res = createMockRes();

    await getDashboard(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ success: false, message: 'Authentication required' });
  });

  it('returns an aggregated dashboard payload for an authenticated user', async () => {
    subscriptionFindMock.mockReturnValueOnce(createChain([
      {
        facilityType: 'Gym',
        status: 'Approved',
        startDate: new Date('2026-03-01T00:00:00.000Z'),
        endDate: new Date('2026-04-01T00:00:00.000Z'),
        qrCode: 'qr',
        passId: 'GYM-1',
      },
    ]));

    sportsBookingFindMock.mockReturnValueOnce(createChain([
      {
        _id: 'sport-booking-1',
        facility: { name: 'Badminton Court 1', location: 'Sports Complex', sportType: 'Badminton' },
        slotStartAt: new Date(Date.now() + 60 * 60 * 1000),
        slotEndAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'confirmed',
        isGroupBooking: false,
      },
    ]));

    bookingFindMock.mockReturnValueOnce(createChain([
      {
        _id: 'legacy-booking-1',
        facilityId: { name: 'Gym Hall', location: 'SAC', sportType: 'Indoor' },
        slotDate: new Date(Date.now() + 3 * 60 * 60 * 1000),
        status: 'Confirmed',
        isGroupBooking: false,
      },
    ]));

    sportsBookingCountDocumentsMock.mockResolvedValueOnce(1);
    bookingCountDocumentsMock.mockResolvedValueOnce(1);
    penaltyFindMock.mockReturnValueOnce(createChain([
      { type: 'LateCancellation', description: 'Late cancel', isActive: true, createdAt: new Date() },
    ]));
    accessLogFindMock.mockReturnValueOnce(createChain([
      { facilityType: 'Gym', action: 'entry', scannedAt: new Date() },
    ]));
    eventFindMock.mockReturnValueOnce(createChain([
      { title: 'Udghosh', category: 'Sports', startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), venue: 'OAT' },
    ]));

    const req = {
      user: {
        _id: 'user-1',
        name: 'Aarya',
        email: 'aarya@iitk.ac.in',
        roles: ['student'],
        profileDetails: { rollNumber: '230001' },
      },
    };
    const res = createMockRes();

    await getDashboard(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Aarya');
    expect(res.body.data.subscriptions).toHaveLength(1);
    expect(res.body.data.upcomingBookings).toHaveLength(2);
    expect(res.body.data.fairUse.activeBookingCount).toBe(2);
    expect(res.body.data.penalties.totalActiveCount).toBe(1);
    expect(res.body.data.upcomingEvents).toHaveLength(1);
  });
});
