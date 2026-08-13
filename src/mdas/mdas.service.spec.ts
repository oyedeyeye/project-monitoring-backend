import { Test, TestingModule } from '@nestjs/testing';
import { MdasService } from './mdas.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { PrismaService } from '../prisma/prisma.service';

describe('MdasService', () => {
  let service: MdasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MdasService,
        { provide: PrismaService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: { clear: jest.fn() } },
      ],
    }).compile();

    service = module.get<MdasService>(MdasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
