import { EmbedBuilder } from "discord.js";

export default async function (interaction, guild_id, log_channel_id) {
    const channel = await interaction.client.channels.fetch(log_channel_id);
    try {
        await channel.send({
            embeds: [
                new EmbedBuilder()
                .setTitle("✅ 단방향 동기화 수락")
                .setDescription(`서버 단방향 동기화가 수락되었습니다.\n
                    본 서버: ${interaction.guild.name} (${interaction.guildId})\n
                    대상 서버: ${guild_id}\n\n
                    단방향 동기화가 수락되었습니다.`)
                .setColor(0x00AE86)
            ]
        });
    }catch (error) {
        console.error("❌ 단방향 동기화 수락 알림 전송 중 오류 발생:", error);
        await interaction.update({
            embeds: [
                new EmbedBuilder()
                .setTitle("❌ 단방향 동기화 수락 오류")
                .setDescription(`단방향 동기화 수락 알림 전송 중 오류가 발생했습니다.\n
                    대상 서버: ${guild_id}\n\n
                    관리자에게 문의해주세요.`)
                .setColor(0xFF0000)
            ],
            components: []
        });
    }
    try{
        const GuildSetting = (await import("../../../../DB/model/guild_setting_model.js")).default;
        let guildSetting = await GuildSetting.findOne({ guild_id: guild_id });
        let sourceGuildSetting = await GuildSetting.findOne({ guild_id: interaction.guildId });

        guildSetting.sync_source_guild_id = interaction.guildId;
        sourceGuildSetting.sync_target_guild_id = guild_id;

        await guildSetting.save();
        await sourceGuildSetting.save();

        console.log(`✅ 단방향 동기화 설정 저장 완료: ${guild_id} -> ${interaction.guildId}`);
    }catch(error){
        console.error("❌ 단방향 동기화 설정 저장 중 오류 발생:", error);
        await interaction.update({
            embeds: [
                new EmbedBuilder()
                .setTitle("❌ 단방향 동기화 설정 저장 오류")
                .setDescription(`단방향 동기화 설정 저장 중 오류가 발생했습니다.\n
                    대상 서버: ${guild_id}\n\n
                    관리자에게 문의해주세요.`)
                .setColor(0xFF0000)
            ],
            components: []
        });
    }

    await interaction.update({
        embeds: [
            new EmbedBuilder()
            .setTitle("✅ 단방향 동기화 수락 완료")
            .setDescription(`서버 단방향 동기화가 성공적으로 수락되었습니다.\n
                대상 서버: ${guild_id}\n\n
                단방향 동기화가 성공적으로 완료되었습니다.`)
            .setColor(0x00AE86)
        ],
        components: []
    });
}