"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressUpdatesModule = void 0;
const common_1 = require("@nestjs/common");
const progress_updates_controller_1 = require("./progress-updates.controller");
const progress_updates_service_1 = require("./progress-updates.service");
let ProgressUpdatesModule = class ProgressUpdatesModule {
};
exports.ProgressUpdatesModule = ProgressUpdatesModule;
exports.ProgressUpdatesModule = ProgressUpdatesModule = __decorate([
    (0, common_1.Module)({
        controllers: [progress_updates_controller_1.ProgressUpdatesController],
        providers: [progress_updates_service_1.ProgressUpdatesService]
    })
], ProgressUpdatesModule);
//# sourceMappingURL=progress-updates.module.js.map