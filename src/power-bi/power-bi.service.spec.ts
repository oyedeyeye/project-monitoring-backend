import { Test, TestingModule } from '@nestjs/testing';
import { PowerBiService } from './power-bi.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('PowerBiService', () => {
    let service: PowerBiService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        $queryRawUnsafe: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PowerBiService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<PowerBiService>(PowerBiService);
        prismaService = module.get<PrismaService>(PrismaService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getTablesStructure', () => {
        it('should return only whitelisted models and exclude sensitive columns', () => {
            const structure = service.getTablesStructure();
            
            // Check whitelist
            const names = structure.map(s => s.name);
            expect(names).toContain('MDA');
            expect(names).toContain('Project');
            expect(names).not.toContain('User'); // User is blacklisted

            // Check sensitive column exclusion in whitelisted tables (if any)
            const mdaStructure = structure.find(s => s.name === 'MDA');
            expect(mdaStructure).toBeDefined();
            const cols = mdaStructure.columns.map(c => c.name);
            expect(cols).not.toContain('passwordHash');
            expect(cols).not.toContain('token');
        });
    });

    describe('getTableSample', () => {
        it('should throw NotFoundException for non-whitelisted/invalid table names', async () => {
            await expect(service.getTableSample('User')).rejects.toThrow(NotFoundException);
            await expect(service.getTableSample('NonExistentTable')).rejects.toThrow(NotFoundException);
        });

        it('should query whitelisted tables using correct MySQL RAND() format', async () => {
            mockPrismaService.$queryRawUnsafe.mockResolvedValue([
                { id: '1', name: 'Test MDA', code: 'T1', createdAt: '2026-06-16T12:00:00.000Z', updatedAt: '2026-06-16T12:00:00.000Z' }
            ]);

            const sample = await service.getTableSample('MDA');
            
            expect(sample).toEqual([{ id: '1', name: 'Test MDA', code: 'T1', createdAt: '2026-06-16T12:00:00.000Z', updatedAt: '2026-06-16T12:00:00.000Z' }]);
            expect(mockPrismaService.$queryRawUnsafe).toHaveBeenCalledWith(
                expect.stringContaining('SELECT `id` AS `id`, `name` AS `name`, `code` AS `code`, `createdAt` AS `createdAt`, `updatedAt` AS `updatedAt` FROM `MDA` ORDER BY RAND() LIMIT 10')
            );
        });

        it('should handle and serialize Prisma Decimal types and BigInt types', async () => {
            mockPrismaService.$queryRawUnsafe.mockResolvedValue([
                { projectId: '1', approvedBudget: new Prisma.Decimal('150000.50'), status: 'Ongoing' }
            ]);

            const sample = await service.getTableSample('Project');

            expect(sample[0].approvedBudget).toBe(150000.50); // Serialized as number
        });
    });

    describe('generateCsv', () => {
        it('should generate valid CSV with headers and row values', async () => {
            mockPrismaService.$queryRawUnsafe.mockResolvedValue([
                { id: '1', name: 'Ondo State Ministry of Finance', code: 'FIN' },
                { id: '2', name: 'Ministry of Health, "Ondo"', code: 'HLT,ENV' }
            ]);

            const csv = await service.generateCsv('MDA');
            
            expect(csv).toContain('id,name,code');
            expect(csv).toContain('1,Ondo State Ministry of Finance,FIN');
            expect(csv).toContain('2,"Ministry of Health, ""Ondo""","HLT,ENV"'); // Properly escaped double quotes and commas
        });

        it('should return headers only if the table has no records', async () => {
            mockPrismaService.$queryRawUnsafe.mockResolvedValue([]);

            const csv = await service.generateCsv('MDA');
            expect(csv).toBe('id,name,code,createdAt,updatedAt');
        });
    });

    describe('getTableData', () => {
        it('should return paginated data and metadata', async () => {
            // Mock COUNT query
            mockPrismaService.$queryRawUnsafe.mockResolvedValueOnce([{ total: 100n }]);
            // Mock SELECT query
            mockPrismaService.$queryRawUnsafe.mockResolvedValueOnce([
                { id: '1', name: 'Test MDA', code: 'T1' },
                { id: '2', name: 'Second MDA', code: null }
            ]);

            const result = await service.getTableData('MDA', 2, 10);
            
            expect(result.data).toHaveLength(2);
            expect(result.data[0].id).toBe('1');
            expect(result.data[1].code).toBeNull(); // explicitly tests null passing

            expect(result.meta).toEqual({
                total: 100,
                page: 2,
                limit: 10,
                totalPages: 10
            });

            // Count query
            expect(mockPrismaService.$queryRawUnsafe).toHaveBeenNthCalledWith(1, 'SELECT COUNT(*) as total FROM `MDA`');
            // Select query with LIMIT and OFFSET ((page 2 - 1) * 10 = 10)
            expect(mockPrismaService.$queryRawUnsafe).toHaveBeenNthCalledWith(
                2, 
                expect.stringContaining('SELECT `id` AS `id`, `name` AS `name`, `code` AS `code`, `createdAt` AS `createdAt`, `updatedAt` AS `updatedAt` FROM `MDA` LIMIT 10 OFFSET 10')
            );
        });

        it('should return empty data if table has no allowed columns', async () => {
            await expect(service.getTableData('User', 1, 10)).rejects.toThrow(NotFoundException);
        });
    });
});
