const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            default: "",
            trim: true,
        },

        cccd: {
            type: String,
            default: "",
            trim: true,
        },

        personName: {
            type: String,
            default: "",
            trim: true,
        },

        typePerson: {
            type: String,
            default: "",
        },

        currentObligation: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "processing", "done"],
            default: "pending",
        },
    },
    {
        timestamps: true,
        collection: "supports",
    }
);

module.exports = mongoose.model("Support", supportSchema);