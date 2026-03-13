import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
} from "discord.js";
import * as syncConfigService from "../../services/syncConfigService.js";

export const data = new SlashCommandBuilder()
    .setName("one_way_desync_guild")
    .setDescription("본 서버와 대상 서버의 단방향 동기화를 해제합니다.")
    .addStringOption((option) =>
        option
            .setName("guild_id")
            .setDescription("단방향 동기화 해제할 대상 서버의 ID를 입력하세요.")
            .setRequired(true)
    );

export async function execute(interaction) {
    const guildId = interaction.options.getString("guild_id");

    const ok = interaction.member.permissions.any([
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.ManageGuild,
    ]);
    if (!ok) { await interaction.reply("관리자 권한이 필요합니다!"); return; }
    if (interaction.guildId === guildId) { await interaction.reply("자기 자신과는 동기화 해제할 수 없습니다!"); return; }

    let guild;
    try {
        guild = await interaction.client.guilds.fetch(guildId);
    } catch (error) {
        console.error("❌ 단방향 동기화 해제 대상 서버 조회 중 오류 발생:", error);
        await interaction.reply(`봇이 해당 서버에 없습니다!`);
        return;
    }

    const desyncInfo = await syncConfigService.getDesyncInfo(interaction.guildId, guildId);
    if (!desyncInfo) {
        await interaction.reply("해당 서버와 단방향 동기화되어 있지 않습니다!");
        return;
    }

    const { sourceGuildId, targetGuildId, sourceLogChannelId, targetLogChannelId } = desyncInfo;

    let channel;
    try {
        channel =
            (sourceLogChannelId && await interaction.client.channels.fetch(sourceLogChannelId).catch(() => null)) ||
            (targetLogChannelId && await interaction.client.channels.fetch(targetLogChannelId).catch(() => null));
    } catch (_) { /* ignore */ }

    if (!channel) {
        console.error("❌ 단방향 동기화 해제 대상 서버의 로그 채널 조회 중 오류 발생:");
        await interaction.reply("대상 서버의 로그 채널을 찾을 수 없습니다! 대상 서버 관리자에게 /init_guild 명령어로 다시 초기화해달라고 요청해주세요.");
        return;
    }

    try {
        await syncConfigService.removeSyncBetweenGuilds(interaction.guildId, guildId);
        console.log(`✅ 단방향 동기화 해제 완료: ${guildId} -> ${interaction.guildId}`);

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🔄 서버 단방향 동기화 해제")
                    .setDescription(
                        `서버 단방향 동기화가 해제되었습니다.\n` +
                        `본 서버: ${interaction.guild.name} (${interaction.guildId})\n` +
                        `대상 서버: ${guild.name} (${guildId})\n\n` +
                        `단방향 동기화가 해제되었습니다.`
                    )
                    .setColor(0xffa500),
            ],
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("✅ 단방향 동기화 해제 완료")
                    .setDescription(
                        `서버 단방향 동기화가 성공적으로 해제되었습니다.\n` +
                        `대상 서버: ${guild.name} (${guildId})`
                    )
                    .setColor(0x00ae86),
            ],
        });
    } catch (error) {
        console.error("❌ 단방향 동기화 해제 중 오류 발생:", error);
        await interaction.reply("❌ 단방향 동기화 해제 중 오류가 발생했습니다. 관리자에게 문의해주세요.");
    }
}
