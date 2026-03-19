import { EmbedBuilder, ChannelType } from "discord.js";
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
    const categories = [...interaction.guild.channels.cache
        .filter((ch) => ch.type === ChannelType.GuildCategory)
        .values()];

    const categoryRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("choise_category")
            .setPlaceholder("작업을 시작할 카테고리를 선택하세요")
            .addOptions(
                ...categories.slice(0, 25).map((ch) => ({
                    label: ch.name,
                    value: ch.id,
                    description: `하위 채널 수: ${ch.children?.cache.size ?? 0}개`,
                }))
            )
    );

    const embed = new EmbedBuilder()
        .setTitle(`📁 카테고리 동기화 — ${targetGuild?.name ?? guildId}`)
        .setDescription("동기화할 카테고리를 선택하세요.")
        .setThumbnail(targetGuild?.iconURL({ dynamic: true }) ?? null)
        .setColor(0xFEE75C)
        .addFields(
            { name: "📁 카테고리 수", value: `**${categories.length}개**`, inline: true },
        )
        .setFooter({ text: `최대 25개 표시 · 서버 ID: ${guildId}` })
        .setTimestamp();

    await interaction.update({
        embeds: [embed],
        components: [categoryRow],
    });
}
