import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatPlanDuration,
  formatSlotTimeRange,
  formatTime,
  getSlotTone,
  getSubscriptionStatusTone,
  isSlotBookable,
} from './utils';

describe('slot-booking utils', () => {
  it('formats dates and times defensively', () => {
    expect(formatDate('2026-03-26T10:30:00.000Z')).toContain('2026');
    expect(formatDate('')).toBe('—');
    expect(formatTime('')).toBe('—');
    expect(formatTime('not-a-date')).toBe('not-a-date');
  });

  it('formats slot time ranges from datetime or fallback fields', () => {
    expect(
      formatSlotTimeRange({
        slotStart: '2026-03-26T10:30:00.000Z',
        slotEnd: '2026-03-26T11:30:00.000Z',
      })
    ).toContain(' - ');

    expect(
      formatSlotTimeRange({
        startTime: '10:30',
        endTime: '11:30',
      })
    ).toBe('10:30 - 11:30');

    expect(formatSlotTimeRange(null)).toBe('—');
  });

  it('formats currency and plan duration labels', () => {
    expect(formatCurrency(300)).toContain('300');
    expect(formatCurrency('abc')).toBe('—');
    expect(formatPlanDuration({ planDuration: 'monthly' })).toBe('Monthly');
    expect(formatPlanDuration({ validityDays: 75 })).toBe('3 Months');
    expect(formatPlanDuration(null)).toBe('—');
  });

  it('maps statuses to tones and bookable slot states', () => {
    expect(getSubscriptionStatusTone('Approved')).toBe('success');
    expect(getSubscriptionStatusTone('Pending')).toBe('warning');
    expect(getSubscriptionStatusTone('NoShow')).toBe('danger');
    expect(getSubscriptionStatusTone('Team Practice')).toBe('neutral');
    expect(getSubscriptionStatusTone('Anything else')).toBe('info');

    expect(getSlotTone('Available')).toBe('success');
    expect(getSlotTone('Group Open')).toBe('warning');
    expect(getSlotTone('Fully Booked')).toBe('danger');
    expect(getSlotTone('Team Practice')).toBe('neutral');
    expect(getSlotTone('Unknown')).toBe('info');

    expect(isSlotBookable('Available')).toBe(true);
    expect(isSlotBookable('Group Open')).toBe(true);
    expect(isSlotBookable('Team Practice')).toBe(false);
  });
});
