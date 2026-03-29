import sync_accept from "../../commands/one_way_sync_guild/buttons/accept.js";
import sync_reject from "../../commands/one_way_sync_guild/buttons/reject.js";
import user_sync_toggle_nickname from "../../commands/detail_sync_panel/buttons/user_sync_toggle_nickname.js";
import user_sync_toggle_roles from "../../commands/detail_sync_panel/buttons/user_sync_toggle_roles.js";
import user_sync_save from "../../commands/detail_sync_panel/buttons/user_sync_save.js";
import user_sync_reset from "../../commands/detail_sync_panel/buttons/user_sync_reset.js";
import user_sync_back from "../../commands/detail_sync_panel/buttons/user_sync_back.js";

const map = {
    sync_accept,
    sync_reject,
    user_sync_toggle_nickname,
    user_sync_toggle_roles,
    user_sync_save,
    user_sync_reset,
    user_sync_back,
};

export default async function handleButton(interaction) {
    const [action, sessionKey] = interaction.customId.split(":");
    console.log(`버튼 상호작용 감지: action=${action}, sessionKey=${sessionKey}`);

    const handler = map[action];
    if (!handler) return;
    await handler(interaction, sessionKey);
}
