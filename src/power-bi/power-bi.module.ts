import { Module } from '@nestjs/common';
import { PowerBiController } from './power-bi.controller';
import { PowerBiService } from './power-bi.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PowerBiController],
    providers: [PowerBiService],
})
export class PowerBiModule {}
