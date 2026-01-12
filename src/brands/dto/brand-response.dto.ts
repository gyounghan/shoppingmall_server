import { Brand } from '../../entities/brand.entity';

export class BrandResponseDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  logoUrl: string; // 완전한 이미지 URL
  backgroundColor: string;
  gradientColor: string;
  hasLogo: boolean;
  hasOverlay: boolean;
  productCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(brand: Brand, baseUrl?: string) {
    this.id = brand.id;
    this.slug = brand.slug;
    this.name = brand.name;
    this.description = brand.description;
    this.logo = brand.logo;
    // logo가 URL 형식이면 그대로 사용, 아니면 baseUrl과 결합
    this.logoUrl = brand.logo?.startsWith('http')
      ? brand.logo
      : brand.logo?.startsWith('/')
        ? `${baseUrl || 'http://localhost:3000'}${brand.logo}`
        : brand.logo || '';
    this.backgroundColor = brand.backgroundColor;
    this.gradientColor = brand.gradientColor;
    this.hasLogo = brand.hasLogo;
    this.hasOverlay = brand.hasOverlay;
    this.productCount = brand.productCount;
    this.isActive = brand.isActive;
    this.createdAt = brand.createdAt;
    this.updatedAt = brand.updatedAt;
  }
}

