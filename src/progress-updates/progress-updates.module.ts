import { Module } from '@nestjs/common';
import { ProgressUpdatesController } from './progress-updates.controller';
import { ProgressUpdatesService } from './progress-updates.service';

@Module({
  controllers: [ProgressUpdatesController],
  providers: [ProgressUpdatesService]
})
export class ProgressUpdatesModule {}
