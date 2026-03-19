import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulatorSet } from './entities/simulator-set.entity';
import { SimulatorSetItem } from './entities/simulator-set-item.entity';
import { CreateSimulatorSetDto } from './dto/create-simulator-set.dto';
import { UpdateSimulatorSetDto } from './dto/update-simulator-set.dto';
import { QuerySimulatorSetDto } from './dto/query-simulator-set.dto';
import {
  PaginatedSimulatorSetResponseDto,
  SimulatorSetResponseDto,
} from './dto/simulator-set-response.dto';

@Injectable()
export class SimulatorService {
  private static readonly MAX_SIMULATOR_SETS_PER_USER = 3;

  constructor(
    @InjectRepository(SimulatorSet)
    private readonly simulatorSetRepository: Repository<SimulatorSet>,
    @InjectRepository(SimulatorSetItem)
    private readonly simulatorSetItemRepository: Repository<SimulatorSetItem>,
  ) {}

  async create(
    userId: string,
    createDto: CreateSimulatorSetDto,
  ): Promise<SimulatorSetResponseDto> {
    const ownedSetCount = await this.simulatorSetRepository.count({
      where: { userId },
    });
    if (ownedSetCount >= SimulatorService.MAX_SIMULATOR_SETS_PER_USER) {
      throw new BadRequestException('유저별 시뮬레이터는 최대 3개까지 등록할 수 있습니다.');
    }

    const simulatorSet = this.simulatorSetRepository.create({
      userId,
      name: createDto.name,
      description: createDto.description,
      isActive: createDto.isActive ?? true,
    });
    const savedSet = await this.simulatorSetRepository.save(simulatorSet);

    const items = createDto.items.map((item) =>
      this.simulatorSetItemRepository.create({
        simulatorSetId: savedSet.id,
        productId: item.productId,
        categoryId: item.categoryId,
      }),
    );
    const savedItems = await this.simulatorSetItemRepository.save(items);
    return new SimulatorSetResponseDto(savedSet, savedItems);
  }

  async findAll(
    userId: string,
    queryDto: QuerySimulatorSetDto,
  ): Promise<PaginatedSimulatorSetResponseDto> {
    const { search, isActive, page = 1, take = 20 } = queryDto;
    const qb = this.simulatorSetRepository
      .createQueryBuilder('set')
      .where('set.userId = :userId', { userId });

    if (search) {
      qb.andWhere('set.name LIKE :search', { search: `%${search}%` });
    }
    if (isActive !== undefined) {
      qb.andWhere('set.isActive = :isActive', { isActive });
    }

    qb.orderBy('set.createdAt', 'DESC').skip((page - 1) * take).take(take);
    const [sets, total] = await qb.getManyAndCount();

    const data = await Promise.all(
      sets.map(async (set) => {
        const items = await this.simulatorSetItemRepository.find({
          where: { simulatorSetId: set.id },
        });
        return new SimulatorSetResponseDto(set, items);
      }),
    );

    return new PaginatedSimulatorSetResponseDto(data, total, page, take);
  }

  async findOne(userId: string, id: string): Promise<SimulatorSetResponseDto> {
    const simulatorSet = await this.simulatorSetRepository.findOne({
      where: { id, userId },
    });
    if (!simulatorSet) {
      throw new NotFoundException(`시뮬레이터 세트를 찾을 수 없습니다. (ID: ${id})`);
    }
    const items = await this.simulatorSetItemRepository.find({
      where: { simulatorSetId: id },
    });
    return new SimulatorSetResponseDto(simulatorSet, items);
  }

  async update(
    userId: string,
    id: string,
    updateDto: UpdateSimulatorSetDto,
  ): Promise<SimulatorSetResponseDto> {
    const simulatorSet = await this.simulatorSetRepository.findOne({
      where: { id, userId },
    });
    if (!simulatorSet) {
      throw new NotFoundException(`시뮬레이터 세트를 찾을 수 없습니다. (ID: ${id})`);
    }

    if (updateDto.name !== undefined) simulatorSet.name = updateDto.name;
    if (updateDto.description !== undefined) simulatorSet.description = updateDto.description;
    if (updateDto.isActive !== undefined) simulatorSet.isActive = updateDto.isActive;
    const updatedSet = await this.simulatorSetRepository.save(simulatorSet);

    if (updateDto.items) {
      await this.simulatorSetItemRepository.delete({ simulatorSetId: id });
      const recreatedItems = updateDto.items.map((item) =>
        this.simulatorSetItemRepository.create({
          simulatorSetId: id,
          productId: item.productId,
          categoryId: item.categoryId,
        }),
      );
      await this.simulatorSetItemRepository.save(recreatedItems);
    }

    const items = await this.simulatorSetItemRepository.find({
      where: { simulatorSetId: id },
    });
    return new SimulatorSetResponseDto(updatedSet, items);
  }

  async remove(userId: string, id: string): Promise<void> {
    const simulatorSet = await this.simulatorSetRepository.findOne({
      where: { id, userId },
    });
    if (!simulatorSet) {
      throw new NotFoundException(`시뮬레이터 세트를 찾을 수 없습니다. (ID: ${id})`);
    }
    await this.simulatorSetRepository.remove(simulatorSet);
  }
}
