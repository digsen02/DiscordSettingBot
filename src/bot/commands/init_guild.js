import { SlashCommandBuilder, ChannelType } from "discord.js";
import * as guildService from "../../services/guildService.js";

export const data = new SlashCommandBuilder()
    .setName("init_guild")
    .setDescription("본 서버를 초기화합니다.")
    .addChannelOption((option) =>
        option
            .setName("log_channel")
            .setDescription("로그 채널을 선택하세요.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    );

export async function execute(interaction) {
    const logChannel = interaction.options.getChannel("log_channel");
    try {
        console.log({
            id: logChannel.id,
            type: logChannel.type,
            parentId: logChannel.parentId,
        });

        if (await guildService.isLogChannelAlreadySet(interaction.guildId, logChannel.id)) {
            await interaction.reply({
                content: `이미 해당 채널(${logChannel})이 로그 채널로 설정되어 있습니다.`,
                ephemeral: true,
            });
            console.log(`서버 초기화 오류: ${interaction.guildId}, 로그 채널: ${logChannel.id} (이미 설정됨)`);
            return;
        }

        await guildService.initGuild(interaction.guildId, logChannel.id);
    } catch (error) {
        console.error("❌ 서버 초기화 중 오류 발생:", error);
        await interaction.reply({
            content: "❌ 서버 초기화 중 오류가 발생했습니다.",
            ephemeral: true,
        });
        return;
    }

    console.log(`✅ 서버 초기화 완료: ${interaction.guildId}, 로그 채널: ${logChannel.id}`);
    await interaction.reply(`로그 채널이 ${logChannel}(으)로 설정되었습니다. 서버 초기화가 완료되었습니다.`);
}
