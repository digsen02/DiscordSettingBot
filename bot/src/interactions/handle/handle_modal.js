const map = {
};

export default async function handleButton(interaction) {
  const [action] = interaction.customId

  const handler = map[action];
  if (!handler) return;
  await handler(interaction);
}