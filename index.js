import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 같은 디렉토리의 .env 파일 읽기
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB 연결
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI가 설정되지 않았습니다.');
  process.exit(1);
}

const client = new MongoClient(uri);
let db;

// MongoDB 연결
async function connectDB() {
  try {
    await client.connect();
    db = client.db('food-locker');
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    process.exit(1);
  }
}

// MongoDB 연결 확인 미들웨어
const checkDBConnection = (req, res, next) => {
  if (!db) {
    return res.status(503).json({ error: '데이터베이스 연결 중입니다. 잠시 후 다시 시도해주세요.' });
  }
  next();
};

// 모든 API 엔드포인트에 DB 연결 확인 미들웨어 적용
app.use('/api', checkDBConnection);

// ========== Stadiums API ==========
// 모든 Stadiums 가져오기
app.get('/api/stadiums', async (req, res) => {
  try {
    const stadiums = await db.collection('stadiums').find({}).toArray();
    res.json(stadiums.map(s => ({ ...s, id: s._id.toString() })));
  } catch (error) {
    console.error('Error fetching stadiums:', error);
    res.status(500).json({ error: 'Stadiums를 가져오는 중 오류가 발생했습니다.' });
  }
});

// ========== Categories API ==========
// 특정 Stadium의 Categories 가져오기
app.get('/api/stadiums/:stadiumId/categories', async (req, res) => {
  try {
    const { stadiumId } = req.params;
    const categories = await db.collection('categories')
      .find({ stadiumId: new ObjectId(stadiumId) })
      .toArray();
    res.json(categories.map(c => ({ ...c, id: c._id.toString() })));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Categories를 가져오는 중 오류가 발생했습니다.' });
  }
});

// ========== Brands API ==========
// 특정 Category의 Brands 가져오기
app.get('/api/categories/:categoryId/brands', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const brands = await db.collection('brands')
      .find({ categoryId: new ObjectId(categoryId) })
      .toArray();
    res.json(brands.map(b => ({ ...b, id: b._id.toString() })));
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Brands를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 특정 Brand 정보 가져오기
app.get('/api/brands/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    const brand = await db.collection('brands').findOne({ _id: new ObjectId(brandId) });
    if (!brand) {
      return res.status(404).json({ error: 'Brand를 찾을 수 없습니다.' });
    }
    res.json({ ...brand, id: brand._id.toString() });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ error: 'Brand를 가져오는 중 오류가 발생했습니다.' });
  }
});

// ========== Items API ==========
// 특정 Brand의 Items 가져오기
app.get('/api/brands/:brandId/items', async (req, res) => {
  try {
    const { brandId } = req.params;
    const items = await db.collection('items')
      .find({ brandId: new ObjectId(brandId) })
      .toArray();
    res.json(items.map(i => ({ 
      ...i, 
      id: i._id.toString(),
      brandId: i.brandId ? i.brandId.toString() : brandId
    })));
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Items를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 모든 카테고리의 모든 아이템 가져오기 (HomePage용)
app.get('/api/items', async (req, res) => {
  try {
    const { categoryId } = req.query;
    let items = [];
    
    if (categoryId) {
      // categoryId로 필터링하려면 brands를 통해 찾아야 함
      const brands = await db.collection('brands')
        .find({ categoryId: new ObjectId(categoryId) })
        .toArray();
      const brandIds = brands.map(b => b._id);
      
      if (brandIds.length > 0) {
        items = await db.collection('items')
          .find({ brandId: { $in: brandIds } })
          .toArray();
      }
    } else {
      items = await db.collection('items').find({}).toArray();
    }
    
    res.json(items.map(i => ({ 
      ...i, 
      id: i._id.toString(),
      brandId: i.brandId ? i.brandId.toString() : null
    })));
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Items를 가져오는 중 오류가 발생했습니다.' });
  }
});

// ========== Orders API ==========
// 주문 생성
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const result = await db.collection('orders').insertOne(orderData);
    res.json({ id: result.insertedId.toString(), ...orderData });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: '주문 생성 중 오류가 발생했습니다.' });
  }
});

// 특정 주문 가져오기
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    }
    res.json({ ...order, id: order._id.toString() });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: '주문을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 사용자의 진행중인 주문 가져오기
