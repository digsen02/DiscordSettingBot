const map = {};

export default async function handleModal(interaction) {
    const [action] = interaction.customId;

    const handler = map[action];
    if (!handler) return;
    await handler(interaction);
}
