import { Test, TestingModule } from '@nestjs/testing';
import { PowerBiController } from './power-bi.controller';
import { PowerBiService } from './power-bi.service';
import { Response } from 'express';

describe('PowerBiController', () => {
    let controller: PowerBiController;
    let service: PowerBiService;

    const mockPowerBiService = {
        getTablesStructure: jest.fn(),
        getTableSample: jest.fn(),
        getTableData: jest.fn(),
        generateCsv: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PowerBiController],
            providers: [
                { provide: PowerBiService, useValue: mockPowerBiService },
            ],
        }).compile();

        controller = module.get<PowerBiController>(PowerBiController);
        service = module.get<PowerBiService>(PowerBiService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getTablesStructure', () => {
        it('should call getTablesStructure on the service', () => {
            mockPowerBiService.getTablesStructure.mockReturnValue([{ name: 'MDA' }]);
            const res = controller.getTablesStructure();
            expect(res).toEqual([{ name: 'MDA' }]);
            expect(service.getTablesStructure).toHaveBeenCalled();
        });
    });

    describe('getTableSample', () => {
        it('should call getTableSample on the service with the table name', async () => {
            mockPowerBiService.getTableSample.mockResolvedValue([{ id: '1' }]);
            const res = await controller.getTableSample('MDA');
            expect(res).toEqual([{ id: '1' }]);
            expect(service.getTableSample).toHaveBeenCalledWith('MDA');
        });
    });

    describe('exportTableSample', () => {
        it('should generate CSV and set headers correctly on express response', async () => {
            mockPowerBiService.generateCsv.mockResolvedValue('id,name\n1,Test');
            
            const mockRes = {
                setHeader: jest.fn(),
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            } as unknown as Response;

            await controller.exportTableSample('MDA', mockRes);

            expect(service.generateCsv).toHaveBeenCalledWith('MDA');
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
            expect(mockRes.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename="mda-sample.csv"'
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.send).toHaveBeenCalledWith('id,name\n1,Test');
        });
    });

    describe('getTableData', () => {
        it('should call getTableData with default pagination parameters', async () => {
            mockPowerBiService.getTableData.mockResolvedValue({ data: [], meta: { page: 1, limit: 1000 } });
            
            const res = await controller.getTableData('MDA');
            
            expect(res).toEqual({ data: [], meta: { page: 1, limit: 1000 } });
            expect(service.getTableData).toHaveBeenCalledWith('MDA', 1, 1000);
        });

        it('should parse page and limit strings and call getTableData', async () => {
            mockPowerBiService.getTableData.mockResolvedValue({ data: [], meta: { page: 3, limit: 50 } });
            
            const res = await controller.getTableData('Project', '3', '50');
            
            expect(res).toEqual({ data: [], meta: { page: 3, limit: 50 } });
            expect(service.getTableData).toHaveBeenCalledWith('Project', 3, 50);
        });
    });
});
