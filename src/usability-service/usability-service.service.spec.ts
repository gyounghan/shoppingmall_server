import { Test, TestingModule } from '@nestjs/testing';
import { UsabilityServiceService } from './usability-service.service';
import { UsabilityServiceRepository } from './repositories/usability-service.repository';
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

  const mockUsabilityServiceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsabilityServiceService,
        {
          provide: UsabilityServiceRepository,
          useValue: mockUsabilityServiceRepository,
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
      mockUsabilityServiceRepository.create.mockReturnValue(mockRequest);
      mockUsabilityServiceRepository.save.mockResolvedValue(mockRequest);

      const result = await service.create('user-123', dto);

      expect(mockUsabilityServiceRepository.create).toHaveBeenCalledWith({
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
      mockUsabilityServiceRepository.findByUser.mockResolvedValue([mockRequest]);

      const result = await service.findMine('user-123');

      expect(mockUsabilityServiceRepository.findByUser).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-123');
    });
  });
});
