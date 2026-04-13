import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  bookingFindMock,
  sportsBookingFindMock,
  createPenaltyMock,
} = vi.hoisted(() => ({
  bookingFindMock: vi.fn(),
  sportsBookingFindMock: vi.fn(),
  createPenaltyMock: vi.fn(),
}));

vi.mock('../models/Booking.js', () => ({
  default: {
    find: bookingFindMock,
  },
}));

vi.mock('../models/SportsBooking.js', () => ({
  default: {
    find: sportsBookingFindMock,
  },
}));

vi.mock('../services/penaltyService.js', () => ({
  createPenalty: createPenaltyMock,
}));

import { runNoShowSweep } from './noShowJob.js';

describe('noShowJob', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bookingFindMock.mockReturnValue({
      populate: vi.fn().mockResolvedValue([]),
    });
    sportsBookingFindMock.mockResolvedValue([]);
  });

  it('marks overdue sports bookings as no_show and absent', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    sportsBookingFindMock.mockResolvedValueOnce([
      {
        _id: 'sports-booking-1',
        user: 'user-1',
        attendanceStatus: 'pending',
        status: 'confirmed',
        slotEndAt: new Date('2026-04-04T10:00:00.000Z'),
        save,
      },
    ]);

    await runNoShowSweep(new Date('2026-04-04T10:30:00.000Z'));

    expect(sportsBookingFindMock).toHaveBeenCalledWith({
      status: { $in: ['confirmed', 'group_pending'] },
      attendanceStatus: 'pending',
      slotEndAt: { $lte: new Date('2026-04-04T10:30:00.000Z') },
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(createPenaltyMock).toHaveBeenCalledWith(
      'user-1',
      'NoShow',
      'sports-booking-1',
      'No attendance marked before the sports slot ended'
    );
  });

  it('does not mark future sports bookings as no_show', async () => {
    await runNoShowSweep(new Date('2026-04-04T10:30:00.000Z'));

    expect(createPenaltyMock).not.toHaveBeenCalled();
  });
});
