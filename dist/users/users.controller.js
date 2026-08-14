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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const bcrypt = __importStar(require("bcrypt"));
const user_scoped_cache_interceptor_1 = require("../common/interceptors/user-scoped-cache.interceptor");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    findAll(req, pageStr, limitStr, roleStr) {
        const page = pageStr ? parseInt(pageStr, 10) : 1;
        const limit = limitStr ? parseInt(limitStr, 10) : 25;
        const requestingRole = req.user.role;
        let role = roleStr;
        if (requestingRole === client_1.Role.PPIMU_ADMIN) {
            role = client_1.Role.MDA_OFFICER;
        }
        return this.usersService.findAll({ page, limit, role });
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    async update(req, id, updateUserDto) {
        const targetUser = (await this.usersService.findById(id));
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (req.user.role === client_1.Role.PPIMU_ADMIN &&
            targetUser.profile?.role !== client_1.Role.MDA_OFFICER) {
            throw new common_1.ForbiddenException('You can only perform operations on MDA Officers');
        }
        const data = { ...updateUserDto };
        if (data.password && data.password.trim() !== '') {
            data.passwordHash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }
        else {
            delete data.password;
        }
        return this.usersService.update(id, data);
    }
    async remove(req, id) {
        const targetUser = (await this.usersService.findById(id));
        if (!targetUser) {
            throw new common_1.NotFoundException('User not found');
        }
        if (req.user.role === client_1.Role.PPIMU_ADMIN &&
            targetUser.profile?.role !== client_1.Role.MDA_OFFICER) {
            throw new common_1.ForbiddenException('You can only perform operations on MDA Officers');
        }
        return this.usersService.remove(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN, client_1.Role.PPIMU_ADMIN),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve all users' }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: 'Page number (default: 1)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Items per page (default: 25)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, description: 'Filter by role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all users returned' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized / Missing token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden / Invalid Role' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN, client_1.Role.PPIMU_ADMIN),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user manually' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string' },
                passwordHash: { type: 'string' },
                profile: { type: 'object' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User successfully created' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized / Missing token' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden / Invalid Role' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN, client_1.Role.PPIMU_ADMIN),
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User UUID' }),
    (0, swagger_1.ApiBody)({
        schema: { type: 'object', properties: { email: { type: 'string' } } },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User successfully updated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.WEBMASTER_ADMIN, client_1.Role.PPIMU_ADMIN),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User successfully deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(user_scoped_cache_interceptor_1.UserScopedCacheInterceptor),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map