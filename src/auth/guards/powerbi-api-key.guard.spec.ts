import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PowerBiApiKeyGuard } from './powerbi-api-key.guard';

describe('PowerBiApiKeyGuard', () => {
  let guard: PowerBiApiKeyGuard;

  beforeEach(() => {
    guard = new PowerBiApiKeyGuard();
    process.env.POWERBI_API_KEY = 'test-secret-key';
  });

  afterEach(() => {
    delete process.env.POWERBI_API_KEY;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if x-api-key header matches', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-api-key': 'test-secret-key' },
          query: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should return true if api_key query param matches', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          query: { api_key: 'test-secret-key' },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw UnauthorizedException if key is missing', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          query: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if key is invalid', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-api-key': 'wrong-key' },
          query: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if environment variable is not set', () => {
    delete process.env.POWERBI_API_KEY;

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-api-key': 'test-secret-key' },
          query: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow('API Key authentication is not configured on the server.');
  });
});
