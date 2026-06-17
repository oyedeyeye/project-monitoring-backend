import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PowerBiApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Check header or query parameter for the API key
    const apiKeyHeader = request.headers['x-api-key'];
    const apiKeyQuery = request.query['api_key'];
    
    const providedKey = apiKeyHeader || apiKeyQuery;
    const expectedKey = process.env.POWERBI_API_KEY;

    if (!expectedKey) {
        throw new UnauthorizedException('API Key authentication is not configured on the server.');
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid or missing API Key.');
    }

    return true;
  }
}
