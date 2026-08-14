import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class PowerBiApiKeyGuard implements CanActivate {
    private normalizeKey;
    private matches;
    canActivate(context: ExecutionContext): boolean;
}
