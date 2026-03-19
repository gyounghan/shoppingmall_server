import { DataSource } from 'typeorm';
import { Category } from './entities/category.entity';

/**
 * 금호마린테크(kumhomarine.com) 메인/디테일 카테고리 계층 구조
 * 출처: http://kumhomarine.com
 */
interface CategorySeedItem {
  name: string;
  description?: string;
  parentName?: string | null;
}

const mainCategories: CategorySeedItem[] = [
  { name: 'GPS플로터 어군탐지기', description: 'GPS 플로터 및 어군탐지기', parentName: null },
  { name: '레이더', description: '선박용 레이더', parentName: null },
  { name: '트롤링모터', description: '트롤링 전동모터', parentName: null },
  { name: '무선/통신장비', description: '해양 무선통신 장비', parentName: null },
  { name: '항해 안전장비', description: '항해 안전 관련 장비', parentName: null },
  { name: '항해 조타장비', description: '조타(키) 관련 장비', parentName: null },
  { name: '해상용 안테나/헤딩센서', description: 'GPS 안테나, 헤딩센서', parentName: null },
  { name: '선박용 인산철배터리', description: '선박용 인산철 배터리', parentName: null },
  { name: '선박용 전기관련 제품', description: '전기·전원 관련 제품', parentName: null },
  { name: '부품 및 액세서리', description: '부품, 브라켓, 케이블 등', parentName: null },
  { name: '자이로 안정기', description: '선박 자이로스코프 안정기', parentName: null },
];

const subCategories: CategorySeedItem[] = [
  // GPS플로터 어군탐지기 하위
  { name: '휴대용 GPS', description: '휴대용 GPS 플로터', parentName: 'GPS플로터 어군탐지기' },
  { name: 'S 시리즈 어군탐지기', description: 'S 시리즈 플로터/어탐', parentName: 'GPS플로터 어군탐지기' },
  { name: 'NSS evo3S(심라드)', description: 'Simrad NSS evo3S 시리즈', parentName: 'GPS플로터 어군탐지기' },
  { name: '이글 시리즈(버튼)', description: '이글 시리즈 버튼형', parentName: 'GPS플로터 어군탐지기' },
  { name: 'Elite 시리즈(터치)', description: 'Elite FS 등 터치형', parentName: 'GPS플로터 어군탐지기' },
  { name: 'HDS 시리즈(터치)', description: 'HDS Live, HDS Pro 등', parentName: 'GPS플로터 어군탐지기' },
  // 부품 및 액세서리 하위
  { name: '로렌스용 송수파기', description: 'Lowrance 호환 송수파기', parentName: '부품 및 액세서리' },
  { name: '일반어탐용 송수파기 및 수온센서', description: '일반 어탐 송수파기, 수온센서', parentName: '부품 및 액세서리' },
  { name: '브라켓(송수파기/본체)', description: '송수파기·본체 브라켓', parentName: '부품 및 액세서리' },
  { name: '썬커버', description: '디스플레이 썬커버', parentName: '부품 및 액세서리' },
  { name: '케이블', description: '전원·비디오·이더넷·연장 케이블', parentName: '부품 및 액세서리' },
  { name: '램마운트', description: '램마운트 거치대', parentName: '부품 및 액세서리' },
  { name: 'NMEA신호분배기/변환기', description: 'NMEA0183, NMEA2000', parentName: '부품 및 액세서리' },
  { name: '초음파방오장비(따개비방지장비)', description: '선체 부착형 방오 장비', parentName: '부품 및 액세서리' },
  { name: '전원부', description: '전원 분배, 변환', parentName: '부품 및 액세서리' },
  { name: '의류 및 액세서리', description: '의류, 생활 액세서리', parentName: '부품 및 액세서리' },
  { name: '레이더 마운트', description: '레이더 마운트', parentName: '부품 및 액세서리' },
  { name: '마이크', description: '마이크', parentName: '부품 및 액세서리' },
  // 레이더 하위
  { name: 'PC레이더', description: 'PC 레이더', parentName: '레이더' },
  { name: 'HALO', description: 'Garmin HALO 레이더', parentName: '레이더' },
  { name: 'HALO24', description: 'Garmin HALO24', parentName: '레이더' },
  { name: 'HALO20 / HALO20+', description: 'Garmin HALO20', parentName: '레이더' },
  { name: 'K10 / K12', description: '돔레이더', parentName: '레이더' },
  // 해상용 안테나/헤딩센서 하위
  { name: 'GPS 콤파스', description: 'GPS 콤파스', parentName: '해상용 안테나/헤딩센서' },
  { name: '전자헤딩센서', description: '전자 헤딩센서', parentName: '해상용 안테나/헤딩센서' },
  { name: '선박용 VHF 및 기타 안테나', description: 'VHF 안테나', parentName: '해상용 안테나/헤딩센서' },
  { name: 'GPS안테나', description: 'GPS 안테나', parentName: '해상용 안테나/헤딩센서' },
  // 선박용 인산철배터리 하위
  { name: '주행충전기', description: '선박용 주행충전기', parentName: '선박용 인산철배터리' },
  { name: '배터리 충전기', description: '인산철 배터리 충전기', parentName: '선박용 인산철배터리' },
  { name: '카멜 시동용 인산철배터리', description: '카멜 시동용', parentName: '선박용 인산철배터리' },
  { name: '카멜 인산철배터리', description: '카멜 일반용', parentName: '선박용 인산철배터리' },
  // 선박용 전기관련 제품 하위
  { name: '휴즈홀더 / 휴즈', description: '휴즈홀더, 휴즈', parentName: '선박용 전기관련 제품' },
  { name: '배터리 분배 부품 및 시거잭 홀더', description: '배터리 분배', parentName: '선박용 전기관련 제품' },
  { name: '배터리스위치', description: '배터리 스위치', parentName: '선박용 전기관련 제품' },
  { name: '혼', description: '혼(호른)', parentName: '선박용 전기관련 제품' },
  { name: '윈도우 와이퍼 제품', description: '와이퍼 블레이드, 암', parentName: '선박용 전기관련 제품' },
];

