import handleButton from "../interactions/handle/handle_button.js";
import handleModal from "../interactions/handle/handle_modal.js";
import handleSelectMenu from "../interactions/handle/handle_selectmenu.js";

export default {
  name: "interactionCreate",
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      return handleButton(interaction);
    }

    if (interaction.isModalSubmit()) {
      return handleModal(interaction);
    }
    console.log("isStringSelectMenu:", interaction.isStringSelectMenu());
    if (interaction.isStringSelectMenu()) {
      return handleSelectMenu(interaction);
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ 명령 실행 중 오류 발생",
        ephemeral: true,
      });
    }
  },
};
