import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductTag } from './entities/product.entity';

/** 금호마린테크(kumhomarine.com) 실제 상품 데이터 - 출처: http://kumhomarine.com */
export interface ProductSeedItem {
  name: string;
  description?: string;
  price: number; // 0 = 가격문의
  brandSlug: string; // lowrance | garmin | simrad | motor-guide | standard-horizon | camel | icom | em-trak | golight
  categoryName: string;
  tag?: ProductTag;
  stock?: number;
}

export const productsSeedData: ProductSeedItem[] = [
  // === GPS플로터 어군탐지기 ===
  {
    name: 'HDS PRO 시리즈',
    description: 'Lowrance 최고급 터치 플로터/어탐. HDS Live 후속.',
    price: 3850000,
    brandSlug: 'lowrance',
    categoryName: 'HDS 시리즈(터치)',
    tag: ProductTag.NEW,
    stock: 10,
  },
  {
    name: 'Elite FS 시리즈',
    description: 'Elite FS 7/9/12인치 터치형 어군탐지기.',
    price: 1980000,
    brandSlug: 'lowrance',
    categoryName: 'Elite 시리즈(터치)',
    tag: ProductTag.BEST,
    stock: 15,
  },
  {
    name: '이글 시리즈',
    description: '이글 Elite 등 버튼형 어군탐지기.',
    price: 286000,
    brandSlug: 'lowrance',
    categoryName: '이글 시리즈(버튼)',
    stock: 20,
  },
  {
    name: 'NSS evo3S 시리즈(심라드/SIMRAD)',
    description: 'Simrad NSS evo3S 시리즈 플로터.',
    price: 4290000,
    brandSlug: 'simrad',
    categoryName: 'NSS evo3S(심라드)',
    stock: 5,
  },
  {
    name: 'GPSMAP 79s',
    description: 'Garmin 휴대용 GPS 플로터.',
    price: 693000,
    brandSlug: 'garmin',
    categoryName: '휴대용 GPS',
    stock: 12,
  },
  {
    name: 'S2009',
    description: 'S 시리즈 9인치 어군탐지기.',
    price: 2970000,
    brandSlug: 'simrad',
    categoryName: 'S 시리즈 어군탐지기',
    stock: 8,
  },

  // === 트롤링모터 ===
  {
    name: 'Recon 해수용',
    description: 'MotorGuide Recon 해수용 트롤링모터.',
    price: 6710000,
    brandSlug: 'motor-guide',
    categoryName: '트롤링모터', // 메인 (서브 없음)
    stock: 5,
  },
  {
    name: 'Recon 담수용',
    description: 'MotorGuide Recon 담수용 트롤링모터. 가격문의.',
    price: 0,
    brandSlug: 'motor-guide',
    categoryName: '트롤링모터', // 메인 (서브 없음)
    stock: 3,
  },

  // === 부품 및 액세서리 ===
  {
    name: '안테나 브라켓',
    price: 66000,
    brandSlug: 'lowrance',
    categoryName: '브라켓(송수파기/본체)',
    stock: 30,
  },
  {
    name: '액티브 이미지 3in1 노즈콘(고스트 트롤링모터용)',
    description: '트롤링모터에 장착하는 3-in-1 송수파기.',
    price: 605000,
    brandSlug: 'lowrance',
    categoryName: '로렌스용 송수파기',
    stock: 8,
  },
  {
    name: '선체부착형',
    description: '선체 외부 부착형 송수파기.',
    price: 110000,
    brandSlug: 'lowrance',
    categoryName: '로렌스용 송수파기',
    stock: 25,
  },
  {
    name: '송수파기 브라켓',
    price: 27500,
    brandSlug: 'lowrance',
    categoryName: '브라켓(송수파기/본체)',
    stock: 50,
  },
  {
    name: '선체관통형',
    description: '선체 관통형 송수파기.',
    price: 935000,
    brandSlug: 'lowrance',
    categoryName: '로렌스용 송수파기',
    stock: 5,
  },
  {
    name: '본체 브라켓',
    price: 49500,
    brandSlug: 'lowrance',
    categoryName: '브라켓(송수파기/본체)',
    stock: 40,
  },
  {
    name: '액티브이미징 HD 3-in-1',
    description: 'HD 3-in-1 이미지 송수파기.',
    price: 660000,
    brandSlug: 'lowrance',
    categoryName: '로렌스용 송수파기',
    tag: ProductTag.BEST,
    stock: 12,
  },
  {
    name: '이미지소나용 송수파기',
    description: 'StructureScan 등 이미지소나 전용 송수파기.',
    price: 550000,
    brandSlug: 'lowrance',
    categoryName: '로렌스용 송수파기',
    stock: 10,
  },
  {
    name: '플러쉬 마운트',
    description: '선체 플러시 마운트.',
    price: 110000,
    brandSlug: 'lowrance',
    categoryName: '로렌스용 송수파기',
    stock: 15,
  },
  {
    name: '액티브타켓 라이브소나',
    description: '실시간 라이브 소나 송수파기.',
    price: 2200000,
    brandSlug: 'lowrance',
    categoryName: '로렌스용 송수파기',
    tag: ProductTag.NEW,
    stock: 5,
  },
  {
    name: '3D 이미지소나 (StructureScan 3D)',
    description: 'Lowrance StructureScan 3D 소나.',
    price: 1760000,
    brandSlug: 'lowrance',
    categoryName: '로렌스용 송수파기',
    stock: 6,
  },
  {
    name: '일반 어탐 송수파기',
    description: '일반 2D 어탐용 송수파기.',
    price: 913000,
    brandSlug: 'lowrance',
    categoryName: '일반어탐용 송수파기 및 수온센서',
    stock: 8,
  },
  {
    name: '수온센서',
    price: 165000,
    brandSlug: 'lowrance',
    categoryName: '일반어탐용 송수파기 및 수온센서',
    stock: 20,
  },
  {
    name: '썬커버',
    description: '디스플레이 썬커버.',
    price: 44000,
    brandSlug: 'lowrance',
    categoryName: '썬커버',
    stock: 30,
  },
  {
    name: '케이블(전원/비디오/이더넷/연장/레이더)',
    description: '전원, 비디오, 이더넷, 연장, 레이더 케이블.',
    price: 44000,
    brandSlug: 'lowrance',
    categoryName: '케이블',
    stock: 40,
  },
  {
    name: 'NMEA2000(케이블/센서/엔진인터페이스)',
    description: 'NMEA2000 케이블 및 센서.',
    price: 27500,
    brandSlug: 'lowrance',
    categoryName: 'NMEA신호분배기/변환기',
    stock: 35,
  },
  {
    name: '본체고정용 마운트',
    price: 49500,
    brandSlug: 'lowrance',
    categoryName: '브라켓(송수파기/본체)',
    stock: 25,
  },
  {
    name: 'NMEA0183분배기',
    price: 495000,
    brandSlug: 'lowrance',
    categoryName: 'NMEA신호분배기/변환기',
    stock: 10,
  },
  {
    name: 'NMEA2000신호변환기',
    price: 198000,
    brandSlug: 'lowrance',
    categoryName: 'NMEA신호분배기/변환기',
    stock: 12,
  },
  {
    name: 'NMEA0183멀티플렉스',
    price: 242000,
    brandSlug: 'lowrance',
    categoryName: 'NMEA신호분배기/변환기',
    stock: 8,
  },

  // === 부품 및 액세서리 (page 2) ===
  {
    name: '초음파방오장비(따개비방지장비)',
    description: '선체 부착형 초음파 방오 장비.',
    price: 1980000,
    brandSlug: 'lowrance',
    categoryName: '초음파방오장비(따개비방지장비)',
    stock: 5,
  },
  {
    name: '전원부',
    price: 77000,
    brandSlug: 'lowrance',
    categoryName: '전원부',
    stock: 15,
  },
  {
    name: '레이더 마운트',
    price: 220000,
    brandSlug: 'lowrance',
    categoryName: '레이더 마운트',
    stock: 10,
  },
  {
    name: '피에조 마이크',
    price: 44000,
    brandSlug: 'lowrance',
    categoryName: '마이크',
    stock: 20,
  },
  {
    name: '로렌스 스냅백(블루)',
    price: 16500,
    brandSlug: 'lowrance',
    categoryName: '의류 및 액세서리',
    stock: 30,
  },
  {
    name: '케이블 홀 커버',
    price: 11000,
    brandSlug: 'lowrance',
    categoryName: '케이블',
    stock: 50,
  },
  {
    name: 'NMEA2000/0183 변환기',
    price: 198000,
    brandSlug: 'lowrance',
    categoryName: 'NMEA신호분배기/변환기',
    stock: 12,
  },
  {
    name: 'S3100H 소나 모듈',
    description: 'HD 라이브 소나 모듈.',
    price: 2420000,
    brandSlug: 'lowrance',
    categoryName: '로렌스용 송수파기',
    stock: 5,
  },

  // === 레이더 ===
  {
    name: 'K10 / K12 (10/12인치, 36nm돔레이더)',
    price: 3200000,
    brandSlug: 'garmin',
    categoryName: 'K10 / K12',
    stock: 5,
  },
  {
    name: 'HALO20 / HALO20+',
    price: 3080000,
    brandSlug: 'garmin',
    categoryName: 'HALO20 / HALO20+',
    stock: 5,
  },
  {
    name: 'HALO24',
    price: 4400000,
    brandSlug: 'garmin',
    categoryName: 'HALO24',
    stock: 3,
  },
  {
    name: 'HALO',
    price: 8580000,
    brandSlug: 'garmin',
    categoryName: 'HALO',
    stock: 2,
  },
  {
    name: 'PC레이더',
    description: '가격문의.',
    price: 0,
    brandSlug: 'simrad',
    categoryName: 'PC레이더',
    stock: 2,
  },

  // === 무선/통신장비 ===
  {
    name: 'B921 (CLASS B AIS 송수신기)',
    price: 1540000,
    brandSlug: 'simrad',
    categoryName: '무선/통신장비',
    stock: 5,
  },
  {
    name: 'FT-7500 (MF/HF SSB 무선송수신기)',
    price: 3300000,
    brandSlug: 'icom',
    categoryName: '무선/통신장비',
    stock: 3,
  },
  {
    name: 'GX1800GPS (해상용 VHF 무선송수신기)',
    price: 1210000,
    brandSlug: 'standard-horizon',
    categoryName: '무선/통신장비',
    stock: 8,
  },
  {
    name: 'A200 (CLASS A AIS 송수신기)',
    price: 3410000,
    brandSlug: 'em-trak',
    categoryName: '무선/통신장비',
    stock: 3,
  },
  {
    name: 'CAMINO701 (CLASS A AIS 송수신기)',
    price: 3520000,
    brandSlug: 'camel',
    categoryName: '무선/통신장비',
    stock: 3,
  },
  {
    name: 'HX40E (해상용 VHF 무선송수신기)',
    price: 396000,
    brandSlug: 'standard-horizon',
    categoryName: '무선/통신장비',
    stock: 15,
  },
  {
    name: 'KS-200B (AIS 수신기)',
    price: 990000,
    brandSlug: 'camel',
    categoryName: '무선/통신장비',
    stock: 5,
  },
  {
    name: 'KP-708A (GPS플로터 / AIS, B클라스)',
    price: 1650000,
    brandSlug: 'camel',
    categoryName: '무선/통신장비',
    stock: 5,
  },
  {
    name: 'FT-8200 (GPS EPIRB)',
    price: 1210000,
    brandSlug: 'icom',
    categoryName: '무선/통신장비',
    stock: 5,
  },

  // === 해상용 안테나/헤딩센서 ===
  {
    name: 'V9125',
    price: 330000,
    brandSlug: 'garmin',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 10,
  },
  {
    name: 'V9112',
    price: 473000,
    brandSlug: 'garmin',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 8,
  },
  {
    name: 'V9150',
    price: 825000,
    brandSlug: 'garmin',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 5,
  },
  {
    name: 'VHF안테나',
    price: 143000,
    brandSlug: 'standard-horizon',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 15,
  },
  {
    name: 'AIS안테나',
    price: 143000,
    brandSlug: 'garmin',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 15,
  },
  {
    name: 'AM/FM 안테나 (3dB/1.5m)',
    price: 132000,
    brandSlug: 'standard-horizon',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 10,
  },
  {
    name: 'Point-1',
    description: 'GPS 헤딩센서.',
    price: 550000,
    brandSlug: 'lowrance',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 15,
  },
  {
    name: '프리시젼-9',
    price: 1430000,
    brandSlug: 'garmin',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 5,
  },
  {
    name: 'HF / SSB 안테나 (6dB/4.9m(2단))',
    price: 440000,
    brandSlug: 'icom',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 5,
  },
  {
    name: 'GA660 (BNC/TNC커넥터)',
    price: 143000,
    brandSlug: 'garmin',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 15,
  },
  {
    name: 'GP180 (수신모듈 내장형)',
    price: 275000,
    brandSlug: 'garmin',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 10,
  },
  {
    name: 'GPS100 (EM-TRAK사, TNC)',
    price: 143000,
    brandSlug: 'em-trak',
    categoryName: '해상용 안테나/헤딩센서',
    stock: 10,
  },

  // === 항해 안전장비 ===
  {
    name: '어비스',
    price: 187000,
    brandSlug: 'garmin',
    categoryName: '항해 안전장비',
    stock: 10,
  },
  {
    name: 'EM305PE',
    price: 990000,
    brandSlug: 'em-trak',
    categoryName: '항해 안전장비',
    stock: 5,
  },
  {
    name: '나이트비전 K',
    price: 1900000,
    brandSlug: 'garmin',
    categoryName: '항해 안전장비',
    stock: 3,
  },
  {
    name: 'HY-JJ6',
    price: 176000,
    brandSlug: 'standard-horizon',
    categoryName: '항해 안전장비',
    stock: 8,
  },
  {
    name: '토네이도',
    price: 330000,
    brandSlug: 'standard-horizon',
    categoryName: '항해 안전장비',
    stock: 8,
  },
  {
    name: 'EM230BR',
    price: 385000,
    brandSlug: 'em-trak',
    categoryName: '항해 안전장비',
    stock: 5,
  },
  {
    name: '코너스렉스',
    price: 319000,
    brandSlug: 'standard-horizon',
    categoryName: '항해 안전장비',
    stock: 8,
  },
  {
    name: 'Active-XS DualBand',
    price: 1650000,
    brandSlug: 'garmin',
    categoryName: '항해 안전장비',
    stock: 3,
  },
  {
    name: 'Active-X Band',
    price: 1320000,
    brandSlug: 'garmin',
    categoryName: '항해 안전장비',
    stock: 5,
  },
  {
    name: '스포티',
    price: 88000,
    brandSlug: 'standard-horizon',
    categoryName: '항해 안전장비',
    stock: 15,
  },
  {
    name: '콤파스',
    price: 143000,
    brandSlug: 'garmin',
    categoryName: '항해 안전장비',
    stock: 20,
  },
  {
    name: 'SM5',
    price: 440000,
    brandSlug: 'garmin',
    categoryName: '항해 안전장비',
    stock: 5,
  },
  {
    name: 'GOLIGHT GT 할로겐 시리즈',
    price: 440000,
    brandSlug: 'golight',
    categoryName: '항해 안전장비',
    stock: 8,
  },
  {
    name: 'AM708',
    price: 3960000,
    brandSlug: 'garmin',
    categoryName: '항해 안전장비',
    stock: 2,
  },
  {
    name: '[판매예정] 팬틸트 드라이브',
    description: '판매예정.',
    price: 650000,
    brandSlug: 'garmin',
    categoryName: '항해 안전장비',
    stock: 0,
  },
  {
    name: 'GOLIGHT GT LED 시리즈',
    price: 1067000,
    brandSlug: 'golight',
    categoryName: '항해 안전장비',
    stock: 5,
  },
  {
    name: 'STRYKER LED 시리즈',
    price: 1320000,
    brandSlug: 'golight',
    categoryName: '항해 안전장비',
    stock: 5,
  },

  // === 선박용 인산철배터리 (9개) ===
  {
    name: '카멜 시동용 인산철배터리 24V/200A',
    price: 1800000,
    brandSlug: 'camel',
    categoryName: '카멜 시동용 인산철배터리',
    stock: 5,
  },
  {
    name: '카멜 시동용 인산철배터리 12V/320A',
    price: 1760000,
    brandSlug: 'camel',
    categoryName: '카멜 시동용 인산철배터리',
    stock: 5,
  },
  {
    name: '카멜 시동용 인산철배터리 12V/135Ah',
    price: 660000,
    brandSlug: 'camel',
    categoryName: '카멜 시동용 인산철배터리',
    stock: 8,
  },
  {
    name: '선박용 주행충전기',
    price: 135000,
    brandSlug: 'camel',
    categoryName: '주행충전기',
    stock: 15,
  },
  {
    name: '인산철배터리 충전기',
    price: 50000,
    brandSlug: 'camel',
    categoryName: '배터리 충전기',
    stock: 20,
  },
  {
    name: '카멜 인산철배터리 12.8V/105Ah',
    price: 440000,
    brandSlug: 'camel',
    categoryName: '카멜 인산철배터리',
    stock: 10,
  },
  {
    name: '카멜 인산철배터리 25.6V/105A',
    price: 880000,
    brandSlug: 'camel',
    categoryName: '카멜 인산철배터리',
    stock: 8,
  },
  {
    name: '카멜 인산철배터리 12.8V/300A',
    price: 1540000,
    brandSlug: 'camel',
    categoryName: '카멜 인산철배터리',
    stock: 5,
  },
  {
    name: '카멜 인산철배터리 38.4V/105A',
    price: 1540000,
    brandSlug: 'camel',
    categoryName: '카멜 인산철배터리',
    stock: 5,
  },

  // === 선박용 전기관련 제품 (7개) ===
  {
    name: '와이퍼 블레이드',
    price: 8800,
    brandSlug: 'camel',
    categoryName: '윈도우 와이퍼 제품',
    stock: 30,
  },
  {
    name: '혼',
    price: 275000,
    brandSlug: 'camel',
    categoryName: '혼',
    stock: 10,
  },
  {
    name: '배터리 스위치',
    price: 99000,
    brandSlug: 'camel',
    categoryName: '배터리스위치',
    stock: 20,
  },
  {
    name: '배터리 분배 단자',
    price: 165000,
    brandSlug: 'camel',
    categoryName: '배터리 분배 부품 및 시거잭 홀더',
    stock: 15,
  },
  {
    name: '휴즈홀더 / 휴즈',
    price: 33000,
    brandSlug: 'camel',
    categoryName: '휴즈홀더 / 휴즈',
    stock: 25,
  },
  {
    name: '판토그래픽 와이퍼 암',
    price: 66000,
    brandSlug: 'camel',
    categoryName: '윈도우 와이퍼 제품',
    stock: 15,
  },
  {
    name: '와이퍼 암',
    price: 35000,
    brandSlug: 'camel',
    categoryName: '윈도우 와이퍼 제품',
    stock: 20,
  },

  // === 항해 조타장비 ===
  {
    name: '유압조타팩',
    price: 2750000,
    brandSlug: 'g-zyro',
    categoryName: '항해 조타장비',
    stock: 3,
  },

  // === 자이로 안정기 ===
  {
    name: '자이로 안정기',
    description: '가격문의.',
    price: 0,
    brandSlug: 'g-zyro',
    categoryName: '자이로 안정기',
    stock: 3,
  },
];

export async function seedProducts(
  dataSource: DataSource,
  categoryNameToId: Map<string, string>,
  brandSlugToId: Map<string, string>,
) {
  const repo = dataSource.getRepository(Product);

  for (const item of productsSeedData) {
    const brandId = brandSlugToId.get(item.brandSlug);
    const categoryId = categoryNameToId.get(item.categoryName);

    if (!brandId) {
      console.warn(`⚠ 브랜드 없음 (${item.brandSlug}) → ${item.name} 건너뜀`);
      continue;
    }
    if (!categoryId) {
      console.warn(`⚠ 카테고리 없음 (${item.categoryName}) → ${item.name} 건너뜀`);
      continue;
    }

    const existing = await repo.findOne({
      where: { name: item.name, brandId, categoryId },
    });

    if (!existing) {
      const product = repo.create({
        name: item.name,
        description: item.price === 0 ? '가격문의' : item.description,
        price: item.price,
        brandId,
        categoryId,
        tag: item.tag ?? null,
        stock: item.stock ?? 10,
        isActive: true,
      });
      await repo.save(product);
      console.log(`✓ 상품 생성: ${item.name}`);
    } else {
      console.log(`- 상품 이미 존재: ${item.name}`);
    }
  }
}
