import { Test, TestingModule } from '@nestjs/testing';
import { IssuesService } from './issues.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';

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
              // Used by the ownership pre-check on write paths.
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            project: {
              findFirst: jest.fn(),
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

      const user = { role: Role.WEBMASTER_ADMIN };
      const result = await service.findAll(user as any, 'proj1');
      expect(result).toEqual(mockIssues);
      expect(prismaService.issue.findMany).toHaveBeenCalledWith({
        where: { projectId: 'proj1', project: expect.objectContaining({ isArchived: false }) },
        include: {
          project: {
            include: {
              mda: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return issues scoped to MDA and exclude archived for MDA_OFFICER', async () => {
      const mockIssues = [];
      (prismaService.issue.findMany as jest.Mock).mockResolvedValue(mockIssues);

      const user = { role: Role.MDA_OFFICER, mdaId: 'mda1' };
      const result = await service.findAll(user as any, undefined);
      expect(result).toEqual(mockIssues);
      expect(prismaService.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { project: { mdaId: 'mda1', isArchived: false } }
        })
      );
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

      const user = { role: Role.WEBMASTER_ADMIN };
      const result = await service.create(mockDto, user as any);
      expect(result).toEqual(mockCreatedIssue);
      expect(prismaService.issue.create).toHaveBeenCalledWith({
        data: mockDto,
      });
    });

    it('should reject an MDA_OFFICER logging an issue against another MDA project', async () => {
      (prismaService.project.findFirst as jest.Mock).mockResolvedValue(null);

      const mockDto = { projectId: 'other-mda-project' } as Prisma.IssueUncheckedCreateInput;
      const user = { role: Role.MDA_OFFICER, mdaId: 'mda1' };

      await expect(service.create(mockDto, user as any)).rejects.toThrow(
        'Project not found or access denied',
      );
      expect(prismaService.issue.create).not.toHaveBeenCalled();
    });
  });

  describe('ownership enforcement on writes', () => {
    it('should let an MDA_OFFICER update an issue in their own MDA', async () => {
      (prismaService.issue.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
      (prismaService.issue.update as jest.Mock).mockResolvedValue({ id: '1' });

      const user = { role: Role.MDA_OFFICER, mdaId: 'mda1' };
      await service.update('1', { status: 'Resolved' }, user as any);

      expect(prismaService.issue.findFirst).toHaveBeenCalledWith({
        where: { id: '1', project: { mdaId: 'mda1' } },
      });
      expect(prismaService.issue.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { status: 'Resolved' },
      });
    });

    it('should 404 when an MDA_OFFICER updates another MDA issue', async () => {
      (prismaService.issue.findFirst as jest.Mock).mockResolvedValue(null);

      const user = { role: Role.MDA_OFFICER, mdaId: 'mda1' };
      await expect(
        service.update('other', { status: 'Resolved' }, user as any),
      ).rejects.toThrow('Issue not found or access denied');
      expect(prismaService.issue.update).not.toHaveBeenCalled();
    });

    it('should 404 when an MDA_OFFICER deletes another MDA issue', async () => {
      (prismaService.issue.findFirst as jest.Mock).mockResolvedValue(null);

      const user = { role: Role.MDA_OFFICER, mdaId: 'mda1' };
      await expect(service.remove('other', user as any)).rejects.toThrow(
        'Issue not found or access denied',
      );
      expect(prismaService.issue.delete).not.toHaveBeenCalled();
    });

    it('should strip projectId so an issue cannot be moved to another MDA', async () => {
      (prismaService.issue.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
      (prismaService.issue.update as jest.Mock).mockResolvedValue({ id: '1' });

      const user = { role: Role.MDA_OFFICER, mdaId: 'mda1' };
      await service.update('1', { projectId: 'foreign-project', notes: 'x' }, user as any);

      expect(prismaService.issue.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { notes: 'x' },
      });
    });

    it('should not scope an admin to a single MDA', async () => {
      (prismaService.issue.findFirst as jest.Mock).mockResolvedValue({ id: '1' });
      (prismaService.issue.update as jest.Mock).mockResolvedValue({ id: '1' });

      const user = { role: Role.WEBMASTER_ADMIN };
      await service.update('1', { notes: 'x' }, user as any);

      expect(prismaService.issue.findFirst).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
