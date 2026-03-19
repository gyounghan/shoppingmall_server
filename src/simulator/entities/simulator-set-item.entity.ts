import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { SimulatorSet } from './simulator-set.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('simulator_set_items')
@Unique(['simulatorSetId', 'categoryId'])
export class SimulatorSetItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  simulatorSetId: string;

  @ManyToOne(() => SimulatorSet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'simulatorSetId' })
  simulatorSet: SimulatorSet;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
