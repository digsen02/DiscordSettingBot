import { getSession } from "../../../../utils/sessionStore.js";
import { buildUserDetailPayload } from "../flow/sync_menu/user_detail.js";

export default async function (interaction, sessionKeyWithUserId) {
    const [sessionKey, userId] = (sessionKeyWithUserId ?? "").split("|");
    const session = getSession(sessionKey);
    if (!session) {
        await interaction.update({ content: "❌ 세션이 만료되었습니다. 명령어를 다시 실행해주세요.", embeds: [], components: [] });
        return;
    }

    if (!session.userDetailSettings) session.userDetailSettings = {};
    if (!session.userDetailSettings[userId]) {
        session.userDetailSettings[userId] = { nickname: false, roles: false, savedAt: null };
    }
    session.userDetailSettings[userId].nickname = !session.userDetailSettings[userId].nickname;

    const { guildId } = session;
    const targetGuild = interaction.client.guilds.cache.get(guildId);
    const settings = session.userDetailSettings[userId];

    await interaction.update(
        buildUserDetailPayload({ interaction, sessionKey, guildId, targetGuild, userId, settings })
    );
}