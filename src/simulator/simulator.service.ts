import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSimulatorSetDto } from './dto/create-simulator-set.dto';
import { UpdateSimulatorSetDto } from './dto/update-simulator-set.dto';
import { QuerySimulatorSetDto } from './dto/query-simulator-set.dto';
import {
  PaginatedSimulatorSetResponseDto,
  SimulatorSetResponseDto,
} from './dto/simulator-set-response.dto';
import { SimulatorRepository } from './repositories/simulator.repository';

@Injectable()
export class SimulatorService {
  private static readonly MAX_SIMULATOR_SETS_PER_USER = 3;

  constructor(private readonly simulatorRepository: SimulatorRepository) {}

  async create(userId: string, createDto: CreateSimulatorSetDto): Promise<SimulatorSetResponseDto> {
    const ownedSetCount = await this.simulatorRepository.countByUser(userId);
    if (ownedSetCount >= SimulatorService.MAX_SIMULATOR_SETS_PER_USER) {
      throw new BadRequestException('유저별 시뮬레이터는 최대 3개까지 등록할 수 있습니다.');
    }

    const simulatorSet = this.simulatorRepository.createSet({
      userId,
      name: createDto.name,
      description: createDto.description ?? null,
      isActive: createDto.isActive ?? true,
    });
    const savedSet = await this.simulatorRepository.saveSet(simulatorSet);

    const items = createDto.items.map((item) =>
      this.simulatorRepository.createItem({
        simulatorSetId: savedSet.id,
        productId: item.productId,
        categoryId: item.categoryId,
      }),
    );
    const savedItems = await this.simulatorRepository.saveItems(items);

    return new SimulatorSetResponseDto(savedSet, savedItems);
  }

  async findAll(userId: string, queryDto: QuerySimulatorSetDto): Promise<PaginatedSimulatorSetResponseDto> {
    const { page = 1, take = 20 } = queryDto;
    const [sets, total] = await this.simulatorRepository.findAllByUser(userId, queryDto);

    const data = await Promise.all(
      sets.map(async (set) => {
        const items = await this.simulatorRepository.findItemsBySetId(set.id);
        return new SimulatorSetResponseDto(set, items);
      }),
    );

    return new PaginatedSimulatorSetResponseDto(data, total, page, take);
  }

  async findOne(userId: string, id: string): Promise<SimulatorSetResponseDto> {
    const simulatorSet = await this.simulatorRepository.findSetByIdAndUser(id, userId);
    if (!simulatorSet) {
      throw new NotFoundException(`시뮬레이터 세트를 찾을 수 없습니다. (ID: ${id})`);
    }
    const items = await this.simulatorRepository.findItemsBySetId(id);
    return new SimulatorSetResponseDto(simulatorSet, items);
  }

  async update(
    userId: string,
    id: string,
    updateDto: UpdateSimulatorSetDto,
  ): Promise<SimulatorSetResponseDto> {
    const simulatorSet = await this.simulatorRepository.findSetByIdAndUser(id, userId);
    if (!simulatorSet) {
      throw new NotFoundException(`시뮬레이터 세트를 찾을 수 없습니다. (ID: ${id})`);
    }

    if (updateDto.name !== undefined) simulatorSet.name = updateDto.name;
    if (updateDto.description !== undefined) simulatorSet.description = updateDto.description ?? null;
    if (updateDto.isActive !== undefined) simulatorSet.isActive = updateDto.isActive;

    const updatedSet = await this.simulatorRepository.saveSet(simulatorSet);

    if (updateDto.items) {
      await this.simulatorRepository.deleteItemsBySetId(id);
      const recreatedItems = updateDto.items.map((item) =>
        this.simulatorRepository.createItem({
          simulatorSetId: id,
          productId: item.productId,
          categoryId: item.categoryId,
        }),
      );
      await this.simulatorRepository.saveItems(recreatedItems);
    }

    const items = await this.simulatorRepository.findItemsBySetId(id);
    return new SimulatorSetResponseDto(updatedSet, items);
  }

  async remove(userId: string, id: string): Promise<void> {
    const simulatorSet = await this.simulatorRepository.findSetByIdAndUser(id, userId);
    if (!simulatorSet) {
      throw new NotFoundException(`시뮬레이터 세트를 찾을 수 없습니다. (ID: ${id})`);
    }
    await this.simulatorRepository.removeSet(simulatorSet);
  }
}
