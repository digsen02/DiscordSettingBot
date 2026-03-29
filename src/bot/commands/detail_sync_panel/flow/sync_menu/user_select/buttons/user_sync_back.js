import userSelect from "../flow/sync_menu/user_select.js";

export default async function (interaction, sessionKey) {
    await userSelect(interaction, sessionKey);
}
