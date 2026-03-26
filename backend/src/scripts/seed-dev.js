import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Facility from '../models/Facility.js';
import SportsSlot from '../models/SportsSlot.js';
import SportsBooking from '../models/SportsBooking.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import SubscriptionV2 from '../models/SubscriptionV2.js';
import Event from '../models/Event.js';
import AccessLog from '../models/AccessLog.js';

dotenv.config();

const ensureUploadsDir = async () => {
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  await fs.mkdir(uploadsPath, { recursive: true });
};

const upsertUser = async ({ email, password, ...fields }) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({ email, password, ...fields });
  } else {
    user.name = fields.name;
    user.roles = fields.roles;
    user.status = fields.status;
    user.isVerified = fields.isVerified;
    user.profileDetails = fields.profileDetails;
    user.password = password;
  }

  await user.save();
  return user;
};

const upsertFacility = async (query, update) => {
  const existing = await Facility.findOne(query);
  if (existing) {
    Object.assign(existing, update);
    await existing.save();
    return existing;
  }

  return Facility.create({ ...query, ...update });
};

const upsertSportsSlot = async (facilityId, startTime, endTime, overrides = {}) => {
  const existing = await SportsSlot.findOne({ facility: facilityId, startTime, endTime });
  if (existing) {
    Object.assign(existing, { isActive: true, ...overrides });
    await existing.save();
    return existing;
  }

  return SportsSlot.create({
    facility: facilityId,
    startTime,
    endTime,
    daysOfWeek: [],
    isActive: true,
    ...overrides,
  });
};

const upsertPlan = async (query, update) => {
  const existing = await SubscriptionPlan.findOne(query);
  if (existing) {
    Object.assign(existing, update);
    await existing.save();
    return existing;
  }

  return SubscriptionPlan.create({ ...query, ...update });
};

const upsertEvent = async (query, update) => {
  const existing = await Event.findOne(query);
  if (existing) {
    Object.assign(existing, update);
    await existing.save();
    return existing;
  }

  return Event.create({ ...query, ...update });
};

const upsertSportsBooking = async (query, update) => {
  const existing = await SportsBooking.findOne(query);
  if (existing) {
    Object.assign(existing, update);
    await existing.save();
    return existing;
  }

  return SportsBooking.create({ ...query, ...update });
};

