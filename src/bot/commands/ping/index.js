import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("봇 상태 확인");

export async function execute(interaction) {
    console.log("Ping command executed");
    await interaction.reply("pong!");
}
