import { DataSource } from 'typeorm';
import { SimulatorSet } from './entities/simulator-set.entity';
import { SimulatorSetItem } from './entities/simulator-set-item.entity';
import { Product } from '../products/entities/product.entity';

interface SimulatorSetSeedDef {
  name: string;
  description: string;
  productNames: string[];
}

/**
 * 시뮬레이터 세트 시드: 프리미엄 / 가심비 / 가성비
 */
const simulatorSetsSeedData: SimulatorSetSeedDef[] = [
  {
    name: '프리미엄',
    description: '최고급 사양. 최상위 라인업으로 완벽한 선박 장비 구성.',
    productNames: [
      'HDS PRO 시리즈',
      'NSS evo3S 시리즈(심라드/SIMRAD)',
      'HALO',
      'Recon 해수용',
      '액티브타켓 라이브소나',
      '3D 이미지소나 (StructureScan 3D)',
      '프리시젼-9',
      'CAMINO701 (CLASS A AIS 송수신기)',
      'Active-XS DualBand',
    ],
  },
  {
    name: '가심비',
    description: '감성과 품질의 균형. 중급 사양으로 만족스러운 구성.',
    productNames: [
      'Elite FS 시리즈',
      'S2009',
      'HALO24',
      'Point-1',
      '액티브이미징 HD 3-in-1',
      'GX1800GPS (해상용 VHF 무선송수신기)',
      'EM305PE',
      'V9150',
      '카멜 시동용 인산철배터리 12V/135Ah',
    ],
  },
  {
    name: '가성비',
    description: '실용적 구성. 합리적인 가격으로 기본 기능 충족.',
    productNames: [
      '이글 시리즈',
      'GPSMAP 79s',
      '썬커버',
      '수온센서',
      '송수파기 브라켓',
      '케이블(전원/비디오/이더넷/연장/레이더)',
      'NMEA2000(케이블/센서/엔진인터페이스)',
      'HX40E (해상용 VHF 무선송수신기)',
      'VHF안테나',
      '스포티',
      '와이퍼 블레이드',
      '인산철배터리 충전기',
      '휴즈홀더 / 휴즈',
    ],
  },
];

export async function seedSimulatorSets(dataSource: DataSource) {
  const setRepo = dataSource.getRepository(SimulatorSet);
  const itemRepo = dataSource.getRepository(SimulatorSetItem);
  const productRepo = dataSource.getRepository(Product);

  const products = await productRepo.find({ where: { isActive: true } });
  const productByName = new Map(products.map((p) => [p.name, p]));

  for (const def of simulatorSetsSeedData) {
    let set = await setRepo.findOne({ where: { name: def.name } });
    if (!set) {
      set = setRepo.create({
        name: def.name,
        description: def.description,
        isActive: true,
      });
      await setRepo.save(set);
      console.log(`✓ 시뮬레이터 세트 생성: ${def.name}`);
    } else {
      console.log(`- 시뮬레이터 세트 이미 존재: ${def.name}`);
    }

    for (const productName of def.productNames) {
      const product = productByName.get(productName);
      if (!product) {
        console.warn(`⚠ 상품 없음 (${productName}) → ${def.name} 세트에서 건너뜀`);
        continue;
      }

      const existingItem = await itemRepo.findOne({
        where: { simulatorSetId: set.id, categoryId: product.categoryId },
      });
      if (existingItem) {
        if (existingItem.productId !== product.id) {
          existingItem.productId = product.id;
          await itemRepo.save(existingItem);
          console.log(`  ✓ 아이템 수정: ${productName} (${def.name})`);
        }
      } else {
        const item = itemRepo.create({
          simulatorSetId: set.id,
          productId: product.id,
          categoryId: product.categoryId,
        });
        await itemRepo.save(item);
        console.log(`  ✓ 아이템 추가: ${productName} (${def.name})`);
      }
    }
  }
}
