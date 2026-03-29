import { EmbedBuilder, ChannelType } from "discord.js";
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";
import { getSession } from "../../../../../utils/sessionStore.js";

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", embeds: [], components: [] });
        return;
    }
    const { guildId } = session;

    const targetGuild = interaction.client.guilds.cache.get(guildId);
    const textChannels = interaction.guild.channels.cache.filter(
        (ch) => ch.type === ChannelType.GuildText
    );
    const voiceChannels = interaction.guild.channels.cache.filter(
        (ch) => ch.type === ChannelType.GuildVoice
    );
    const allChannels = [...textChannels.values(), ...voiceChannels.values()];

    const channelRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("choise_channel")
            .setPlaceholder("작업을 시작할 채널을 선택하세요")
            .addOptions(
                ...allChannels.slice(0, 25).map((ch) => ({
                    label: ch.name,
                    value: ch.id,
                    description: ch.type === ChannelType.GuildText ? "💬 텍스트 채널" : "🔊 음성 채널",
                }))
            )
    );

    const embed = new EmbedBuilder()
        .setTitle(`📺 채널 동기화 — ${targetGuild?.name ?? guildId}`)
        .setDescription("동기화할 채널을 선택하세요.")
        .setThumbnail(targetGuild?.iconURL({ dynamic: true }) ?? null)
        .setColor(0x57F287)
        .addFields(
            { name: "💬 텍스트 채널", value: `**${textChannels.size}개**`, inline: true },
            { name: "🔊 음성 채널", value: `**${voiceChannels.size}개**`, inline: true },
        )
        .setFooter({ text: `최대 25개 표시 · 서버 ID: ${guildId}` })
        .setTimestamp();

    await interaction.update({
        embeds: [embed],
        components: [channelRow],
    });
}
