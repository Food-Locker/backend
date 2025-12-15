import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 같은 디렉토리의 .env 파일 읽기
dotenv.config({ path: join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI가 설정되지 않았습니다.');
  process.exit(1);
}

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('food-locker');
    console.log('MongoDB 연결 성공');

    // 기존 데이터 삭제
    await db.collection('stadiums').deleteMany({});
    await db.collection('categories').deleteMany({});
    await db.collection('brands').deleteMany({});
    await db.collection('items').deleteMany({});
    console.log('기존 데이터 삭제 완료');

    // 1. Stadiums 생성
    const stadiumsData = [
      { name: '잠실야구장', nameEn: 'Seoul Jamsil Baseball Stadium', location: '서울시 송파구' },
      { name: '고척 스카이돔', nameEn: 'Gocheok Sky Dome', location: '서울시 구로구' },
      { name: '인천 SSG 랜더스필드', nameEn: 'Incheon SSG Landers Field', location: '인천광역시 미추홀구' },
      { name: '수원 KT 위즈파크', nameEn: 'Suwon KT Wiz Park', location: '경기도 수원시 영통구' },
      { name: '광주-기아 챔피언스 필드', nameEn: 'Gwangju-Kia Champions Field', location: '광주광역시 북구' },
      { name: '창원 NC 파크', nameEn: 'Changwon NC Park', location: '경상남도 창원시 마산회원구' },
      { name: '대구 삼성 라이온즈 파크', nameEn: 'Daegu Samsung Lions Park', location: '대구광역시 수성구' },
      { name: '대전 한화생명 이글스파크', nameEn: 'Daejeon Hanwha Life Eagles Park', location: '대전광역시 중구' },
      { name: '부산 사직야구장', nameEn: 'Busan Sajik Baseball Stadium', location: '부산광역시 동래구' }
    ];

    const stadiums = await db.collection('stadiums').insertMany(
      stadiumsData.map(stadium => ({
        ...stadium,
        createdAt: new Date().toISOString()
      }))
    );
    
    const stadiumIds = Object.values(stadiums.insertedIds);
    console.log(`${stadiumsData.length}개의 Stadiums 생성 완료`);

    // Stadium ID 매핑
    const stadiumMap = {};
    stadiumsData.forEach((stadium, index) => {
      stadiumMap[stadium.name] = stadiumIds[index];
    });

    // 2. 서울 잠실야구장 데이터
    const jamsilId = stadiumMap['잠실야구장'];
    
    // Category: 식사 & 면 요리
    const jamsilCat1 = await db.collection('categories').insertOne({
      stadiumId: jamsilId,
      name: 'Noodle & Meal',
      nameKo: '식사',
      createdAt: new Date().toISOString()
    });
    const jamsilCat1Id = jamsilCat1.insertedId;

    // Brand: 통빱
    const jamsilBrand1 = await db.collection('brands').insertOne({
      categoryId: jamsilCat1Id,
      name: '통빱',
      nameEn: 'Tong-bbap',
      createdAt: new Date().toISOString()
    });
    const jamsilBrand1Id = jamsilBrand1.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: jamsilBrand1Id, name: '김치말이국수', price: 7000, createdAt: new Date().toISOString() },
      { brandId: jamsilBrand1Id, name: '삼겹살 정식', price: 22000, createdAt: new Date().toISOString() }
    ]);

    // Category: 피자
    const jamsilCat2 = await db.collection('categories').insertOne({
      stadiumId: jamsilId,
      name: 'Pizza',
      nameKo: '피자',
      createdAt: new Date().toISOString()
    });
    const jamsilCat2Id = jamsilCat2.insertedId;

    // Brand: 잭슨피자
    const jamsilBrand2 = await db.collection('brands').insertOne({
      categoryId: jamsilCat2Id,
      name: '잭슨피자',
      nameEn: 'Jackson Pizza',
      createdAt: new Date().toISOString()
    });
    const jamsilBrand2Id = jamsilBrand2.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: jamsilBrand2Id, name: '수퍼 잭슨 (P)', price: 13800, createdAt: new Date().toISOString() },
      { brandId: jamsilBrand2Id, name: '하와이안 (P)', price: 11000, createdAt: new Date().toISOString() }
    ]);

    // Category: 만두
    const jamsilCat3 = await db.collection('categories').insertOne({
      stadiumId: jamsilId,
      name: 'Dumpling',
      nameKo: '만두',
      createdAt: new Date().toISOString()
    });
    const jamsilCat3Id = jamsilCat3.insertedId;

    // Brand: 파오파오
    const jamsilBrand3 = await db.collection('brands').insertOne({
      categoryId: jamsilCat3Id,
      name: '파오파오',
      nameEn: 'Paopao',
      createdAt: new Date().toISOString()
    });
    const jamsilBrand3Id = jamsilBrand3.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: jamsilBrand3Id, name: '새우만두', price: 6000, createdAt: new Date().toISOString() },
      { brandId: jamsilBrand3Id, name: '내맘대로 3인분 세트', price: 15000, createdAt: new Date().toISOString() }
    ]);

    console.log('✅ 서울 잠실야구장 데이터 생성 완료');

    // 3. 고척 스카이돔 데이터
    const gocheokId = stadiumMap['고척 스카이돔'];

    // Category: 새우 & 치킨
    const gocheokCat1 = await db.collection('categories').insertOne({
      stadiumId: gocheokId,
      name: 'Shrimp & Chicken',
      nameKo: '새우',
      createdAt: new Date().toISOString()
    });
    const gocheokCat1Id = gocheokCat1.insertedId;

    // Brand: 쉬림프 쉐프
    const gocheokBrand1 = await db.collection('brands').insertOne({
      categoryId: gocheokCat1Id,
      name: '쉬림프 쉐프',
      nameEn: 'Shrimp Chef',
      createdAt: new Date().toISOString()
    });
    const gocheokBrand1Id = gocheokBrand1.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: gocheokBrand1Id, name: '크림새우', price: 16000, createdAt: new Date().toISOString() },
      { brandId: gocheokBrand1Id, name: '마라크림새우', price: 17000, createdAt: new Date().toISOString() }
    ]);

    // Category: 만두
    const gocheokCat2 = await db.collection('categories').insertOne({
      stadiumId: gocheokId,
      name: 'Dumpling',
      nameKo: '만두',
      createdAt: new Date().toISOString()
    });
    const gocheokCat2Id = gocheokCat2.insertedId;

    // Brand: 백남옥달인손만두
    const gocheokBrand2 = await db.collection('brands').insertOne({
      categoryId: gocheokCat2Id,
      name: '백남옥달인손만두',
      nameEn: 'Baeknamok',
      createdAt: new Date().toISOString()
    });
    const gocheokBrand2Id = gocheokBrand2.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: gocheokBrand2Id, name: '고기통만두', price: 6000, createdAt: new Date().toISOString() },
      { brandId: gocheokBrand2Id, name: '김치통만두', price: 6000, createdAt: new Date().toISOString() }
    ]);

    // Category: 디저트
    const gocheokCat3 = await db.collection('categories').insertOne({
      stadiumId: gocheokId,
      name: 'Dessert',
      nameKo: '디저트',
      createdAt: new Date().toISOString()
    });
    const gocheokCat3Id = gocheokCat3.insertedId;

    // Brand: 올드페리도넛
    const gocheokBrand3 = await db.collection('brands').insertOne({
      categoryId: gocheokCat3Id,
      name: '올드페리도넛',
      nameEn: 'Old Ferry Donut',
      createdAt: new Date().toISOString()
    });
    const gocheokBrand3Id = gocheokBrand3.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: gocheokBrand3Id, name: '버터 피스타치오', price: 5500, createdAt: new Date().toISOString() },
      { brandId: gocheokBrand3Id, name: '크림브륄레', price: 4200, createdAt: new Date().toISOString() }
    ]);

    console.log('✅ 고척 스카이돔 데이터 생성 완료');

    // 4. 인천 SSG 랜더스필드 데이터
    const incheonId = stadiumMap['인천 SSG 랜더스필드'];

    // Category: 시그니처
    const incheonCat1 = await db.collection('categories').insertOne({
      stadiumId: incheonId,
      name: 'Signature Shrimp',
      nameKo: '시그니처',
      createdAt: new Date().toISOString()
    });
    const incheonCat1Id = incheonCat1.insertedId;

    // Brand: 스테이션
    const incheonBrand1 = await db.collection('brands').insertOne({
      categoryId: incheonCat1Id,
      name: '스테이션',
      nameEn: 'Station',
      createdAt: new Date().toISOString()
    });
    const incheonBrand1Id = incheonBrand1.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: incheonBrand1Id, name: '크림새우', price: 16000, createdAt: new Date().toISOString() }
    ]);

    // Category: 카페
    const incheonCat2 = await db.collection('categories').insertOne({
      stadiumId: incheonId,
      name: 'Cafe',
      nameKo: '카페',
      createdAt: new Date().toISOString()
    });
    const incheonCat2Id = incheonCat2.insertedId;

    // Brand: 스타벅스
    const incheonBrand2 = await db.collection('brands').insertOne({
      categoryId: incheonCat2Id,
      name: '스타벅스',
      nameEn: 'Starbucks',
      createdAt: new Date().toISOString()
    });
    const incheonBrand2Id = incheonBrand2.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: incheonBrand2Id, name: '레드 파워 스매시 블렌디드', price: 6500, createdAt: new Date().toISOString() },
      { brandId: incheonBrand2Id, name: '아이스 아메리카노', price: 4500, createdAt: new Date().toISOString() }
    ]);

    console.log('✅ 인천 SSG 랜더스필드 데이터 생성 완료');

    // 5. 수원 KT 위즈파크 데이터
    const suwonId = stadiumMap['수원 KT 위즈파크'];

    // Category: 치킨
    const suwonCat1 = await db.collection('categories').insertOne({
      stadiumId: suwonId,
      name: 'Chicken',
      nameKo: '치킨',
      createdAt: new Date().toISOString()
    });
    const suwonCat1Id = suwonCat1.insertedId;

    // Brand: 진미통닭
    const suwonBrand1 = await db.collection('brands').insertOne({
      categoryId: suwonCat1Id,
      name: '진미통닭',
      nameEn: 'Jinmi Tongdak',
      createdAt: new Date().toISOString()
    });
    const suwonBrand1Id = suwonBrand1.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: suwonBrand1Id, name: '후라이드 치킨', price: 19000, createdAt: new Date().toISOString() },
      { brandId: suwonBrand1Id, name: '양념치킨', price: 20000, createdAt: new Date().toISOString() }
    ]);

    // Category: 분식
    const suwonCat2 = await db.collection('categories').insertOne({
      stadiumId: suwonId,
      name: 'Dumpling & Noodle',
      nameKo: '분식',
      createdAt: new Date().toISOString()
    });
    const suwonCat2Id = suwonCat2.insertedId;

    // Brand: 보영만두
    const suwonBrand2 = await db.collection('brands').insertOne({
      categoryId: suwonCat2Id,
      name: '보영만두',
      nameEn: 'Boyoung Mandu',
      createdAt: new Date().toISOString()
    });
    const suwonBrand2Id = suwonBrand2.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: suwonBrand2Id, name: '군만두', price: 8000, createdAt: new Date().toISOString() },
      { brandId: suwonBrand2Id, name: '쫄면', price: 8000, createdAt: new Date().toISOString() }
    ]);

    console.log('✅ 수원 KT 위즈파크 데이터 생성 완료');

    // 6. 광주-기아 챔피언스 필드 데이터
    const gwangjuId = stadiumMap['광주-기아 챔피언스 필드'];

    // Category: 버거
    const gwangjuCat1 = await db.collection('categories').insertOne({
      stadiumId: gwangjuId,
      name: 'Burger',
      nameKo: '버거',
      createdAt: new Date().toISOString()
    });
    const gwangjuCat1Id = gwangjuCat1.insertedId;

    // Brand: 광주제일햄버고
    const gwangjuBrand1 = await db.collection('brands').insertOne({
      categoryId: gwangjuCat1Id,
      name: '광주제일햄버고',
      nameEn: 'Gwangju Jeil Hambergo',
      createdAt: new Date().toISOString()
    });
    const gwangjuBrand1Id = gwangjuBrand1.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: gwangjuBrand1Id, name: '제일버거', price: 8500, createdAt: new Date().toISOString() },
      { brandId: gwangjuBrand1Id, name: '하와이안버거', price: 9000, createdAt: new Date().toISOString() }
    ]);

    // Category: 분식
    const gwangjuCat2 = await db.collection('categories').insertOne({
      stadiumId: gwangjuId,
      name: 'Snack',
      nameKo: '분식',
      createdAt: new Date().toISOString()
    });
    const gwangjuCat2Id = gwangjuCat2.insertedId;

    // Brand: 마성떡볶이
    const gwangjuBrand2 = await db.collection('brands').insertOne({
      categoryId: gwangjuCat2Id,
      name: '마성떡볶이',
      nameEn: 'Maseong Tteokbokki',
      createdAt: new Date().toISOString()
    });
    const gwangjuBrand2Id = gwangjuBrand2.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: gwangjuBrand2Id, name: '마성떡볶이', price: 5500, createdAt: new Date().toISOString() },
      { brandId: gwangjuBrand2Id, name: '찰순대', price: 5500, createdAt: new Date().toISOString() }
    ]);

    console.log('✅ 광주-기아 챔피언스 필드 데이터 생성 완료');

    // 7. 창원 NC 파크 데이터
    const changwonId = stadiumMap['창원 NC 파크'];

    // Category: 베이커리 & 카페
    const changwonCat1 = await db.collection('categories').insertOne({
      stadiumId: changwonId,
      name: 'Bakery & Cafe',
      nameKo: '베이커리',
      createdAt: new Date().toISOString()
    });
    const changwonCat1Id = changwonCat1.insertedId;

    // Brand: 코아양과
    const changwonBrand1 = await db.collection('brands').insertOne({
      categoryId: changwonCat1Id,
      name: '코아양과',
      nameEn: 'Core Bakery',
      createdAt: new Date().toISOString()
    });
    const changwonBrand1Id = changwonBrand1.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: changwonBrand1Id, name: '밀크쉐이크', price: 6000, createdAt: new Date().toISOString() },
      { brandId: changwonBrand1Id, name: '꿀카스테라', price: 5500, createdAt: new Date().toISOString() }
    ]);

    // Category: 치킨
    const changwonCat2 = await db.collection('categories').insertOne({
      stadiumId: changwonId,
      name: 'Chicken',
      nameKo: '치킨',
      createdAt: new Date().toISOString()
    });
    const changwonCat2Id = changwonCat2.insertedId;

    // Brand: 알통떡강정
    const changwonBrand2 = await db.collection('brands').insertOne({
      categoryId: changwonCat2Id,
      name: '알통떡강정',
      nameEn: 'Altong Tteokgangjeong',
      createdAt: new Date().toISOString()
    });
    const changwonBrand2Id = changwonBrand2.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: changwonBrand2Id, name: '알통삼총사 세트', price: 26000, createdAt: new Date().toISOString() },
      { brandId: changwonBrand2Id, name: '크리스피 치킨', price: 19000, createdAt: new Date().toISOString() }
    ]);

    console.log('✅ 창원 NC 파크 데이터 생성 완료');

    // 8. 대구 삼성 라이온즈 파크 데이터
    const daeguId = stadiumMap['대구 삼성 라이온즈 파크'];

    // Category: 분식
    const daeguCat1 = await db.collection('categories').insertOne({
      stadiumId: daeguId,
      name: 'Snack',
      nameKo: '분식',
      createdAt: new Date().toISOString()
    });
    const daeguCat1Id = daeguCat1.insertedId;

    // Brand: 해피치즈스마일
    const daeguBrand1 = await db.collection('brands').insertOne({
      categoryId: daeguCat1Id,
      name: '해피치즈스마일',
      nameEn: 'Happy Cheese Smile',
      createdAt: new Date().toISOString()
    });
    const daeguBrand1Id = daeguBrand1.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: daeguBrand1Id, name: '베이직 떡볶이', price: 6500, createdAt: new Date().toISOString() },
      { brandId: daeguBrand1Id, name: '돈까스 플레이트', price: 18000, createdAt: new Date().toISOString() }
    ]);

    // Category: 치킨
    const daeguCat2 = await db.collection('categories').insertOne({
      stadiumId: daeguId,
      name: 'Chicken',
      nameKo: '치킨',
      createdAt: new Date().toISOString()
    });
    const daeguCat2Id = daeguCat2.insertedId;

    // Brand: 땅땅치킨
    const daeguBrand2 = await db.collection('brands').insertOne({
      categoryId: daeguCat2Id,
      name: '땅땅치킨',
      nameEn: 'Tangtang Chicken',
      createdAt: new Date().toISOString()
    });
    const daeguBrand2Id = daeguBrand2.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: daeguBrand2Id, name: '허브순살', price: 25900, createdAt: new Date().toISOString() }
    ]);

    console.log('✅ 대구 삼성 라이온즈 파크 데이터 생성 완료');

    // 9. 대전 한화생명 이글스파크 데이터
    const daejeonId = stadiumMap['대전 한화생명 이글스파크'];

    // Category: 피자
    const daejeonCat1 = await db.collection('categories').insertOne({
      stadiumId: daejeonId,
      name: 'Pizza',
      nameKo: '피자',
      createdAt: new Date().toISOString()
    });
    const daejeonCat1Id = daejeonCat1.insertedId;

    // Brand: 빽보이피자
    const daejeonBrand1 = await db.collection('brands').insertOne({
      categoryId: daejeonCat1Id,
      name: '빽보이피자',
      nameEn: 'Paik Boy Pizza',
      createdAt: new Date().toISOString()
    });
    const daejeonBrand1Id = daejeonBrand1.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: daejeonBrand1Id, name: '슈퍼빽보이피자', price: 15900, createdAt: new Date().toISOString() },
      { brandId: daejeonBrand1Id, name: '울트라빽보이피자', price: 19900, createdAt: new Date().toISOString() }
    ]);

    // Category: 스낵
    const daejeonCat2 = await db.collection('categories').insertOne({
      stadiumId: daejeonId,
      name: 'Snack',
      nameKo: '스낵',
      createdAt: new Date().toISOString()
    });
    const daejeonCat2Id = daejeonCat2.insertedId;

    // Brand: 연돈볼카츠
    const daejeonBrand2 = await db.collection('brands').insertOne({
      categoryId: daejeonCat2Id,
      name: '연돈볼카츠',
      nameEn: 'Yeondon Ball Katsu',
      createdAt: new Date().toISOString()
    });
    const daejeonBrand2Id = daejeonBrand2.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: daejeonBrand2Id, name: '볼카츠', price: 3000, createdAt: new Date().toISOString() },
      { brandId: daejeonBrand2Id, name: '볼카츠버거', price: 4000, createdAt: new Date().toISOString() }
    ]);

    console.log('✅ 대전 한화생명 이글스파크 데이터 생성 완료');

    // 10. 부산 사직야구장 데이터
    const busanId = stadiumMap['부산 사직야구장'];

    // Category: 분식
    const busanCat1 = await db.collection('categories').insertOne({
      stadiumId: busanId,
      name: 'Snack',
      nameKo: '분식',
      createdAt: new Date().toISOString()
    });
    const busanCat1Id = busanCat1.insertedId;

    // Brand: 33떡볶이
    const busanBrand1 = await db.collection('brands').insertOne({
      categoryId: busanCat1Id,
      name: '33떡볶이',
      nameEn: '33 Tteokbokki',
      createdAt: new Date().toISOString()
    });
    const busanBrand1Id = busanBrand1.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: busanBrand1Id, name: '가래떡떡볶이', price: 6900, createdAt: new Date().toISOString() },
      { brandId: busanBrand1Id, name: '로제떡볶이', price: 12000, createdAt: new Date().toISOString() }
    ]);

    // Brand: 다리집
    const busanBrand2 = await db.collection('brands').insertOne({
      categoryId: busanCat1Id,
      name: '다리집',
      nameEn: 'Darijib',
      createdAt: new Date().toISOString()
    });
    const busanBrand2Id = busanBrand2.insertedId;

    // Items
    await db.collection('items').insertMany([
      { brandId: busanBrand2Id, name: '떡볶이', price: 6000, createdAt: new Date().toISOString() },
      { brandId: busanBrand2Id, name: '오징어튀김', price: 6500, createdAt: new Date().toISOString() }
    ]);

    console.log('✅ 부산 사직야구장 데이터 생성 완료');

    // 통계 출력
    const stadiumsCount = await db.collection('stadiums').countDocuments();
    const categoriesCount = await db.collection('categories').countDocuments();
    const brandsCount = await db.collection('brands').countDocuments();
    const itemsCount = await db.collection('items').countDocuments();

    console.log('\n📊 데이터베이스 시드 완료 통계:');
    console.log(`- Stadiums: ${stadiumsCount}개`);
    console.log(`- Categories: ${categoriesCount}개`);
    console.log(`- Brands: ${brandsCount}개`);
    console.log(`- Items: ${itemsCount}개`);
    console.log('\n✅ 모든 데이터베이스 시드 완료!');
    console.log('\n💡 매장 관리자 계정을 생성하려면 store 프로젝트의 seed.js를 실행하세요.');
  } catch (error) {
    console.error('데이터베이스 시드 중 오류:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
