"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerBiApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
let PowerBiApiKeyGuard = class PowerBiApiKeyGuard {
    normalizeKey(value) {
        return typeof value === 'string' && value.length > 0 ? value : null;
    }
    matches(provided, expected) {
        const providedBuf = Buffer.from(provided, 'utf8');
        const expectedBuf = Buffer.from(expected, 'utf8');
        if (providedBuf.length !== expectedBuf.length) {
            return false;
        }
        return crypto.timingSafeEqual(providedBuf, expectedBuf);
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const providedKey = this.normalizeKey(request.headers['x-api-key']) ??
            this.normalizeKey(request.query['api_key']);
        const expectedKey = process.env.POWERBI_API_KEY;
        if (!expectedKey) {
            throw new common_1.UnauthorizedException('API Key authentication is not configured on the server.');
        }
        if (!providedKey || !this.matches(providedKey, expectedKey)) {
            throw new common_1.UnauthorizedException('Invalid or missing API Key.');
        }
        return true;
    }
};
exports.PowerBiApiKeyGuard = PowerBiApiKeyGuard;
exports.PowerBiApiKeyGuard = PowerBiApiKeyGuard = __decorate([
    (0, common_1.Injectable)()
], PowerBiApiKeyGuard);
//# sourceMappingURL=powerbi-api-key.guard.js.map