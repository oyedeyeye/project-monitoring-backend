import { Module } from '@nestjs/common';
import { MdasController } from './mdas.controller';
import { MdasService } from './mdas.service';

@Module({
  controllers: [MdasController],
  providers: [MdasService]
})
export class MdasModule {}
