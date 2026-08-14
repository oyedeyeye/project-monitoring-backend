import { ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
export declare class UserScopedCacheInterceptor extends CacheInterceptor {
    trackBy(context: ExecutionContext): string | undefined;
}
