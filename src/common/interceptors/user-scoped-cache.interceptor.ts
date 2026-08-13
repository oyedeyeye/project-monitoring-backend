import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

/**
 * Default CacheInterceptor keys entries by request URL only, so two different
 * users hitting the same URL (e.g. GET /projects) would be served each
 * other's cached response even though results are scoped by req.user
 * (role/mdaId) rather than by anything in the URL. Prefixing the key with the
 * authenticated user's id keeps each user's cache entries isolated.
 */
@Injectable()
export class UserScopedCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const baseKey = super.trackBy(context);
    if (!baseKey) {
      return undefined;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    // No authenticated user on the request: don't risk sharing this
    // response across callers, just skip caching it.
    if (!userId) {
      return undefined;
    }

    return `user:${userId}:${baseKey}`;
  }
}
