import { Test, TestingModule } from '@nestjs/testing';
import { MdasService } from './mdas.service';

import { PrismaService } from '../prisma/prisma.service';

describe('MdasService', () => {
  let service: MdasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MdasService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<MdasService>(MdasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
