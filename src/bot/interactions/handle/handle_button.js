import sync_accept from "../buttons/one_way_sync_yes.js";
import sync_reject from "../buttons/one_way_sync_no.js";

const map = { sync_accept, sync_reject };

export default async function handleButton(interaction) {
    const [action, sessionKey] = interaction.customId.split(":");
    console.log(`버튼 상호작용 감지: action=${action}, sessionKey=${sessionKey}`);

    const handler = map[action];
    if (!handler) return;
    await handler(interaction, sessionKey);
}
