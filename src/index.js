import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "./client.js";
import { REST, Routes } from "discord.js";
import dbConnect from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const client = createClient();

/* 커맨드 로드 */
const commandsPath = path.join(__dirname, "bot", "commands");
for (const file of fs.readdirSync(commandsPath)) {
    if (!file.endsWith(".js")) continue;
    const command = await import(pathToFileURL(path.join(commandsPath, file)).href);
    try {
        client.commands.set(command.data.name, command);
    } catch (error) {
        console.log(`data is none`, error);
    }
}

/* 이벤트 로드 */
const eventsPath = path.join(__dirname, "bot", "events");
for (const file of fs.readdirSync(eventsPath)) {
    if (!file.endsWith(".js")) continue;
    const event = (await import(pathToFileURL(path.join(eventsPath, file)).href)).default;
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

/* 슬래시 커맨드 등록 */
const commands = [];
for (const file of fs.readdirSync(commandsPath)) {
    if (!file.endsWith(".js")) continue;
    const command = await import(pathToFileURL(path.join(commandsPath, file)).href);
    try {
        commands.push(command.data.toJSON());
    } catch (error) {
        console.log(`data is none`, error);
    }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

const guildIds = (process.env.GUILD_IDS || process.env.GUILD_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

for (const guildId of guildIds) {
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: commands }
    );
    console.log(`✅ Slash commands deployed`);
    await new Promise((res) => setTimeout(res, 300));
}

try {
    await dbConnect();
} catch (error) {
    console.log("❌ DB 연결 실패", error);
}

await client.login(process.env.DISCORD_TOKEN);

export { client };
