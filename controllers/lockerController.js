import { ObjectId } from 'mongodb';
import { getZoneByBlock } from '../utils/mapping.js';

/**
 * 락커를 사용자에게 배정하는 함수
 * 
 * @param {Object} db - MongoDB 데이터베이스 인스턴스
 * @param {Object} client - MongoDB 클라이언트 (Transaction 사용을 위해 필요)
 * @param {string} seatBlock - 좌석 블록 번호 (예: "102")
 * @param {string} userId - 사용자 ID
 * @returns {Promise<Object>} 배정된 락커 정보
 */
export async function assignLocker(db, client, seatBlock, userId) {
  const session = client.startSession();
  
  try {
    let assignedLocker = null;
    
    // Transaction 시작
    await session.withTransaction(async () => {
      // 1. Block 번호로 Target Zone 찾기
      const targetZone = getZoneByBlock(seatBlock);
      
      if (!targetZone) {
        throw new Error(`유효하지 않은 블록 번호입니다: ${seatBlock}`);
      }
      
      // 2. Target Zone에서 빈 락커를 찾아서 원자적으로 업데이트
      let locker = await db.collection('lockers').findOneAndUpdate(
        { 
          zone: targetZone,
          status: 'available'
        },
        { 
          $set: { 
            status: 'occupied',
            userId: userId,
            assignedAt: new Date().toISOString(),
            seatBlock: seatBlock,
            updatedAt: new Date().toISOString()
          }
        },
        { 
          session,
          returnDocument: 'after' // 업데이트 후 문서 반환
        }
      );
      
      // 3. Target Zone에 빈 락커가 없으면 Zone_C(예비 구역)에서 찾기 (Fallback)
      if (!locker && targetZone !== 'Zone_C') {
        locker = await db.collection('lockers').findOneAndUpdate(
          { 
            zone: 'Zone_C',
            status: 'available'
          },
          { 
            $set: { 
              status: 'occupied',
              userId: userId,
              assignedAt: new Date().toISOString(),
              seatBlock: seatBlock,
              updatedAt: new Date().toISOString()
            }
          },
          { 
            session,
            returnDocument: 'after'
          }
        );
      }
      
      // 4. 락커를 찾지 못한 경우
      if (!locker) {
        throw new Error('사용 가능한 락커가 없습니다.');
      }
      
      // 5. 할당된 락커 정보 저장
      assignedLocker = locker;
    });
    
    // 8. 반환할 락커 정보 구성
    return {
      lockerId: assignedLocker.lockerId || assignedLocker._id.toString(),
      location: assignedLocker.location || `${assignedLocker.zone} 락커 구역`,
      zone: assignedLocker.zone,
      status: assignedLocker.status
    };
    
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
}

