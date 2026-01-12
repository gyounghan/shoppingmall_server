import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ProductTag {
  BEST = 'BEST',
  NEW = 'NEW',
  SALE = 'SALE',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string;

  @Column({
    type: 'enum',
    enum: ProductTag,
    nullable: true,
  })
  tag: ProductTag;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  brandId: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  categoryId: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountRate: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  salesCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

