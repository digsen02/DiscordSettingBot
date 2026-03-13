import mongoose from "mongoose";

const GuildSettingSchema = new mongoose.Schema(
    {
        guild_id: {
            type: String,
            required: true,
        },
        log_channel_id: {
            type: String,
        },
        sync_target_guild_id: {
            type: String,
        },
        sync_source_guild_id: {
            type: String,
        },

    },
    {
        timestamps: true,
    }
);

const GuildSetting = mongoose.model("GuildSetting", GuildSettingSchema);

export default GuildSetting;
