import { EmbedBuilder } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { getSession } from "../../../../utils/sessionStore.js";

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", embeds: [], components: [] });
        return;
    }
    const { guildId, embed: embedData } = session;

    const targetGuild = interaction.client.guilds.cache.get(guildId);
    const members = [...interaction.guild.members.cache
        .filter((member) => !member.user.bot)
        .values()];

    const userRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("choise_user")
            .setPlaceholder("작업을 시작할 유저를 선택하세요")
            .addOptions(
                ...members.slice(0, 25).map((member) => ({
                    label: member.user.username,
                    value: `sync_user_detail:${sessionKey}|${member.user.id}`,
                    description: `역할 ${member.roles.cache.filter((r) => r.name !== "@everyone").size}개`,
                }))
            )
    );

    const embed = new EmbedBuilder()
        .setTitle(`👤 유저 동기화 — ${targetGuild?.name ?? guildId}`)
        .setDescription("상세 설정할 유저를 선택하세요.")
        .setThumbnail(targetGuild?.iconURL({ dynamic: true }) ?? null)
        .setColor(0x5865F2)
        .addFields(
            { name: "👥 현재 서버 멤버 수", value: `봇 제외 **${members.length}명**`, inline: true },
        )
        .setFooter({ text: `최대 25명 표시 · 서버 ID: ${guildId}` })
        .setTimestamp();

    await interaction.update({
        embeds: [embed],
        components: [userRow],
    });
}
