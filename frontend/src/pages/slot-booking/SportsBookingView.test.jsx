import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SportsBookingView from './SportsBookingView';

const baseData = {
  sportTypes: ['Badminton'],
  selectedSport: 'Badminton',
  selectedDate: '2026-03-26',
  bookableDates: [
    { date: '2026-03-26', label: 'Today' },
    { date: '2026-03-27', label: 'Tomorrow' },
  ],
  bookingRules: ['Please carry your IITK ID card.'],
  fairUse: {
    canBook: true,
    isSuspended: false,
    activeBookingCount: 0,
    maxAllowed: 2,
  },
  courtSlots: [
    {
      facilityId: 'court-1',
      courtName: 'Badminton Court 1',
      location: 'Main Sports Complex',
      capacity: 4,
      slots: [
        {
          _id: 'slot-1',
          status: 'Available',
          slotStart: '2026-03-26T10:00:00.000Z',
          slotEnd: '2026-03-26T11:00:00.000Z',
          spotsLeft: 3,
          capacity: 4,
          minPlayersRequired: 2,
        },
      ],
    },
  ],
  recentActivity: [],
};

const renderView = (overrides = {}) => {
  const props = {
    data: baseData,
    filters: { sportType: 'Badminton', date: '2026-03-26' },
    loading: false,
    refreshing: false,
    submission: { submitting: false, success: '', error: '' },
    onFiltersChange: vi.fn(),
    onRefresh: vi.fn(),
    onCreateBooking: vi.fn(),
    ...overrides,
  };

  render(<SportsBookingView {...props} />);
  return props;
};

describe('SportsBookingView', () => {
  it('submits a selected slot as a booking', async () => {
    const user = userEvent.setup();
    const props = renderView();

    await user.click(screen.getByRole('button', { name: /select slot badminton court 1/i }));
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    expect(props.onCreateBooking).toHaveBeenCalledWith({
      slotId: 'slot-1',
      bookingDate: '2026-03-26',
      isGroupBooking: false,
    });
  });

  it('allows toggling group booking for eligible slots', async () => {
    const user = userEvent.setup();
    const props = renderView();

    await user.click(screen.getByRole('button', { name: /select slot badminton court 1/i }));
    await user.click(screen.getByRole('button', { name: /enable group booking/i }));
    await user.click(screen.getByRole('button', { name: /confirm booking/i }));

    expect(props.onCreateBooking).toHaveBeenCalledWith({
      slotId: 'slot-1',
      bookingDate: '2026-03-26',
      isGroupBooking: true,
    });
  });

  it('blocks booking when the fair-use quota is reached', async () => {
    const user = userEvent.setup();
    renderView({
      data: {
        ...baseData,
        fairUse: {
          canBook: false,
          isSuspended: false,
          activeBookingCount: 2,
          maxAllowed: 2,
        },
      },
    });

    await user.click(screen.getByRole('button', { name: /select slot badminton court 1/i }));

    expect(screen.getByText(/booking quota reached/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm booking/i })).toBeDisabled();
  });
});
