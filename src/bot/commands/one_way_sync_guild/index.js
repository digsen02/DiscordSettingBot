import {
    ButtonBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    EmbedBuilder,
} from "discord.js";
import * as guildService from "../../../services/guildService.js";
import * as syncConfigService from "../../../services/syncConfigService.js";
import { setSession } from "../../../utils/sessionStore.js";

export const data = new SlashCommandBuilder()
    .setName("one_way_sync_guild")
    .setDescription("본 서버와 대상 서버를 단방향 동기화 합니다.")
    .addStringOption((option) =>
        option
            .setName("guild_id")
            .setDescription("단방향 동기화할 대상 서버의 ID를 입력하세요.")
            .setRequired(true)
    );

export async function execute(interaction) {
    const guildId = interaction.options.getString("guild_id");

    const ok = interaction.member.permissions.any([
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.ManageGuild,
    ]);
    if (!ok) { await interaction.reply("관리자 권한이 필요합니다!"); return; }
    if (interaction.guildId === guildId) { await interaction.reply("자기 자신과는 동기화할 수 없습니다!"); return; }

    let guild;
    try {
        guild = await interaction.client.guilds.fetch(guildId);
    } catch {
        await interaction.reply(`봇이 해당 서버에 없습니다!`);
        return;
    }

    // guildId(대상)가 이미 interaction.guildId(요청자)를 target으로 가지고 있는지 확인
    if (await syncConfigService.isSyncAlreadyExists(guildId, interaction.guildId)) {
        await interaction.reply("이미 단방향 동기화된 서버입니다!");
        return;
    }

    const guildSetting = await guildService.getGuildSetting(interaction.guildId);
    const sourceGuildSetting = await guildService.getGuildSetting(guildId);

    if (!guildSetting) { await interaction.reply("본 서버가 초기화되지 않았습니다! /init_guild 명령어로 초기화해주세요."); return; }
    if (!sourceGuildSetting) { await interaction.reply("대상 서버가 초기화되지 않았습니다! 대상 서버 관리자에게 /init_guild 명령어로 초기화해달라고 요청해주세요."); return; }

    const channel = await guild.channels.fetch(sourceGuildSetting.logChannelId);
    if (!channel) { await interaction.reply("대상 서버의 로그 채널을 찾을 수 없습니다! 대상 서버 관리자에게 /init_guild 명령어로 다시 초기화해달라고 요청해주세요."); return; }

    const sessionKey = setSession({ guildId: interaction.guildId, logChannelId: guildSetting.logChannelId });

    await channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle("🔄 서버 단방향 동기화 요청")
                .setDescription(
                    `서버 단방향 동기화 요청이 들어왔습니다!\n` +
                    `원본 서버: ${interaction.guild.name} (${interaction.guildId})\n` +
                    `대상 서버: ${guild.name} (${guildId})\n\n` +
                    `단방향 동기화를 수락하려면 "수락"을, 거절하려면 "거절"을 눌러주세요.`
                )
                .setColor(0x00ae86),
        ],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`sync_accept:${sessionKey}`)
                    .setLabel("수락")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`sync_reject:${sessionKey}`)
                    .setLabel("거절")
                    .setStyle(ButtonStyle.Danger)
            ),
        ],
    });
    await interaction.reply(`대상 서버(${guild.name})에 단방향 동기화 요청을 보냈습니다. 대상 서버 관리자가 수락할 때까지 기다려주세요.`);
}
