export default async function (interaction, guildId) {
    const guild = interaction.client.guilds.cache.get(guildId);
    if (!guild) {
        await interaction.update({ content: "서버를 찾을 수 없습니다.", components: [] });
        return;
    }
    await interaction.update({ content: `${guild.name}을 선택했습니다.` });
}
