import select_guild from "../../commands/detail_sync_panel/flow/select_guild.js";
import sync_category from "../../commands/detail_sync_panel/flow/sync_menu/category_select.js";
import sync_user from "../../commands/detail_sync_panel/flow/sync_menu/user_select.js";
import sync_user_detail from "../../commands/detail_sync_panel/flow/sync_menu/user_detail.js";
import sync_guild from "../../commands/detail_sync_panel/flow/sync_menu/guild_view.js";
import sync_role from "../../commands/detail_sync_panel/flow/sync_menu/role_select.js";
import sync_channel from "../../commands/detail_sync_panel/flow/sync_menu/channel_select.js";

const map = { select_guild, sync_guild, sync_role, sync_channel, sync_category, sync_user, sync_user_detail };

export default async function handleSelectMenu(interaction) {
    const [action, sessionKey] = interaction.values[0].split(":");
    console.log(`셀렉트 메뉴 상호작용 감지: action=${action}, sessionKey=${sessionKey}`);

    const handler = map[action];
    if (!handler) return;
    await handler(interaction, sessionKey);
}
