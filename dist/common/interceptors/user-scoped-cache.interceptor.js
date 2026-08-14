"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserScopedCacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let UserScopedCacheInterceptor = class UserScopedCacheInterceptor extends cache_manager_1.CacheInterceptor {
    trackBy(context) {
        const baseKey = super.trackBy(context);
        if (!baseKey) {
            return undefined;
        }
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        if (!userId) {
            return undefined;
        }
        return `user:${userId}:${baseKey}`;
    }
};
exports.UserScopedCacheInterceptor = UserScopedCacheInterceptor;
exports.UserScopedCacheInterceptor = UserScopedCacheInterceptor = __decorate([
    (0, common_1.Injectable)()
], UserScopedCacheInterceptor);
//# sourceMappingURL=user-scoped-cache.interceptor.js.map