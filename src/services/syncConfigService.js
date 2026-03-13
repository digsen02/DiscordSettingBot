import * as repo from "../database/repositories/syncConfigRepository.js";
import * as guildRepo from "../database/repositories/guildRepository.js";

/**
 * 두 길드 간 특정 타입 동기화가 이미 존재하는지 확인
 * syncType 생략 시 모든 타입에 대해 확인
 */
export async function isSyncAlreadyExists(sourceGuildId, targetGuildId, syncType) {
    return repo.isSyncAlreadyExists(sourceGuildId, targetGuildId, syncType);
}

/**
 * guildId가 관여된 모든 동기화 조회
 */
export async function getSyncedGuilds(guildId) {
    return repo.findAllForGuild(guildId);
}

/**
 * 새 동기화 생성 (수락 시 호출)
 * ownerGuildId: 동기화를 요청한 길드 (데이터를 받는 쪽 = targetGuildId)
 * sourceGuildId: 동기화를 수락한 길드 (데이터를 제공하는 쪽)
 * syncType: 동기화 타입 (기본값: "guild")
 */
export async function createSync({ ownerGuildId, sourceGuildId, targetGuildId, syncType = "guild", options = {}, createdBy }) {
    return repo.createSync({
        ownerGuildId,
        sourceGuildId,
        targetGuildId,
        syncType,
        direction: "one_way",
        status: "active",
        enabled: true,
        options,
        createdBy,
    });
}

/**
 * 두 길드 간 동기화 관계 조회 + 로그 채널 정보 포함
 * @returns {{ syncIds, sourceGuildId, targetGuildId, sourceLogChannelId, targetLogChannelId } | null}
 */
export async function getDesyncInfo(guildId, relatedGuildId) {
    const syncs = await repo.findBetweenGuilds(guildId, relatedGuildId);
    if (!syncs || syncs.length === 0) return null;

    // 대표 도큐먼트로 방향 판별
    const sync = syncs[0];

    const [sourceGuild, targetGuild] = await Promise.all([
        guildRepo.findByGuildId(sync.sourceGuildId),
        guildRepo.findByGuildId(sync.targetGuildId),
    ]);

    return {
        syncIds: syncs.map((s) => s._id),
        sourceGuildId: sync.sourceGuildId,
        targetGuildId: sync.targetGuildId,
        sourceLogChannelId: sourceGuild?.logChannelId ?? null,
        targetLogChannelId: targetGuild?.logChannelId ?? null,
    };
}

/**
 * 두 길드 간 모든 동기화 제거
 */
export async function removeSyncBetweenGuilds(guildId, relatedGuildId) {
    return repo.removeSyncBetweenGuilds(guildId, relatedGuildId);
}
