import { Test, TestingModule } from '@nestjs/testing';
import { MdasController } from './mdas.controller';

import { MdasService } from './mdas.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('MdasController', () => {
  let controller: MdasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MdasController],
      providers: [
        { provide: MdasService, useValue: {} },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get<MdasController>(MdasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