export async function seedCategories(dataSource: DataSource) {
  const repo = dataSource.getRepository(Category);

  // 1. 메인 카테고리 먼저 생성
  for (const data of mainCategories) {
    const existing = await repo.findOne({ where: { name: data.name } });
    if (!existing) {
      const cat = repo.create({
        name: data.name,
        description: data.description,
        parentId: null,
        isActive: true,
      });
      await repo.save(cat);
      console.log(`✓ [메인] 카테고리 생성: ${data.name}`);
    } else {
      if (!existing.parentId) {
        console.log(`- [메인] 카테고리 이미 존재: ${data.name}`);
      } else {
        // 기존이 서브였던 경우 parentId 제거하여 메인으로 복구
        existing.parentId = null;
        await repo.save(existing);
        console.log(`✓ [메인] 카테고리 계층 수정: ${data.name}`);
      }
    }
  }

  // 2. 디테일(서브) 카테고리 생성
  const allCategories = await repo.find();
  const nameToId = new Map(allCategories.map((c) => [c.name, c.id]));

  for (const data of subCategories) {
    const existing = await repo.findOne({ where: { name: data.name } });
    const parentId = data.parentName ? nameToId.get(data.parentName) ?? null : null;

    if (!existing) {
      const cat = repo.create({
        name: data.name,
        description: data.description,
        parentId,
        isActive: true,
      });
      await repo.save(cat);
      nameToId.set(data.name, cat.id);
      console.log(`✓ [디테일] 카테고리 생성: ${data.name} ← ${data.parentName}`);
    } else {
      if (existing.parentId !== parentId) {
        existing.parentId = parentId;
        await repo.save(existing);
        console.log(`✓ [디테일] 카테고리 계층 수정: ${data.name} ← ${data.parentName}`);
      } else {
        console.log(`- [디테일] 카테고리 이미 존재: ${data.name}`);
      }
    }
  }
}
