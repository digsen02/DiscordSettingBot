import { EmbedBuilder } from "discord.js";
import { getSession } from "../../../../utils/sessionStore.js";
import { getSyncedGuilds } from "../../../../services/syncConfigService.js";

const STATUS_LABEL = {
    active: "🟢 활성",
    paused: "🟡 일시정지",
    pending: "⏳ 대기",
    rejected: "🔴 거부됨",
};

const STATUS_COLOR = {
    active: 0x57F287,
    paused: 0xFEE75C,
    pending: 0x99AAB5,
    rejected: 0xED4245,
};

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", embeds: [], components: [] });
        return;
    }
    const { guildId } = session;

    const sourceGuild = interaction.guild;
    const targetGuild = interaction.client.guilds.cache.get(guildId);

    // 두 서버 간 guild 타입 syncConfig 조회
    const allSyncs = await getSyncedGuilds(interaction.guildId);
    const guildSync = allSyncs.find(
        (s) =>
            s.syncType === "guild" &&
            (s.sourceGuildId === guildId || s.targetGuildId === guildId)
    );

    const status = guildSync?.status ?? "pending";
    const direction = guildSync?.direction === "two_way" ? "↔️ 양방향" : "➡️ 단방향";
    const createdAt = guildSync?.createdAt
        ? `<t:${Math.floor(new Date(guildSync.createdAt).getTime() / 1000)}:F>`
        : "알 수 없음";
    const createdBy = guildSync?.createdBy ? `<@${guildSync.createdBy}>` : "알 수 없음";
    const color = STATUS_COLOR[status] ?? 0x5865F2;

    const embed = new EmbedBuilder()
        .setTitle(`🏠 길드 동기화 — ${targetGuild?.name ?? guildId}`)
        .setDescription("길드 전체 동기화 설정입니다.")
        .setThumbnail(targetGuild?.iconURL({ dynamic: true }) ?? null)
        .setColor(color)
        .addFields(
            { name: "📤 Source 서버", value: `**${sourceGuild.name}**\n\`${sourceGuild.id}\``, inline: true },
            { name: "📥 Target 서버", value: `**${targetGuild?.name ?? "알 수 없음"}**\n\`${guildId}\``, inline: true },
            { name: "\u200B", value: "\u200B", inline: true },
            { name: "📊 상태", value: STATUS_LABEL[status] ?? status, inline: true },
            { name: "🔀 방향", value: direction, inline: true },
            { name: "\u200B", value: "\u200B", inline: true },
            { name: "👤 생성자", value: createdBy, inline: true },
            { name: "📅 생성일", value: createdAt, inline: true },
        )
        .setFooter({ text: `서버 ID: ${guildId}` })
        .setTimestamp();

    await interaction.update({
        embeds: [embed],
        components: [],
    });
}
