import cron from 'node-cron';
import Booking from '../models/Booking.js';
import SportsBooking from '../models/SportsBooking.js';
import { createPenalty } from '../services/penaltyService.js';

/**
 * Mark unattended bookings as no-show once their attendance window has elapsed.
 * Runs every 15 minutes.
 */
export const runNoShowSweep = async (now = new Date()) => {
    try {
        const cutoff = new Date(now.getTime() - 15 * 60 * 1000);

        const confirmedBookings = await Booking.find({
            status: 'Confirmed'
        }).populate('slotId');

        const overdueSportsBookings = await SportsBooking.find({
            status: { $in: ['confirmed', 'group_pending'] },
            attendanceStatus: 'pending',
            slotEndAt: { $lte: now }
        });

        let markedCount = 0;

        for (const booking of confirmedBookings) {
            if (!booking.slotId) continue;

            const slotStart = booking.slotId.startTime;
            if (slotStart && slotStart <= cutoff) {
                booking.status = 'NoShow';
                await booking.save();

                await createPenalty(
                    booking.userId,
                    'NoShow',
                    booking._id,
                    'No check-in within 15 minutes of slot start'
                );

                markedCount++;
            }
        }

        for (const booking of overdueSportsBookings) {
            booking.attendanceStatus = 'absent';
            booking.status = 'no_show';
            await booking.save();

            await createPenalty(
                booking.user,
                'NoShow',
                booking._id,
                'No attendance marked before the sports slot ended'
            );

            markedCount++;
        }

        if (markedCount > 0) {
            console.log(`[NoShowJob] Marked ${markedCount} bookings as NoShow`);
        }
    } catch (error) {
        console.error('[NoShowJob] Error:', error.message);
    }
};

const noShowJob = cron.schedule('*/15 * * * *', async () => {
    await runNoShowSweep();
}, { scheduled: false });

export default noShowJob;
