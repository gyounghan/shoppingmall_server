import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimulatorSet } from '../entities/simulator-set.entity';
import { SimulatorSetItem } from '../entities/simulator-set-item.entity';
import { QuerySimulatorSetDto } from '../dto/query-simulator-set.dto';

@Injectable()
export class SimulatorRepository {
  constructor(
    @InjectRepository(SimulatorSet)
    private readonly simulatorSetRepo: Repository<SimulatorSet>,
    @InjectRepository(SimulatorSetItem)
    private readonly simulatorSetItemRepo: Repository<SimulatorSetItem>,
  ) {}

  countByUser(userId: string): Promise<number> {
    return this.simulatorSetRepo.count({ where: { userId } });
  }

  createSet(data: Partial<SimulatorSet>): SimulatorSet {
    return this.simulatorSetRepo.create(data as SimulatorSet);
  }

  saveSet(set: SimulatorSet): Promise<SimulatorSet> {
    return this.simulatorSetRepo.save(set);
  }

  removeSet(set: SimulatorSet): Promise<SimulatorSet> {
    return this.simulatorSetRepo.remove(set);
  }

  createItem(data: Partial<SimulatorSetItem>): SimulatorSetItem {
    return this.simulatorSetItemRepo.create(data as SimulatorSetItem);
  }

  saveItems(items: SimulatorSetItem[]): Promise<SimulatorSetItem[]> {
    return this.simulatorSetItemRepo.save(items);
  }

  findItemsBySetId(simulatorSetId: string): Promise<SimulatorSetItem[]> {
    return this.simulatorSetItemRepo.find({ where: { simulatorSetId } });
  }

  deleteItemsBySetId(simulatorSetId: string): Promise<void> {
    return this.simulatorSetItemRepo
      .delete({ simulatorSetId })
      .then(() => undefined);
  }

  findSetByIdAndUser(id: string, userId: string): Promise<SimulatorSet | null> {
    return this.simulatorSetRepo.findOne({ where: { id, userId } });
  }

  async findAllByUser(
    userId: string,
    queryDto: QuerySimulatorSetDto,
  ): Promise<[SimulatorSet[], number]> {
    const { search, isActive, page = 1, take = 20 } = queryDto;

    const qb = this.simulatorSetRepo
      .createQueryBuilder('set')
      .where('set.userId = :userId', { userId });

    if (search) {
      qb.andWhere('set.name LIKE :search', { search: `%${search}%` });
    }
    if (isActive !== undefined) {
      qb.andWhere('set.isActive = :isActive', { isActive });
    }

    qb.orderBy('set.createdAt', 'DESC').skip((page - 1) * take).take(take);

    return qb.getManyAndCount();
  }
}
