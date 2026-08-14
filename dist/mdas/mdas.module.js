"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MdasModule = void 0;
const common_1 = require("@nestjs/common");
const mdas_controller_1 = require("./mdas.controller");
const mdas_service_1 = require("./mdas.service");
let MdasModule = class MdasModule {
};
exports.MdasModule = MdasModule;
exports.MdasModule = MdasModule = __decorate([
    (0, common_1.Module)({
        controllers: [mdas_controller_1.MdasController],
        providers: [mdas_service_1.MdasService]
    })
], MdasModule);
//# sourceMappingURL=mdas.module.js.map