import { getSession } from "../../../../utils/sessionStore.js";

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", components: [] });
        return;
    }
    const { guildId } = session;

    const guild = interaction.client.guilds.cache.get(guildId);
    if (!guild) {
        await interaction.update({ content: "서버를 찾을 수 없습니다.", components: [] });
        return;
    }
    await interaction.update({ content: `${guild.name}을 선택했습니다.` });
}
