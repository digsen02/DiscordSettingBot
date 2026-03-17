import { EmbedBuilder } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { getSession } from "../../../../utils/sessionStore.js";

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", components: [] });
        return;
    }
    const { guildId } = session;
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
