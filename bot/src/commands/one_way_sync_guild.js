import { ButtonBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, EmbedBuilder  } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("one_way_sync_guild")
    .setDescription("본 서버와 대상 서버를 단방향 동기화 합니다.")
    .addStringOption(option =>
        option.setName("guild_id")
            .setDescription("단방향 동기화할 대상 서버의 ID를 입력하세요.")
            .setRequired(true)
    )
    // .addStringOption(option =>
    //     option.setName("direction")
    //         .setDescription("단방향 동기화 방향을 선택하세요. (source/target)")
    //         .setRequired(true)
    //         .addChoices(
    //             { name: 'source', value: 0 },
    //             { name: 'target', value: 1 }
    //         )
    // );

export async function execute(interaction) {
    const guildId = interaction.options.getString("guild_id");
    // const direction = interaction.options.getString("direction");

    const GuildSetting = (await import("../../../DB/model/guild_setting_model.js")).default;
    const ok = interaction.member.permissions.any([
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.ManageGuild,
    ]);
    let guild;
    if(!ok){ await interaction.reply("관리자 권한이 필요합니다!"); return; }
    if(interaction.guildId == guildId){ await interaction.reply("자기 자신과는 동기화할 수 없습니다!"); return; }
    try{
        guild = await interaction.client.guilds.fetch(guildId);
    } catch (error){
        await interaction.reply(`봇이 해당 서버에 없습니다!`);
        return;
    }
    if(await GuildSetting.findOne({ guild_id: guildId, sync_target_guild_id: interaction.guildId })){ 
        await interaction.reply("이미 단방향 동기화된 서버입니다!"); 
        return;
    }

    let guildSetting = await GuildSetting.findOne({ guild_id: interaction.guildId });
    let sourceGuildSetting = await GuildSetting.findOne({ guild_id: guildId });

    if(!guildSetting){ await interaction.reply("본 서버가 초기화되지 않았습니다! /init_guild 명령어로 초기화해주세요."); return; }
    if(!sourceGuildSetting){ await interaction.reply("대상 서버가 초기화되지 않았습니다! 대상 서버 관리자에게 /init_guild 명령어로 초기화해달라고 요청해주세요."); return; }

    const channel = await guild.channels.fetch(sourceGuildSetting.log_channel_id);
    if(!channel){ await interaction.reply("대상 서버의 로그 채널을 찾을 수 없습니다! 대상 서버 관리자에게 /init_guild 명령어로 다시 초기화해달라고 요청해주세요."); return; }

    await channel.send({
        embeds: [
            new EmbedBuilder()
            .setTitle("🔄 서버 단방향 동기화 요청")
            .setDescription(`서버 단방향 동기화 요청이 들어왔습니다!\n
                본 서버: ${interaction.guild.name} (${interaction.guildId})\n
                대상 서버: ${guild.name} (${guildId})\n\n
                단방향 동기화를 수락하려면 "수락"을, 거절하려면 "거절"을 눌러주세요.`)
            .setColor(0x00AE86)],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                .setCustomId(`sync_accept:${interaction.guildId}:${guildSetting.log_channel_id}`)
                .setLabel("수락")
                .setStyle(ButtonStyle.Success),
                
                new ButtonBuilder()
                .setCustomId(`sync_reject:${interaction.guildId}:${guildSetting.log_channel_id}`)
                .setLabel("거절")
                .setStyle(ButtonStyle.Danger)
            )
        ]
    });
    await interaction.reply(`대상 서버(${guild.name})에 단방향 동기화 요청을 보냈습니다. 대상 서버 관리자가 수락할 때까지 기다려주세요.`);
}