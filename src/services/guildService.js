import * as repo from "../database/repositories/guildRepository.js";

/**
 * 길드 초기화: 로그 채널 설정 (생성 or 업데이트)
 */
export async function initGuild(guildId, logChannelId) {
    return repo.upsertLogChannel(guildId, logChannelId);
}

/**
 * 해당 길드에 이미 동일한 로그 채널이 설정되어 있는지 확인
 */
export async function isLogChannelAlreadySet(guildId, logChannelId) {
    return repo.isLogChannelAlreadySet(guildId, logChannelId);
}

/**
 * 길드 설정 조회
 */
export async function getGuildSetting(guildId) {
    return repo.findByGuildId(guildId);
}
