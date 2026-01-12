import { DataSource } from 'typeorm';
import { Brand } from '../entities/brand.entity';

export const brandsSeedData = [
    {
        slug: 'lowrance',
        name: 'LOWRANCE',
        description: '낚시를 더 쉽게 만드는 어군탐지의 기준',
        logo: '/images/brands/lowrance_logo.png',
        backgroundColor: 'bg-white',
        gradientColor: 'from-red-600 to-red-800',
        hasLogo: true,
        hasOverlay: false,
        isActive: true,
    },
    {
        slug: 'garmin',
        name: 'GARMIN',
        description: '바다 위 모든 항해를 하나로 연결하는 기술',
        logo: '/images/brands/garmin_logo.png',
        backgroundColor: 'bg-black',
        gradientColor: 'from-blue-600 to-blue-800',
        hasLogo: true,
        hasOverlay: false,
        isActive: true,
    },
    {
        slug: 'simrad',
        name: 'SIMRAD',
        description: '프로가 신뢰하는 프리미엄 항해 전자장비',
        logo: '/images/brands/simrad_logo.png',
        backgroundColor: 'oklch(0.56 0.23 27.53)',
        gradientColor: 'from-green-600 to-green-800',
        hasLogo: true,
        hasOverlay: false,
        isActive: true,
    },
    {
        slug: 'camel',
        name: 'CAMEL',
        description: '현장에서 검증된 어선용 전자장비',
        logo: 'CAMEL',
        backgroundColor: null,
        gradientColor: 'from-purple-600 to-purple-800',
        hasLogo: false,
        hasOverlay: true,
        isActive: true,
    },
    {
        slug: 'standard-horizon',
        name: 'STANDARD HORIZON',
        description: '바다 위 안전을 지켜주는 해양 무전기의 표준',
        logo: 'STANDARD HORIZON',
        backgroundColor: null,
        gradientColor: 'from-orange-600 to-orange-800',
        hasLogo: false,
        hasOverlay: true,
        isActive: true,
    },
    {
        slug: 'g-zyro',
        name: 'G-ZYRO',
        description: '흔들림 없는 항해를 만드는 자이로 기술',
        logo: 'G-ZYRO',
        backgroundColor: null,
        gradientColor: 'from-teal-600 to-teal-800',
        hasLogo: false,
        hasOverlay: true,
        isActive: true,
    },
];

export async function seedBrands(dataSource: DataSource) {
    const brandRepository = dataSource.getRepository(Brand);

    for (const brandData of brandsSeedData) {
        const existingBrand = await brandRepository.findOne({
            where: { slug: brandData.slug },
        });

        if (!existingBrand) {
            const brand = brandRepository.create(brandData);
            await brandRepository.save(brand);
            console.log(`✓ 브랜드 생성: ${brandData.name}`);
        } else {
            console.log(`- 브랜드 이미 존재: ${brandData.name}`);
        }
    }
}

