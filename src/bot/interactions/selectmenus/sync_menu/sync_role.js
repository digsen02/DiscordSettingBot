import { EmbedBuilder } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { getSession } from "../../../../utils/sessionStore.js";

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", embeds: [], components: [] });
        return;
    }
    const { guildId } = session;

    const targetGuild = interaction.client.guilds.cache.get(guildId);
    const roles = [...interaction.guild.roles.cache
        .filter((r) => r.name !== "@everyone")
        .sort((a, b) => b.position - a.position)
        .values()];

    const roleRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("choise_role")
            .setPlaceholder("작업을 시작할 역할을 선택하세요")
            .addOptions(
                ...roles.slice(0, 25).map((role) => ({
                    label: role.name,
                    value: role.id,
                    description: `색상: ${role.hexColor} · 멤버 수: ${role.members.size}명`,
                }))
            )
    );

    const topRolesPreview = roles.slice(0, 10).map((r) => `\`${r.name}\``).join(", ") || "없음";

    const embed = new EmbedBuilder()
        .setTitle(`🎭 역할 동기화 — ${targetGuild?.name ?? guildId}`)
        .setDescription("동기화할 역할을 선택하세요.")
        .setThumbnail(targetGuild?.iconURL({ dynamic: true }) ?? null)
        .setColor(0xEB459E)
        .addFields(
            { name: "🎭 역할 수", value: `**${roles.length}개**`, inline: true },
            { name: "📋 상위 역할 목록", value: topRolesPreview, inline: false },
        )
        .setFooter({ text: `최대 25개 표시 · 서버 ID: ${guildId}` })
        .setTimestamp();

    await interaction.update({
        embeds: [embed],
        components: [roleRow],
    });
}
