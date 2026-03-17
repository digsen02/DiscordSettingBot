import { EmbedBuilder } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export default async function (interaction) {
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
                    value: member.user.id,
                }))
            )
    );

    const embed = new EmbedBuilder()
        .setTitle("유저 동기화 관리")
        .setDescription(`유저 동기화 관리 패널입니다. 아래 셀렉션에서 고르세요.`);

    await interaction.update({
        embeds: [embed],
        components: [userRow],
    });
}
