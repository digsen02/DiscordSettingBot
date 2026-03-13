import sync_accept from "../buttons/one_way_sync_yes.js";
import sync_reject from "../buttons/one_way_sync_no.js";

const map = { sync_accept, sync_reject };

export default async function handleButton(interaction) {
    const [action, guild_id, log_channel_id] = interaction.customId.split(":");
    console.log(`버튼 상호작용 감지: action=${action}, guild_id=${guild_id}, log_channel_id=${log_channel_id}`);

    const handler = map[action];
    if (!handler) return;
    if (guild_id && log_channel_id) {
        await handler(interaction, guild_id, log_channel_id);
        return;
    }
    await handler(interaction);
}
