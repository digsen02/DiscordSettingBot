import { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("detail_sync_panel")
    .setDescription("세부 동기화를 컨트롤 할 수 있는 패널을 킵니다.")

export async function execute(interaction){
    const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
        .setCustomId("sync_select")
        .setPlaceholder("항목을 선택하세요")
        .addOptions(
            { label: "유저", value: "sync_user", description: "유저 동기화 관리" },
            { label: "역할", value: "sync_role", description: "역할 동기화 관리" },
            { label: "채널", value: "sync_channel", description: "채널 동기화 관리" },
            { label: "카테고리", value: "sync_category", description: "카테고리 동기화 관리" },
            { label: "길드 (서버)", value: "sync_guild", description: "길드 (서버) 동기화 관리" }
        )
    );

    interaction.reply({
        embeds: [
            new EmbedBuilder()
            .setTitle("🔧 세부 동기화 패널")
            .setDescription("세부 동기화 패널 입니다. 아래 셀렉션에서 골라.")
        ],
        components: [row]
    });
}

