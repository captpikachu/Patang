import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createChain, createMockRes } from '../test/helpers.js';

const {
  userFindByIdMock,
  subscriptionFindMock,
  penaltyCountDocumentsMock,
  penaltyFindOneMock,
} = vi.hoisted(() => ({
  userFindByIdMock: vi.fn(),
  subscriptionFindMock: vi.fn(),
  penaltyCountDocumentsMock: vi.fn(),
  penaltyFindOneMock: vi.fn(),
}));

vi.mock('../models/User.js', () => ({
  default: {
    findById: userFindByIdMock,
  },
}));

vi.mock('../models/SubscriptionV2.js', () => ({
  default: {
    find: subscriptionFindMock,
  },
}));

vi.mock('../models/Penalty.js', () => ({
  default: {
    countDocuments: penaltyCountDocumentsMock,
    findOne: penaltyFindOneMock,
  },
}));

import { changePassword, updateProfile } from './settingsController.js';

describe('settingsController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscriptionFindMock.mockReturnValue(createChain([]));
    penaltyCountDocumentsMock.mockResolvedValue(0);
    penaltyFindOneMock.mockReturnValue(createChain(null));
  });

  it('rejects an invalid IITK department for student users', async () => {
    const saveMock = vi.fn();
    userFindByIdMock.mockResolvedValueOnce({
      _id: 'user-1',
      name: 'Student User',
      roles: ['student'],
      email: 'student@iitk.ac.in',
      profileDetails: {},
      save: saveMock,
    });

    const req = {
      user: { _id: 'user-1' },
      body: { name: 'Student User', department: 'RandomDept' },
    };
    const res = createMockRes();

    await updateProfile(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe('Select a valid IITK department from the allowed list');
    expect(saveMock).not.toHaveBeenCalled();
  });

  it('updates the password after verifying the current password', async () => {
    const saveMock = vi.fn();
    const matchPasswordMock = vi.fn().mockResolvedValue(true);
    const user = {
      _id: 'user-1',
      name: 'Student User',
      email: 'student@iitk.ac.in',
      password: 'hashed-old',
      matchPassword: matchPasswordMock,
      save: saveMock,
    };
    userFindByIdMock.mockResolvedValueOnce(user);

    const req = {
      user: { _id: 'user-1' },
      body: {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      },
    };
    const res = createMockRes();

    await changePassword(req, res);

    expect(matchPasswordMock).toHaveBeenCalledWith('password123');
    expect(user.password).toBe('newpassword123');
    expect(saveMock).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Password changed successfully');
  });
});
