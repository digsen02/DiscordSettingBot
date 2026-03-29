import { getSession, setSession } from "../../../../utils/sessionStore.js";
import { getSyncedGuilds } from "../../../../services/syncConfigService.js";
import { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from "discord.js";

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

const TYPE_LABEL = {
    user: "👤 유저",
    role: "🎭 역할",
    channel: "📺 채널",
    category: "📁 카테고리",
    guild: "🏠 길드",
};

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", embeds: [], components: [] });
        return;
    }
    const { guildId } = session;

    const targetGuild = interaction.client.guilds.cache.get(guildId);
    if (!targetGuild) {
        await interaction.update({ content: "서버를 찾을 수 없습니다.", embeds: [], components: [] });
        return;
    }

    // 두 서버 간 syncConfig 조회
    const syncConfigs = await getSyncedGuilds(interaction.guildId);
    const relatedSyncs = syncConfigs.filter(
        (s) => s.sourceGuildId === guildId || s.targetGuildId === guildId
    );

    // 활성화된 타입 목록
    const activatedTypes = relatedSyncs.map((s) => s.syncType);
    const allTypes = ["user", "role", "channel", "category", "guild"];
    const typeStatusLine = allTypes
        .map((t) => (activatedTypes.includes(t) ? `✅ ${TYPE_LABEL[t]}` : `❌ ${TYPE_LABEL[t]}`))
        .join("\n");

    // 대표 sync로 상태/방향 표시
    const repSync = relatedSyncs[0];
    const statusLabel = repSync ? (STATUS_LABEL[repSync.status] ?? repSync.status) : "❓ 없음";
    const directionLabel = repSync?.direction === "two_way" ? "↔️ 양방향" : "➡️ 단방향";
    const color = repSync ? (STATUS_COLOR[repSync.status] ?? 0x5865F2) : 0x5865F2;

    const createdAt = repSync?.createdAt
        ? `<t:${Math.floor(new Date(repSync.createdAt).getTime() / 1000)}:R>`
        : "알 수 없음";

    const embed = new EmbedBuilder()
        .setTitle(`🛠️ ${targetGuild.name}`)
        .setDescription("동기화 항목을 아래에서 선택하세요.")
        .setThumbnail(targetGuild.iconURL({ dynamic: true }) ?? null)
        .setColor(color)
        .addFields(
            { name: "📊 동기화 상태", value: statusLabel, inline: true },
            { name: "🔀 방향", value: directionLabel, inline: true },
            { name: "📅 최초 생성", value: createdAt, inline: true },
            { name: "🗂️ 동기화 타입", value: typeStatusLine || "설정 없음", inline: false },
        )
        .setFooter({ text: `서버 ID: ${guildId}` })
        .setTimestamp();

    const detailSyncRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("sync_select")
            .setPlaceholder("항목을 선택하세요")
            .addOptions(
                { label: "유저", value: `sync_user:${sessionKey}`, description: "유저 동기화 관리" },
                { label: "역할", value: `sync_role:${sessionKey}`, description: "역할 동기화 관리" },
                { label: "채널", value: `sync_channel:${sessionKey}`, description: "채널 동기화 관리" },
                { label: "카테고리", value: `sync_category:${sessionKey}`, description: "카테고리 동기화 관리" },
                { label: "길드 (서버)", value: `sync_guild:${sessionKey}`, description: "길드 (서버) 동기화 관리" },
            )
    );

    // 다음 단계를 위해 embed를 세션에 업데이트
    const allSyncConfigs = await getSyncedGuilds(interaction.guildId);
    const currentGuildId = interaction.guildId;
    const syncedGuildIds = [
        ...new Set(
            allSyncConfigs.flatMap((s) =>
                [s.sourceGuildId, s.targetGuildId].filter(Boolean)
            )
        ),
    ].filter((id) => id !== currentGuildId);

    const syncedGuildsOptions = syncedGuildIds.slice(0, 25).map((id) => {
        const g = interaction.client.guilds.cache.get(id);
        const key = setSession({ guildId: id, embed: embed.toJSON() });
        return {
            label: (g?.name ?? id).slice(0, 100),
            value: `select_guild:${key}`,
        };
    });

    const syncedGuildRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("choise_synced_guild")
            .setPlaceholder("상세 설정할 서버를 선택하세요.")
            .addOptions(
                syncedGuildsOptions.length > 0
                    ? syncedGuildsOptions
                    : [{ label: "동기화된 서버 없음", value: "none" }]
            )
    );

    await interaction.update({
        embeds: [embed],
        components: [syncedGuildRow, detailSyncRow],
    });
}
