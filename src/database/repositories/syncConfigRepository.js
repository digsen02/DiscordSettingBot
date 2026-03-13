import SyncConfig from "../models/syncConfigModel.js";

/**
 * 두 길드 간 특정 타입 동기화 존재 여부 확인
 */
export async function isSyncAlreadyExists(sourceGuildId, targetGuildId, syncType) {
    const query = { sourceGuildId, targetGuildId };
    if (syncType) query.syncType = syncType;
    const result = await SyncConfig.findOne(query);
    return !!result;
}

/**
 * guildId가 관여된 모든 동기화 조회 (owner / source / target 모두 포함)
 */
export async function findAllForGuild(guildId) {
    return SyncConfig.find({
        $or: [
            { ownerGuildId: guildId },
            { sourceGuildId: guildId },
            { targetGuildId: guildId },
        ],
        status: { $ne: "rejected" },
    });
}

/**
 * 두 길드 사이의 모든 동기화 도큐먼트 조회 (방향 무관)
 */
export async function findBetweenGuilds(guildId, relatedGuildId) {
    return SyncConfig.find({
        $or: [
            { sourceGuildId: guildId, targetGuildId: relatedGuildId },
            { sourceGuildId: relatedGuildId, targetGuildId: guildId },
        ],
        status: { $ne: "rejected" },
    });
}

/**
 * 새 동기화 도큐먼트 생성
 */
export async function createSync({
    ownerGuildId,
    sourceGuildId,
    targetGuildId,
    syncType = "guild",
    direction = "one_way",
    status = "active",
    enabled = true,
    options = {},
    createdBy,
}) {
    const sync = new SyncConfig({
        ownerGuildId,
        sourceGuildId,
        targetGuildId,
        syncType,
        direction,
        status,
        enabled,
        options,
        createdBy,
    });
    await sync.save();
    return sync;
}

/**
 * 두 길드 간 모든 동기화 도큐먼트 삭제
 */
export async function removeSyncBetweenGuilds(guildId, relatedGuildId) {
    return SyncConfig.deleteMany({
        $or: [
            { sourceGuildId: guildId, targetGuildId: relatedGuildId },
            { sourceGuildId: relatedGuildId, targetGuildId: guildId },
        ],
    });
}
