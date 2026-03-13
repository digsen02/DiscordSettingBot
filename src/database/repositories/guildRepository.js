import Guild from "../models/guildModel.js";

/**
 * guildId로 길드 정보 조회
 */
export async function findByGuildId(guildId) {
    return Guild.findOne({ guildId });
}

/**
 * 이미 동일한 로그 채널이 설정되어 있는지 확인
 */
export async function isLogChannelAlreadySet(guildId, logChannelId) {
    const result = await Guild.findOne({ guildId, logChannelId });
    return !!result;
}

/**
 * 길드 생성 또는 로그 채널 업데이트 (upsert)
 */
export async function upsertLogChannel(guildId, logChannelId) {
    return Guild.findOneAndUpdate(
        { guildId },
        {
            $set: { logChannelId },
            $setOnInsert: { initializedAt: new Date() },
        },
        { upsert: true, new: true }
    );
}
