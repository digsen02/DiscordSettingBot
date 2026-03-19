import select_guild from "../selectmenus/select_sync_guild/select_guild.js";
import sync_category from "../selectmenus/sync_menu/sync_category.js";
import sync_user from "../selectmenus/sync_menu/sync_user.js";
import sync_user_detail from "../selectmenus/sync_menu/sync_user_detail.js";
import sync_guild from "../selectmenus/sync_menu/sync_guild.js";
import sync_role from "../selectmenus/sync_menu/sync_role.js";
import sync_channel from "../selectmenus/sync_menu/sync_channel.js";

const map = { select_guild, sync_guild, sync_role, sync_channel, sync_category, sync_user, sync_user_detail };

export default async function handleSelectMenu(interaction) {
    const [action, sessionKey] = interaction.values[0].split(":");
    console.log(`셀렉트 메뉴 상호작용 감지: action=${action}, sessionKey=${sessionKey}`);

    const handler = map[action];
    if (!handler) return;
    await handler(interaction, sessionKey);
}