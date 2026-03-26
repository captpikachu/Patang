import { describe, expect, it, vi } from 'vitest';

const requestUseMock = vi.fn();
const responseUseMock = vi.fn();
const createMock = vi.fn(() => ({
  interceptors: {
    request: { use: requestUseMock },
    response: { use: responseUseMock },
  },
}));

vi.mock('axios', () => ({
  default: {
    create: createMock,
  },
}));

describe('shared api client', () => {
  it('removes the json content type for FormData uploads before attaching auth', async () => {
    vi.resetModules();
    requestUseMock.mockClear();
    responseUseMock.mockClear();

    const localStorageMock = {
      getItem: vi.fn((key) => (key === 'token' ? 'sample-token' : null)),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    });

    await import('./api');

    const requestInterceptor = requestUseMock.mock.calls[0][0];

    const headers = {
      Authorization: undefined,
      'Content-Type': 'application/json',
      setContentType: vi.fn(),
    };
    const config = {
      data: new FormData(),
      headers,
    };

    const nextConfig = requestInterceptor(config);

    expect(headers.setContentType).toHaveBeenCalledWith(undefined);
    expect(nextConfig.headers.Authorization).toBe('Bearer sample-token');
  });
});
