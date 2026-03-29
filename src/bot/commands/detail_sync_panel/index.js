import {
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionFlagsBits,
} from "discord.js";
import * as syncConfigService from "../../../services/syncConfigService.js";
import { setSession } from "../../../utils/sessionStore.js";

export const data = new SlashCommandBuilder()
    .setName("detail_sync_panel")
    .setDescription("세부 동기화를 컨트롤 할 수 있는 패널을 킵니다.");

export async function execute(interaction) {
    const ok = interaction.member.permissions.has([
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.ManageGuild,
    ]);
    if (!ok) {
        await interaction.reply({ content: "관리자 권한이 필요합니다!", ephemeral: true });
        return;
    }

    const syncConfigs = await syncConfigService.getSyncedGuilds(interaction.guildId);
    const key = setSession({ guildId: interaction.guildId });
    const currentGuildId = interaction.guildId;
    const syncedGuildIds = [
        ...new Set(
            syncConfigs.flatMap((s) =>
                [s.sourceGuildId, s.targetGuildId].filter(Boolean)
            )
        ),
    ].filter((id) => id !== currentGuildId);

    const syncedGuildsOptions = syncedGuildIds.slice(0, 25).map((guildId) => {
        const guild = interaction.client.guilds.cache.get(guildId);
        return {
            label: (guild?.name ?? guildId).slice(0, 100),
            value: `select_guild:${key}`,
        };
    });

    const syncedGuildRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("choise_synced_guild")
            .setPlaceholder("상세 설정할 서버를 선택하세요.")
            .addOptions(
                syncedGuildsOptions.length > 0
                    ? syncedGuildsOptions
                    : [{ label: "동기화된 서버 없음", value: "none" }]
            )
    );

    const detailSyncRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("sync_select")
            .setPlaceholder("항목을 선택하세요")
            .addOptions(
                { label: "유저", value: `sync_user:${key}`, description: "유저 동기화 관리" },
                { label: "역할", value: `sync_role:${key}`, description: "역할 동기화 관리" },
                { label: "채널", value: `sync_channel:${key}`, description: "채널 동기화 관리" },
                { label: "카테고리", value: `sync_category:${key}`, description: "카테고리 동기화 관리" },
                { label: "길드 (서버)", value: `sync_guild:${key}`, description: "길드 (서버) 동기화 관리" }
            )
    );

    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("🔧 세부 동기화 패널")
                .setDescription("세부 동기화 패널 입니다. 아래 셀렉션에서 골라주세요."),
        ],
        components: [syncedGuildRow, detailSyncRow],
    });
}
