import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPage from './SettingsPage';

const { getMock, patchMock, logoutMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  patchMock: vi.fn(),
  logoutMock: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    get: getMock,
    patch: patchMock,
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'user-1', roles: ['student'] },
    logout: logoutMock,
  }),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a controlled IITK department select for students', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: {
          profile: {
            email: 'student@iitk.ac.in',
            name: 'Patang Student',
            profileDetails: { rollNumber: '230001', program: 'BTech', department: 'CSE' },
          },
          account: {},
          subscriptions: [],
        },
      },
    });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const departmentSelect = await screen.findByRole('combobox');
    expect(departmentSelect).toHaveValue('CSE');
    expect(screen.getByRole('option', { name: /computer science and engineering \(cse\)/i })).toBeInTheDocument();
  });

  it('logs the user out shortly after a successful password change', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: {
          profile: {
            email: 'student@iitk.ac.in',
            name: 'Patang Student',
            profileDetails: { rollNumber: '230001', program: 'BTech', department: 'CSE' },
          },
          account: {},
          subscriptions: [],
        },
      },
    });
    patchMock.mockResolvedValueOnce({ data: { success: true } });
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await screen.findByRole('button', { name: /change password/i });
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.type(screen.getByPlaceholderText('Min 8 characters'), 'newpassword123');
    await user.type(screen.getByPlaceholderText('Re-enter password'), 'newpassword123');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    expect(await screen.findByText(/please sign in again/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
    }, { timeout: 2500 });
  }, 7000);
});
