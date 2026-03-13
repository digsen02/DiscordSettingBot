import mongoose from "mongoose";

const GuildSchema = new mongoose.Schema(
    {
        guildId:       { type: String, required: true },
        logChannelId:  { type: String },
        initializedAt: { type: Date },
    },
    { timestamps: true }
);

GuildSchema.index({ guildId: 1 }, { unique: true });

const Guild = mongoose.model("Guild", GuildSchema);

export default Guild;
