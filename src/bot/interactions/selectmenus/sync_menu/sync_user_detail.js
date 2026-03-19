import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getSession } from "../../../../utils/sessionStore.js";

const DEFAULT_USER_DETAIL_SETTINGS = {
    nickname: false,
    roles: false,
};

function getOrInitUserSettings(session, userId) {
    if (!session.userDetailSettings) session.userDetailSettings = {};
    if (!session.userDetailSettings[userId]) {
        session.userDetailSettings[userId] = {
            ...DEFAULT_USER_DETAIL_SETTINGS,
            savedAt: null,
        };
    }
    return session.userDetailSettings[userId];
}

function enabledList(settings) {
    const enabled = [];
    if (settings.nickname) enabled.push("닉네임");
    if (settings.roles) enabled.push("역할");
    return enabled.length > 0 ? enabled.map((v) => `✅ ${v}`).join(", ") : "없음";
}

export function buildUserDetailPayload({ interaction, sessionKey, guildId, targetGuild, userId, settings }) {
    const member = interaction.guild.members.cache.get(userId);
    const user = member?.user;

    const titleGuildName = targetGuild?.name ?? guildId;
    const color = 0x5865F2;

    const embed = new EmbedBuilder()
        .setTitle("⚙️ 유저 상세 동기화 설정")
        .setDescription(`대상: <@${userId}>\n아래 토글로 항목을 선택하세요.`)
        .setThumbnail(user?.displayAvatarURL?.({ dynamic: true }) ?? null)
        .setColor(color)
        .addFields(
            { name: "📌 대상 유저", value: `<@${userId}>\n\`${userId}\``, inline: true },
            { name: "🏷️ 대상 서버", value: `**${titleGuildName}**\n\`${guildId}\``, inline: true },
            { name: "\u200B", value: "\u200B", inline: true },
            { name: "🔀 적용 범위", value: "**유저별 설정**", inline: true },
            { name: "✅ 활성 항목", value: enabledList(settings), inline: true },
            { name: "\u200B", value: "\u200B", inline: true },
            {
                name: "⚠️ 주의",
                value:
                    "역할 동기화는 서버 권한/상위 역할에 따라 적용되지 않을 수 있습니다.\n(정책 문구이며 실제 적용 로직은 별도 구현)",
                inline: false,
            }
        )
        .setFooter({
            text: settings.savedAt
                ? `마지막 저장: ${settings.savedAt} · 서버 ID: ${guildId}`
                : `서버 ID: ${guildId}`,
        })
        .setTimestamp();

    const toggleRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`user_sync_toggle_nickname:${sessionKey}|${userId}`)
            .setLabel(`닉네임: ${settings.nickname ? "ON" : "OFF"}`)
            .setStyle(settings.nickname ? ButtonStyle.Primary : ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`user_sync_toggle_roles:${sessionKey}|${userId}`)
            .setLabel(`역할: ${settings.roles ? "ON" : "OFF"}`)
            .setStyle(settings.roles ? ButtonStyle.Primary : ButtonStyle.Secondary)
    );

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`user_sync_save:${sessionKey}|${userId}`)
            .setLabel("저장")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`user_sync_reset:${sessionKey}|${userId}`)
            .setLabel("초기화")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`user_sync_back:${sessionKey}`)
            .setLabel("뒤로(유저 선택)")
            .setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [toggleRow, actionRow] };
}

export default async function (interaction, sessionKeyWithUserId) {
    const [sessionKey, userId] = (sessionKeyWithUserId ?? "").split("|");
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", embeds: [], components: [] });
        return;
    }

    const { guildId } = session;
    const targetGuild = interaction.client.guilds.cache.get(guildId);
    const settings = getOrInitUserSettings(session, userId);

    const payload = buildUserDetailPayload({
        interaction,
        sessionKey,
        guildId,
        targetGuild,
        userId,
        settings,
    });

    await interaction.update(payload);
}

