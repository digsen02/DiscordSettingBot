import sync_category from "../selectmenus/sync_menu/sync_category.js";

const map = {sync_category};

export default async function handleSelectMenu(interaction) {

  const action = interaction.values[0];
  console.log(`셀렉트 메뉴 상호작용 감지: action=${action}`);

  const handler = map[action];
    if (!handler) return;
    console.log(handler);
    await handler(interaction);
}