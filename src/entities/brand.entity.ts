import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('brands')
export class Brand {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    slug: string; // 'lowrance', 'garmin' 등 URL 친화적 ID

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    logo: string; // 로고 이미지 URL 또는 텍스트 (서버에서 관리하는 이미지 URL)

    @Column({ type: 'varchar', length: 100, nullable: true })
    backgroundColor: string; // 'bg-white', 'bg-black', 'oklch(...)' 등

    @Column({ type: 'varchar', length: 100, nullable: true })
    gradientColor: string; // 'from-red-600 to-red-800' 등

    @Column({ type: 'boolean', default: false })
    hasLogo: boolean; // 로고 이미지 파일이 있는지 여부

    @Column({ type: 'boolean', default: false })
    hasOverlay: boolean; // 오버레이 효과가 필요한지 여부

    @Column({ type: 'int', default: 0 })
    productCount: number; // 제품 수 (캐시용, 실제는 제품 모듈에서 계산)

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

