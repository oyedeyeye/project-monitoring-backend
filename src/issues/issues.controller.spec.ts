import { Test, TestingModule } from '@nestjs/testing';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('IssuesController', () => {
  let controller: IssuesController;
  let service: IssuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssuesController],
      providers: [
        {
          provide: IssuesService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<IssuesController>(IssuesController);
    service = module.get<IssuesService>(IssuesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all issues for a projectId', async () => {
      const mockIssues = [
        { id: '1', projectId: 'proj1', issueCategory: 'Budget', issueItem: 'Delay', status: 'Open' },
      ];
      (service.findAll as jest.Mock).mockResolvedValue(mockIssues);

      const result = await controller.findAll('proj1');
      expect(result).toEqual(mockIssues);
      expect(service.findAll).toHaveBeenCalledWith('proj1');
    });
  });

  describe('create', () => {
    it('should create an issue', async () => {
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
      (service.create as jest.Mock).mockResolvedValue(mockCreatedIssue);

      const result = await controller.create(mockDto);
      expect(result).toEqual(mockCreatedIssue);
      expect(service.create).toHaveBeenCalledWith(mockDto);
    });
  });
});
