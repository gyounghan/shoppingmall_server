import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsabilityServiceService } from './usability-service.service';
import { UsabilityServiceRequest } from './entities/usability-service-request.entity';
import { CreateUsabilityServiceRequestDto } from './dto/create-usability-service-request.dto';

describe('UsabilityServiceService', () => {
  let service: UsabilityServiceService;

  const mockRequest = {
    id: 'req-123',
    userId: 'user-123',
    title: '사용성 서비스 제목',
    content: '내용',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsabilityServiceService,
        {
          provide: getRepositoryToken(UsabilityServiceRequest),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsabilityServiceService>(UsabilityServiceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('사용성 서비스 신청을 생성한다', async () => {
      const dto: CreateUsabilityServiceRequestDto = {
        title: '사용성 서비스 제목',
        content: '내용',
      };
      mockRepository.create.mockReturnValue(mockRequest);
      mockRepository.save.mockResolvedValue(mockRequest);

      const result = await service.create('user-123', dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        title: dto.title,
        content: dto.content,
      });
      expect(result.id).toBe('req-123');
      expect(result.title).toBe(dto.title);
      expect(result.status).toBe('PENDING');
    });
  });

  describe('findMine', () => {
    it('사용자의 사용성 서비스 목록을 반환한다', async () => {
      mockRepository.find.mockResolvedValue([mockRequest]);

      const result = await service.findMine('user-123');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-123');
    });
  });
});
