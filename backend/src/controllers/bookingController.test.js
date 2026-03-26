import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createChain, createMockRes } from '../test/helpers.js';

const {
  sportsBookingFindByIdMock,
  sportsBookingFindMock,
} = vi.hoisted(() => ({
  sportsBookingFindByIdMock: vi.fn(),
  sportsBookingFindMock: vi.fn(),
}));

vi.mock('../models/Facility.js', () => ({
  default: {},
}));

vi.mock('../models/SportsSlot.js', () => ({
  default: {},
}));

vi.mock('../models/FacilityBlock.js', () => ({
  default: {},
}));

vi.mock('../models/SportsBooking.js', () => ({
  default: {
    findById: sportsBookingFindByIdMock,
    find: sportsBookingFindMock,
  },
}));

import { updateBooking } from './bookingController.js';

describe('bookingController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates participant count for an active booking', async () => {
    const saveMock = vi.fn();
    sportsBookingFindByIdMock.mockReturnValueOnce(createChain({
      _id: 'booking-1',
      user: 'user-1',
      status: 'confirmed',
      isGroupBooking: false,
      bookingDate: new Date('2026-03-27T00:00:00.000Z'),
      participantCount: 1,
      slot: { _id: 'slot-1', capacity: 4, minPlayersRequired: 2 },
      facility: { capacity: 4 },
      save: saveMock,
    }));
    sportsBookingFindMock.mockReturnValueOnce(createChain([]));

    const req = {
      params: { id: 'booking-1' },
      body: { participantCount: 3 },
      user: { _id: 'user-1', roles: ['student'] },
    };
    const res = createMockRes();

    await updateBooking(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.participantCount).toBe(3);
    expect(res.body.minPlayersRequired).toBe(3);
  });

  it('rejects updates that exceed remaining slot capacity', async () => {
    sportsBookingFindByIdMock.mockReturnValueOnce(createChain({
      _id: 'booking-1',
      user: 'user-1',
      status: 'confirmed',
      isGroupBooking: false,
      bookingDate: new Date('2026-03-27T00:00:00.000Z'),
      participantCount: 1,
      slot: { _id: 'slot-1', capacity: 4, minPlayersRequired: 2 },
      facility: { capacity: 4 },
      save: vi.fn(),
    }));
    sportsBookingFindMock.mockReturnValueOnce(createChain([
      { participantCount: 3, participants: ['user-2', 'user-3', 'user-4'] },
    ]));

    const req = {
      params: { id: 'booking-1' },
      body: { participantCount: 2 },
      user: { _id: 'user-1', roles: ['student'] },
    };
    const res = createMockRes();

    await updateBooking(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Not enough capacity left for that many players');
  });
});
