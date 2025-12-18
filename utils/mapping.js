/**
 * Block 번호를 Zone으로 매핑하는 유틸리티 함수
 * 
 * 매핑 규칙:
 * - 1루 내야 (101~110 블록) -> Zone_A
 * - 3루 내야 (201~210 블록) -> Zone_B
 * - 외야 (301~320 블록) -> Zone_C
 * 
 * @param {string|number} block - 좌석 블록 번호
 * @returns {string} Zone 이름 (Zone_A, Zone_B, Zone_C) 또는 null
 */
export function getZoneByBlock(block) {
  const blockNum = parseInt(block, 10);
  
  if (isNaN(blockNum)) {
    return null;
  }
  
  // 1루 내야: 101~110
  if (blockNum >= 101 && blockNum <= 110) {
    return 'Zone_A';
  }
  
  // 3루 내야: 201~210
  if (blockNum >= 201 && blockNum <= 210) {
    return 'Zone_B';
  }
  
  // 외야: 301~320
  if (blockNum >= 301 && blockNum <= 320) {
    return 'Zone_C';
  }
  
  // 매핑되지 않은 블록
  return null;
}

