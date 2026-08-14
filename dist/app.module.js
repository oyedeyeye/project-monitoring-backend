"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const mdas_module_1 = require("./mdas/mdas.module");
const projects_module_1 = require("./projects/projects.module");
const progress_updates_module_1 = require("./progress-updates/progress-updates.module");
const issues_module_1 = require("./issues/issues.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const email_module_1 = require("./email/email.module");
const notifications_module_1 = require("./notifications/notifications.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const power_bi_module_1 = require("./power-bi/power-bi.module");
const reports_module_1 = require("./reports/reports.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cache_manager_1.CacheModule.register({ isGlobal: true, ttl: 60000 }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            prisma_module_1.PrismaModule, users_module_1.UsersModule, auth_module_1.AuthModule, mdas_module_1.MdasModule, projects_module_1.ProjectsModule, progress_updates_module_1.ProgressUpdatesModule, issues_module_1.IssuesModule, email_module_1.EmailModule, notifications_module_1.NotificationsModule, dashboard_module_1.DashboardModule, power_bi_module_1.PowerBiModule, reports_module_1.ReportsModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard
            }
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map