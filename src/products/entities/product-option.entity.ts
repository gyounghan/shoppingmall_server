import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_options')
export class ProductOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'varchar', length: 100 })
  name: string; // 예: '12인치', '16인치', '19인치'

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number; // 옵션별 추가 가격 (선택사항)

  @Column({ type: 'int', default: 0 })
  stock: number; // 옵션별 재고

  @Column({ type: 'int', default: 0 })
  order: number; // 정렬 순서

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
