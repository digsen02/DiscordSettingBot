import mongoose from "mongoose";

const SyncConfigSchema = new mongoose.Schema(
    {
        ownerGuildId: { type: String, required: true },
        sourceGuildId: { type: String, required: true },
        targetGuildId: { type: String, required: true },
        syncType: {
            type: String,
            required: true,
            enum: ["user", "role", "channel", "category", "guild"],
        },
        direction: {
            type: String,
            enum: ["one_way", "two_way"],
            default: "one_way",
        },
        status: {
            type: String,
            enum: ["pending", "active", "paused", "rejected"],
            default: "pending",
        },
        enabled: { type: Boolean, default: false },
        options: { type: mongoose.Schema.Types.Mixed, default: {} },
        createdBy: { type: String },
    },
    { timestamps: true }
);

SyncConfigSchema.index({ ownerGuildId: 1 });
SyncConfigSchema.index({ ownerGuildId: 1, syncType: 1 });
SyncConfigSchema.index({ ownerGuildId: 1, enabled: 1 });
SyncConfigSchema.index(
    { sourceGuildId: 1, targetGuildId: 1, syncType: 1 },
    { unique: true }
);

const SyncConfig = mongoose.model("SyncConfig", SyncConfigSchema);

export default SyncConfig;