app.get('/api/orders', async (req, res) => {
  try {
    const { userId, status, brandId } = req.query;
    let query = {};
    if (userId) {
      query.userId = userId;
    }
    if (status) {
      if (status === 'active') {
        query.status = { $in: ['received', 'cooking'] };
      } else {
        query.status = status;
      }
    }
    // brandId로 필터링 (주문의 brandIds 배열에 해당 brandId가 포함된 경우)
    if (brandId) {
      // MongoDB에서 배열 필드에 특정 값이 포함되어 있는지 확인
      query.brandIds = { $in: [brandId] };
    }
    
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders.map(o => ({ ...o, id: o._id.toString() })));
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: '주문을 가져오는 중 오류가 발생했습니다.' });
  }
});

// 주문 상태 업데이트 (실시간 업데이트용)
app.patch('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status, updatedAt: new Date().toISOString() } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: '주문 상태 업데이트 중 오류가 발생했습니다.' });
  }
});

// ========== Users API ==========
// 사용자 생성 (회원가입)
app.post('/api/users', async (req, res) => {
  try {
    const { userId, name, email, phone, newsletter, authProvider } = req.body;
    
    // 디버깅: 받은 데이터 확인
    console.log('받은 사용자 데이터:', { userId, name, email, phone, newsletter, authProvider });
    
    // 이미 존재하는 사용자인지 확인
    const existingUser = await db.collection('users').findOne({ userId });
    if (existingUser) {
      // 기존 사용자가 있으면 phone 필드 업데이트 (phone이 전달된 경우)
      if (phone !== undefined) {
        await db.collection('users').updateOne(
          { userId },
          { $set: { phone: phone || '', updatedAt: new Date().toISOString() } }
        );
        const updatedUser = await db.collection('users').findOne({ userId });
        console.log('기존 사용자 phone 업데이트 완료:', updatedUser.phone);
        return res.json({ ...updatedUser, id: updatedUser._id.toString() });
      }
      return res.json({ ...existingUser, id: existingUser._id.toString() });
    }

    const userData = {
      userId,
      name,
      email,
      phone: phone || '',
      newsletter: newsletter || false,
      authProvider: authProvider || 'email', // 'email', 'google', 'naver', 'kakao'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('저장할 사용자 데이터:', userData);
    const result = await db.collection('users').insertOne(userData);
    const savedUser = { id: result.insertedId.toString(), ...userData };
    console.log('사용자 저장 완료:', savedUser);
    res.json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: '사용자 생성 중 오류가 발생했습니다.' });
  }
});

// 사용자 조회
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.collection('users').findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json({ ...user, id: user._id.toString() });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: '사용자를 가져오는 중 오류가 발생했습니다.' });
  }
});

// 사용자 정보 업데이트
app.patch('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await db.collection('users').updateOne(
      { userId },
      { $set: updateData }
    );
    const user = await db.collection('users').findOne({ userId });
    res.json({ ...user, id: user._id.toString() });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: '사용자 정보 업데이트 중 오류가 발생했습니다.' });
  }
});

// ========== Store Managers API ==========
// 매장 관리자 로그인
app.post('/api/store-managers/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '아이디와 비밀번호를 입력해주세요.' });
    }

    const manager = await db.collection('store-managers').findOne({ username });
    
    if (!manager) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인 (실제로는 해시된 비밀번호를 비교해야 함)
    if (manager.password !== password) {
      return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 로그인 성공 (실제로는 JWT 토큰 등을 발급해야 함)
    res.json({
      success: true,
      manager: {
        id: manager._id.toString(),
        username: manager.username,
        brandId: manager.brandId || null,
        brandName: manager.brandName || '전체 관리자',
        stadiumId: manager.stadiumId || null,
        stadiumName: manager.stadiumName || '전체',
        role: manager.role || 'store',
        isAdmin: manager.isAdmin || false
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

// 매장 관리자 조회
app.get('/api/store-managers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const manager = await db.collection('store-managers').findOne({ _id: new ObjectId(id) });
    if (!manager) {
      return res.status(404).json({ error: '매장 관리자를 찾을 수 없습니다.' });
    }
    res.json({
      id: manager._id.toString(),
      username: manager.username,
      brandId: manager.brandId,
      brandName: manager.brandName,
      stadiumId: manager.stadiumId,
      stadiumName: manager.stadiumName
    });
  } catch (error) {
    console.error('Error fetching store manager:', error);
    res.status(500).json({ error: '매장 관리자 조회 중 오류가 발생했습니다.' });
  }
});

// MongoDB 연결 후 서버 시작
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}).catch((error) => {
  console.error('서버 시작 실패:', error);
  process.exit(1);
});

