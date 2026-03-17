import { getSession } from "../../../../utils/sessionStore.js";

export default async function (interaction, sessionKey) {
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", components: [] });
        return;
    }
    const { guildId } = session;
    await interaction.update({ content: "역할 동기화 기능은 준비 중입니다.", components: [] });
}
