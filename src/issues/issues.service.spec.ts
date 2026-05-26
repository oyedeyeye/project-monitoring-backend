import { Test, TestingModule } from '@nestjs/testing';
import { IssuesService } from './issues.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

describe('IssuesService', () => {
  let service: IssuesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesService,
        {
          provide: PrismaService,
          useValue: {
            issue: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<IssuesService>(IssuesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all issues for a given projectId', async () => {
      const mockIssues = [
        { id: '1', projectId: 'proj1', issueCategory: 'Budget', issueItem: 'Delay', status: 'Open' },
      ];
      (prismaService.issue.findMany as jest.Mock).mockResolvedValue(mockIssues);

      const result = await service.findAll('proj1');
      expect(result).toEqual(mockIssues);
      expect(prismaService.issue.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new issue', async () => {
      const mockDto: Prisma.IssueUncheckedCreateInput = {
        projectId: 'proj1',
        logDate: new Date(),
        issueCategory: 'Budget',
        issueItem: 'Delay',
        severity: 3,
        owner: 'user1',
        dueDate: new Date(),
        notes: 'Some notes',
      };
      const mockCreatedIssue = { id: '1', ...mockDto };
      (prismaService.issue.create as jest.Mock).mockResolvedValue(mockCreatedIssue);

      const result = await service.create(mockDto);
      expect(result).toEqual(mockCreatedIssue);
      expect(prismaService.issue.create).toHaveBeenCalledWith({
        data: mockDto,
      });
    });
  });
});
