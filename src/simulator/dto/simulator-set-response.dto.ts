import { SimulatorSet } from '../entities/simulator-set.entity';
import { SimulatorSetItem } from '../entities/simulator-set-item.entity';

export class SimulatorSetResponseDto {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  isActive: boolean;
  items: {
    id: string;
    productId: string;
    categoryId: string;
  }[];
  createdAt: Date;
  updatedAt: Date;

  constructor(simulatorSet: SimulatorSet, items: SimulatorSetItem[]) {
    this.id = simulatorSet.id;
    this.userId = simulatorSet.userId;
    this.name = simulatorSet.name;
    this.description = simulatorSet.description;
    this.isActive = simulatorSet.isActive;
    this.items = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      categoryId: item.categoryId,
    }));
    this.createdAt = simulatorSet.createdAt;
    this.updatedAt = simulatorSet.updatedAt;
  }
}

export class PaginatedSimulatorSetResponseDto {
  data: SimulatorSetResponseDto[];
  total: number;
  page: number;
  take: number;
  totalPages: number;

  constructor(
    data: SimulatorSetResponseDto[],
    total: number,
    page: number,
    take: number,
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.take = take;
    this.totalPages = Math.ceil(total / take);
  }
}
