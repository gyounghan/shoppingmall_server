import { Test, TestingModule } from '@nestjs/testing';
import { ConsultingService } from './consulting.service';
import { ConsultingRepository } from './repositories/consulting.repository';
import { CreateConsultingRequestDto } from './dto/create-consulting-request.dto';

describe('ConsultingService', () => {
  let service: ConsultingService;

  const mockRequest = {
    id: 'req-123',
    userId: 'user-123',
    title: '컨설팅 제목',
    content: '내용',
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockConsultingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultingService,
        {
          provide: ConsultingRepository,
          useValue: mockConsultingRepository,
        },
      ],
    }).compile();

    service = module.get<ConsultingService>(ConsultingService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('컨설팅 신청을 생성한다', async () => {
      const dto: CreateConsultingRequestDto = {
        title: '컨설팅 제목',
        content: '내용',
      };
      mockConsultingRepository.create.mockReturnValue(mockRequest);
      mockConsultingRepository.save.mockResolvedValue(mockRequest);

      const result = await service.create('user-123', dto);

      expect(mockConsultingRepository.create).toHaveBeenCalledWith({
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
    it('사용자의 컨설팅 목록을 반환한다', async () => {
      mockConsultingRepository.findByUser.mockResolvedValue([mockRequest]);

      const result = await service.findMine('user-123');

      expect(mockConsultingRepository.findByUser).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-123');
    });
  });
});
