const store = new Map();

/**
 * 데이터를 임시 저장하고 랜덤 세션 키를 반환
 * @param {object} data - 저장할 데이터
 * @param {number} ttl - 만료 시간(ms), 기본 5분
 * @returns {string} 8자리 랜덤 세션 키
 */
export function setSession(data, ttl = 5 * 60 * 1000) {
    const key = Math.random().toString(36).slice(2, 10);
    store.set(key, data);
    setTimeout(() => store.delete(key), ttl);
    return key;
}

/**
 * 세션 키로 저장된 데이터를 조회
 * @param {string} key - 세션 키
 * @returns {object|null} 저장된 데이터 또는 null (만료/미존재)
 */
export function getSession(key) {
    return store.get(key) ?? null;
}
