import { EmbedBuilder } from "discord.js";

export default async function (interaction, guild_id, log_channel_id) {
    const channel = await interaction.client.channels.fetch(log_channel_id);
    try {
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("❌ 단방향 동기화 거절")
                    .setDescription(
                        `서버 단방향 동기화가 거절되었습니다.\n` +
                        `본 서버: ${interaction.guild.name} (${interaction.guildId})\n` +
                        `대상 서버: ${guild_id}\n\n` +
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
                        `대상 서버: ${guild_id}\n\n관리자에게 문의해주세요.`
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
                    `서버 단방향 동기화가 성공적으로 거절되었습니다.\n대상 서버: ${guild_id}`
                )
                .setColor(0xff0000),
        ],
        components: [],
    });
}
