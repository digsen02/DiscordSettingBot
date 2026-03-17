import { EmbedBuilder } from "discord.js";
import { getSession } from "../../../utils/sessionStore.js";

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", components: [] });
        return;
    }
    const { guildId, logChannelId } = session;

    const channel = await interaction.client.channels.fetch(logChannelId);
    try {
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("❌ 단방향 동기화 거절")
                    .setDescription(
                        `서버 단방향 동기화가 거절되었습니다.\n` +
                        `본 서버: ${interaction.guild.name} (${interaction.guildId})\n` +
                        `대상 서버: ${guildId}\n\n` +
                        `단방향 동기화가 거절되었습니다.`
                    )
                    .setColor(0xff0000),
            ],
        });
    } catch (error) {
        console.error("❌ 단방향 동기화 거절 알림 전송 중 오류 발생:", error);
        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle("❌ 단방향 동기화 거절 오류")
                    .setDescription(
                        `단방향 동기화 거절 알림 전송 중 오류가 발생했습니다.\n` +
                        `대상 서버: ${guildId}\n\n관리자에게 문의해주세요.`
                    )
                    .setColor(0xff0000),
            ],
            components: [],
        });
        return;
    }

    await interaction.update({
        embeds: [
            new EmbedBuilder()
                .setTitle("❌ 단방향 동기화 거절 완료")
                .setDescription(
                    `서버 단방향 동기화가 성공적으로 거절되었습니다.\n대상 서버: ${guildId}`
                )
                .setColor(0xff0000),
        ],
        components: [],
    });
}
