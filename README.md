# Food Locker Backend API

백엔드 API 서버입니다. 소비자 앱과 매장 관리 앱이 공통으로 사용하는 REST API를 제공합니다.

## 기술 스택

- Node.js
- Express.js
- MongoDB

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 MONGODB_URI를 설정하세요

# 데이터베이스 시드 (초기 데이터 생성)
npm run seed

# 서버 실행
npm start
```

서버는 기본적으로 `http://localhost:3001`에서 실행됩니다.

## 환경 변수

`.env` 파일에 다음 변수를 설정하세요:

- `MONGODB_URI`: MongoDB 연결 URI
- `PORT`: 서버 포트 (기본값: 3001)

## API 엔드포인트

### Stadiums
- `GET /api/stadiums` - 모든 야구장 조회

### Categories
- `GET /api/stadiums/:stadiumId/categories` - 특정 야구장의 카테고리 조회

### Brands
- `GET /api/categories/:categoryId/brands` - 특정 카테고리의 브랜드 조회
- `GET /api/brands/:brandId` - 특정 브랜드 정보 조회

### Items
- `GET /api/brands/:brandId/items` - 특정 브랜드의 아이템 조회
- `GET /api/items` - 모든 아이템 조회 (필터링 옵션)

### Orders
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 조회 (userId, status, brandId 필터링)
- `GET /api/orders/:orderId` - 특정 주문 조회
- `PATCH /api/orders/:orderId/status` - 주문 상태 업데이트

### Users
- `POST /api/users` - 사용자 생성
- `GET /api/users/:userId` - 사용자 정보 조회
- `PATCH /api/users/:userId` - 사용자 정보 업데이트

### Store Managers
- `POST /api/store-managers/login` - 매장 관리자 로그인
- `GET /api/store-managers/:id` - 매장 관리자 정보 조회

## 데이터베이스 시드

`npm run seed` 명령어를 실행하면 다음 데이터가 생성됩니다:

- 9개의 야구장 (Stadiums)
- 각 야구장별 카테고리 (Categories)
- 각 카테고리별 브랜드 (Brands)
- 각 브랜드별 메뉴 아이템 (Items)

## 문제 해결

### MongoDB 연결 오류
- `.env` 파일에 `MONGODB_URI`가 올바르게 설정되었는지 확인하세요
- MongoDB Atlas에서 IP 화이트리스트 설정을 확인하세요

### 포트가 이미 사용 중인 경우
- 다른 터미널에서 서버를 실행 중일 수 있습니다
- `Ctrl + C`로 기존 서버를 종료하거나, `.env` 파일에서 `PORT`를 변경하세요

