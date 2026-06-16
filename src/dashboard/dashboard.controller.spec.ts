import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Role } from '@prisma/client';

describe('DashboardController', () => {
    let controller: DashboardController;
    let service: DashboardService;

    const mockDashboardService = {
        getOverview: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DashboardController],
            providers: [
                {
                    provide: DashboardService,
                    useValue: mockDashboardService,
                },
            ],
        }).compile();

        controller = module.get<DashboardController>(DashboardController);
        service = module.get<DashboardService>(DashboardService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getOverview', () => {
        it('should call service with user and mdaId query', async () => {
            const mockUser = { role: Role.WEBMASTER_ADMIN };
            const mdaIdQuery = 'test-mda-id';
            const mockReq = { user: mockUser };
            
            mockDashboardService.getOverview.mockResolvedValue('mockResult');

            const result = await controller.getOverview(mockReq, mdaIdQuery);

            expect(service.getOverview).toHaveBeenCalledWith(mockUser, mdaIdQuery);
            expect(result).toBe('mockResult');
        });
    });
});
