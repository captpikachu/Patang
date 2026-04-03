import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Existing routes
import authRoutes from './routes/authRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

// New v2 routes (spec-compliant)
import facilityRoutesV2 from './routes/facilityRoutesV2.js';
import bookingRoutesV2 from './routes/bookingRoutesV2.js';
import subscriptionRoutesV2 from './routes/subscriptionRoutesV2.js';
import subscriptionAdminRoutes from './routes/subscriptionAdminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import eventAdminRoutes from './routes/eventAdminRoutes.js';
import penaltyRoutes from './routes/penaltyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import slotBookingRoutes from './routes/slotBookingRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import executiveRoutes from './routes/executiveRoutes.js';
import captainRoutes from './routes/captainRoutes.js';
import captainAdminRoutes from './routes/captainAdminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Cron jobs
import groupExpiryJob from './jobs/groupExpiryJob.js';
import noShowJob from './jobs/noShowJob.js';
import subscriptionExpiryJob from './jobs/subscriptionExpiryJob.js';
import slotGenerationJob from './jobs/slotGenerationJob.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Existing routes (unchanged)
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// New v2 routes (spec-compliant)
app.use('/api/v2/facilities', facilityRoutesV2);
app.use('/api/v2/bookings', bookingRoutesV2);
app.use('/api/v2/subscriptions', subscriptionRoutesV2);
app.use('/api/v2/admin/subscriptions', subscriptionAdminRoutes);
app.use('/api/v2/events', eventRoutes);
app.use('/api/v2/admin/events', eventAdminRoutes);
app.use('/api/v2/penalties', penaltyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/slot-booking', slotBookingRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/coordinator', coordinatorRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/executive', executiveRoutes);
app.use('/api/captain', captainRoutes);
app.use('/api/executive/captain', captainAdminRoutes);
app.use('/api/notifications', notificationRoutes);

groupExpiryJob.start();
noShowJob.start();
subscriptionExpiryJob.start();
slotGenerationJob.start();

const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Catch-all route to serve the index.html for React Router
app.get('*all', (req, res) => {
    // Skip API routes
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ message: 'API route not found' });
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            // If the file doesn't exist, we're likely in dev mode or haven't built yet
            res.status(200).send('Backend is running. Build frontend to see the UI.');
        }
    });
});

export default app;
