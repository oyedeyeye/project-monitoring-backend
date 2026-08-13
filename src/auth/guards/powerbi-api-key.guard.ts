import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class PowerBiApiKeyGuard implements CanActivate {
  /**
   * Express types both of these as `string | string[] | undefined` (a repeated
   * header or `?api_key=a&api_key=b` yields an array). Only accept a single
   * scalar value so the comparison below always sees a plain string.
   */
  private normalizeKey(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
  }

  /**
   * Constant-time comparison. A plain `!==` leaks the length of the matching
   * prefix through timing, which lets an attacker recover the key byte by byte.
   * timingSafeEqual requires equal-length buffers, so compare lengths first —
   * that only reveals the key's length, not its contents.
   */
  private matches(provided: string, expected: string): boolean {
    const providedBuf = Buffer.from(provided, 'utf8');
    const expectedBuf = Buffer.from(expected, 'utf8');

    if (providedBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(providedBuf, expectedBuf);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Header is preferred; the query-string form is retained for BI clients
    // that cannot set custom headers. Note that a key passed in the URL is
    // recorded by proxy and access logs.
    const providedKey =
      this.normalizeKey(request.headers['x-api-key']) ??
      this.normalizeKey(request.query['api_key']);

    const expectedKey = process.env.POWERBI_API_KEY;

    if (!expectedKey) {
      throw new UnauthorizedException('API Key authentication is not configured on the server.');
    }

    if (!providedKey || !this.matches(providedKey, expectedKey)) {
      throw new UnauthorizedException('Invalid or missing API Key.');
    }

    return true;
  }
}
