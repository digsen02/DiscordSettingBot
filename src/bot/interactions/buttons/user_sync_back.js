import sync_user from "../selectmenus/sync_menu/sync_user.js";

export default async function (interaction, sessionKey) {
    await sync_user(interaction, sessionKey);
}

