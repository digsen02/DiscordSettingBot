import { EmbedBuilder } from "discord.js";
import * as syncConfigService from "../../../services/syncConfigService.js";

export default async function (interaction, guild_id, log_channel_id) {
    const channel = await interaction.client.channels.fetch(log_channel_id);
    try {
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("✅ 단방향 동기화 수락")
                    .setDescription(
                        `서버 단방향 동기화가 수락되었습니다.\n` +
                        `본 서버: ${interaction.guild.name} (${interaction.guildId})\n` +
                        `대상 서버: ${guild_id}\n\n` +
                        `단방향 동기화가 수락되었습니다.`
                    )
                    .setColor(0x00ae86),
            ],
        });
    } catch (error) {
        console.error("❌ 단방향 동기화 수락 알림 전송 중 오류 발생:", error);
        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle("❌ 단방향 동기화 수락 오류")
                    .setDescription(
                        `단방향 동기화 수락 알림 전송 중 오류가 발생했습니다.\n` +
                        `대상 서버: ${guild_id}\n\n관리자에게 문의해주세요.`
                    )
                    .setColor(0xff0000),
            ],
            components: [],
        });
        return;
    }

    try {
        // guild_id       = 동기화를 요청한 길드 (ownerGuildId = targetGuildId, 데이터를 받는 쪽)
        // interaction.guildId = 동기화를 수락한 길드 (sourceGuildId, 데이터를 제공하는 쪽)
        await syncConfigService.createSync({
            ownerGuildId:  guild_id,
            sourceGuildId: interaction.guildId,
            targetGuildId: guild_id,
            createdBy:     interaction.user.id,
        });
        console.log(`✅ 단방향 동기화 설정 저장 완료: ${guild_id} -> ${interaction.guildId}`);
    } catch (error) {
        console.error("❌ 단방향 동기화 설정 저장 중 오류 발생:", error);
        await interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle("❌ 단방향 동기화 설정 저장 오류")
                    .setDescription(
                        `단방향 동기화 설정 저장 중 오류가 발생했습니다.\n` +
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
                .setTitle("✅ 단방향 동기화 수락 완료")
                .setDescription(
                    `서버 단방향 동기화가 성공적으로 수락되었습니다.\n` +
                    `대상 서버: ${guild_id}\n\n단방향 동기화가 성공적으로 완료되었습니다.`
                )
                .setColor(0x00ae86),
        ],
        components: [],
    });
}
