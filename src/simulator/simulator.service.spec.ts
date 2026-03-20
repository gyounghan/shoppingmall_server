import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SimulatorService } from './simulator.service';
import { SimulatorRepository } from './repositories/simulator.repository';
import { SimulatorSet } from './entities/simulator-set.entity';
import { SimulatorSetItem } from './entities/simulator-set-item.entity';
import { CreateSimulatorSetDto } from './dto/create-simulator-set.dto';

describe('SimulatorService', () => {
  let service: SimulatorService;

  const mockSet: SimulatorSet = {
    id: 'set-123',
    userId: 'user-123',
    name: '세트명',
    description: '설명',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockItems: SimulatorSetItem[] = [
    {
      id: 'item-1',
      simulatorSetId: 'set-123',
      productId: 'prod-1',
      categoryId: 'cat-1',
    } as SimulatorSetItem,
  ];

  const mockSimulatorRepository = {
    countByUser: jest.fn(),
    createSet: jest.fn(),
    saveSet: jest.fn(),
    removeSet: jest.fn(),
    createItem: jest.fn(),
    saveItems: jest.fn(),
    findItemsBySetId: jest.fn(),
    deleteItemsBySetId: jest.fn(),
    findSetByIdAndUser: jest.fn(),
    findAllByUser: jest.fn().mockResolvedValue([[mockSet], 1]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulatorService,
        { provide: SimulatorRepository, useValue: mockSimulatorRepository },
      ],
    }).compile();

    service = module.get<SimulatorService>(SimulatorService);
    jest.clearAllMocks();
    mockSimulatorRepository.findAllByUser.mockResolvedValue([[mockSet], 1]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('시뮬레이터 세트를 생성한다', async () => {
      const dto: CreateSimulatorSetDto = {
        name: '세트명',
        description: '설명',
        items: [{ productId: 'prod-1', categoryId: 'cat-1' }],
      };
      mockSimulatorRepository.countByUser.mockResolvedValue(0);
      mockSimulatorRepository.createSet.mockReturnValue(mockSet);
      mockSimulatorRepository.saveSet.mockResolvedValue(mockSet);
      mockSimulatorRepository.createItem.mockImplementation((obj) => obj);
      mockSimulatorRepository.saveItems.mockResolvedValue(mockItems);

      const result = await service.create('user-123', dto);

      expect(mockSimulatorRepository.createSet).toHaveBeenCalledWith({
        userId: 'user-123',
        name: dto.name,
        description: dto.description,
        isActive: true,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].productId).toBe('prod-1');
      expect(result.items[0].categoryId).toBe('cat-1');
    });

    it('유저별 최대 3개 제한을 적용한다', async () => {
      const dto: CreateSimulatorSetDto = {
        name: '세트명',
        description: '설명',
        items: [{ productId: 'prod-1', categoryId: 'cat-1' }],
      };
      mockSimulatorRepository.countByUser.mockResolvedValue(3);

      await expect(service.create('user-123', dto)).rejects.toThrow(BadRequestException);
      expect(mockSimulatorRepository.createSet).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('페이지네이션된 세트 목록을 반환한다', async () => {
      mockSimulatorRepository.findItemsBySetId.mockResolvedValue(mockItems);

      const result = await service.findAll('user-123', {});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('세트를 조회한다', async () => {
      mockSimulatorRepository.findSetByIdAndUser.mockResolvedValue(mockSet);
      mockSimulatorRepository.findItemsBySetId.mockResolvedValue(mockItems);

      const result = await service.findOne('user-123', 'set-123');

      expect(result.id).toBe('set-123');
      expect(result.items).toHaveLength(1);
    });

    it('존재하지 않으면 NotFoundException을 던진다', async () => {
      mockSimulatorRepository.findSetByIdAndUser.mockResolvedValue(null);

      await expect(service.findOne('user-123', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('user-123', 'nonexistent')).rejects.toThrow(
        '시뮬레이터 세트를 찾을 수 없습니다',
      );
    });
  });

  describe('update', () => {
    it('세트를 수정한다', async () => {
      mockSimulatorRepository.findSetByIdAndUser.mockResolvedValue(mockSet);
      mockSimulatorRepository.saveSet.mockResolvedValue({
        ...mockSet,
        name: '수정된 이름',
      });
      mockSimulatorRepository.deleteItemsBySetId.mockResolvedValue(undefined);
      mockSimulatorRepository.createItem.mockImplementation((obj) => obj);
      mockSimulatorRepository.saveItems.mockResolvedValue(mockItems);
      mockSimulatorRepository.findItemsBySetId.mockResolvedValue(mockItems);

      const result = await service.update('user-123', 'set-123', {
        name: '수정된 이름',
      });

      expect(result.name).toBe('수정된 이름');
    });

    it('존재하지 않으면 NotFoundException을 던진다', async () => {
      mockSimulatorRepository.findSetByIdAndUser.mockResolvedValue(null);

      await expect(
        service.update('user-123', 'nonexistent', { name: '이름' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('세트를 삭제한다', async () => {
      mockSimulatorRepository.findSetByIdAndUser.mockResolvedValue(mockSet);

      await service.remove('user-123', 'set-123');

      expect(mockSimulatorRepository.removeSet).toHaveBeenCalledWith(mockSet);
    });

    it('존재하지 않으면 NotFoundException을 던진다', async () => {
      mockSimulatorRepository.findSetByIdAndUser.mockResolvedValue(null);

      await expect(service.remove('user-123', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
