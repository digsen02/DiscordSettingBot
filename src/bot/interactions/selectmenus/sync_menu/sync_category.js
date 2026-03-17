import { EmbedBuilder, ChannelType } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { getSession } from "../../../../utils/sessionStore.js";

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", components: [] });
        return;
    }
    const { guildId } = session;
    const categories = interaction.guild.channels.cache.filter(
        (ch) => ch.type === ChannelType.GuildCategory
    );
    const targetRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("choise_category")
            .setPlaceholder("작업을 시작할 카테고리를 선택하세요")
            .addOptions(
                ...categories.map((ch) => ({
                    label: ch.name,
                    value: ch.id,
                }))
            )
    );
    const embed = new EmbedBuilder().setTitle("asd").setDescription(`asd`);

    await interaction.update({
        embeds: [embed],
        components: [targetRow],
    });
}