const seed = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/patang_dev';

  await ensureUploadsDir();
  await mongoose.connect(mongoUri);

  const student = await upsertUser({
    name: 'Patang Student',
    email: 'student@iitk.ac.in',
    password: 'password123',
    roles: ['student'],
    status: 'active',
    isVerified: true,
    profileDetails: {
      rollNumber: '230001',
      department: 'CSE',
      program: 'BTech',
    },
  });

  const caretaker = await upsertUser({
    name: 'Patang Caretaker',
    email: 'caretaker@iitk.ac.in',
    password: 'password123',
    roles: ['caretaker'],
    status: 'active',
    isVerified: true,
    profileDetails: {
      assignedFacilities: [],
    },
  });

  const gymAdmin = await upsertUser({
    name: 'Patang Gym Admin',
    email: 'gymadmin@iitk.ac.in',
    password: 'password123',
    roles: ['gym_admin'],
    status: 'active',
    isVerified: true,
    profileDetails: {},
  });

  const executive = await upsertUser({
    name: 'Patang Executive',
    email: 'executive@iitk.ac.in',
    password: 'password123',
    roles: ['executive'],
    status: 'active',
    isVerified: true,
    profileDetails: {},
  });

  const badmintonCourt = await upsertFacility(
    { name: 'Badminton Court 1' },
    {
      facilityType: 'sports',
      sportType: 'Badminton',
      location: 'Main Sports Complex',
      capacity: 4,
      totalCourts: 1,
      isOperational: true,
      metadata: { minGroupSize: 2, slotDuration: 60 },
      allowedRoles: ['student', 'faculty', 'admin', 'executive'],
    }
  );

  const tennisCourt = await upsertFacility(
    { name: 'Tennis Court 1' },
    {
      facilityType: 'sports',
      sportType: 'Tennis',
      location: 'Main Sports Complex',
      capacity: 2,
      totalCourts: 1,
      isOperational: true,
      metadata: { minGroupSize: 2, slotDuration: 60 },
      allowedRoles: ['student', 'faculty', 'admin', 'executive'],
    }
  );

  await upsertFacility(
    { name: 'IITK Gym' },
    {
      facilityType: 'gym',
      location: 'New SAC',
      capacity: 120,
      totalCourts: 1,
      isOperational: true,
      metadata: { capacity: 120 },
      allowedRoles: ['student', 'faculty', 'gym_admin', 'caretaker', 'admin', 'executive'],
    }
  );

  await upsertFacility(
    { name: 'Swimming Pool' },
    {
      facilityType: 'swimming',
      location: 'Sports Complex',
      capacity: 80,
      totalCourts: 1,
      isOperational: true,
      metadata: { capacity: 80 },
      allowedRoles: ['student', 'faculty', 'swim_admin', 'caretaker', 'admin', 'executive'],
    }
  );

  const badmintonMorning = await upsertSportsSlot(badmintonCourt._id, '08:00', '09:00', {
    capacity: 4,
    minPlayersRequired: 2,
    label: 'Morning Slot',
  });

  const badmintonEvening = await upsertSportsSlot(badmintonCourt._id, '18:00', '19:00', {
    capacity: 4,
    minPlayersRequired: 2,
    label: 'Evening Slot',
  });

  await upsertSportsSlot(tennisCourt._id, '17:00', '18:00', {
    capacity: 2,
    minPlayersRequired: 2,
    label: 'Evening Match Slot',
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const tomorrowStart = new Date(tomorrow);
  tomorrowStart.setHours(18, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(19, 0, 0, 0);

  const yesterdayStart = new Date(yesterday);
  yesterdayStart.setHours(8, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(9, 0, 0, 0);

  await upsertSportsBooking(
    { user: student._id, slot: badmintonEvening._id, bookingDate: tomorrow },
    {
      user: student._id,
      facility: badmintonCourt._id,
      slot: badmintonEvening._id,
      bookingDate: tomorrow,
      slotStartAt: tomorrowStart,
      slotEndAt: tomorrowEnd,
      status: 'confirmed',
      attendanceStatus: 'pending',
      isGroupBooking: false,
      minPlayersRequired: 1,
      participants: [student._id],
    }
  );

  await upsertSportsBooking(
    { user: student._id, slot: badmintonMorning._id, bookingDate: yesterday },
    {
      user: student._id,
      facility: badmintonCourt._id,
      slot: badmintonMorning._id,
      bookingDate: yesterday,
      slotStartAt: yesterdayStart,
      slotEndAt: yesterdayEnd,
      status: 'completed',
      attendanceStatus: 'present',
      isGroupBooking: false,
      minPlayersRequired: 1,
      participants: [student._id],
    }
  );

  await upsertPlan(
    { type: 'gym', planDuration: 'monthly' },
    { name: 'Monthly Gym Plan', price: 300, validityDays: 30, capacity: 120, isActive: true, metadata: { label: 'Short term' } }
  );
  await upsertPlan(
    { type: 'gym', planDuration: 'semesterly' },
    { name: 'Semester Gym Plan', price: 1200, validityDays: 180, capacity: 120, isActive: true, metadata: { label: 'Popular', tag: 'POPULAR' } }
  );
  await upsertPlan(
    { type: 'gym', planDuration: 'yearly' },
    { name: 'Yearly Gym Plan', price: 2500, validityDays: 365, capacity: 120, isActive: true, metadata: { label: 'Best value' } }
  );

  await upsertPlan(
    { type: 'swimming', planDuration: 'monthly' },
    { name: 'Monthly Pool Plan', price: 400, validityDays: 30, capacity: 80, isActive: true, metadata: { label: 'Short term' } }
  );
  await upsertPlan(
    { type: 'swimming', planDuration: 'semesterly' },
    { name: 'Semester Pool Plan', price: 1500, validityDays: 180, capacity: 80, isActive: true, metadata: { label: 'Popular', tag: 'POPULAR' } }
  );
  await upsertPlan(
    { type: 'swimming', planDuration: 'yearly' },
    { name: 'Yearly Pool Plan', price: 3000, validityDays: 365, capacity: 80, isActive: true, metadata: { label: 'Best value' } }
  );

  await SubscriptionV2.deleteMany({
    userId: { $in: [student._id] },
    status: { $in: ['Pending', 'Approved'] },
  });

  await AccessLog.deleteMany({
    user: student._id,
    facilityType: { $in: ['Gym', 'gym', 'SwimmingPool', 'swimming'] },
  });

  const upcomingEventStart = new Date();
  upcomingEventStart.setDate(upcomingEventStart.getDate() + 2);
  upcomingEventStart.setHours(18, 0, 0, 0);

  const upcomingEventEnd = new Date(upcomingEventStart);
  upcomingEventEnd.setHours(20, 0, 0, 0);

  await upsertEvent(
    { title: 'Udghosh Practice Session', createdBy: executive._id },
    {
      description: 'Sample approved event for local dashboard testing.',
      category: 'Sports',
      startTime: upcomingEventStart,
      endTime: upcomingEventEnd,
      venue: 'Main Sports Complex',
      organizingClub: 'Udghosh',
      registrationLink: 'https://example.com/register',
      status: 'Approved',
      createdBy: executive._id,
      reviewedBy: executive._id,
      reviewedAt: new Date(),
    }
  );

  caretaker.profileDetails = {
    ...(caretaker.profileDetails || {}),
    assignedFacilities: [badmintonCourt._id],
  };
  await caretaker.save();

  console.log('Seed complete.');
  console.log('Student login: student@iitk.ac.in / password123');
  console.log('Caretaker login: caretaker@iitk.ac.in / password123');
  console.log('Gym admin login: gymadmin@iitk.ac.in / password123');
  console.log('Executive login: executive@iitk.ac.in / password123');
};

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
