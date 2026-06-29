const mongoose = require("mongoose");

const hhvStockSchema = new mongoose.Schema(
    {
        time: {
            type: Date,
            required: true,
            unique: true,
        },
        open: {
            type: Number,
            required: true,
        },
        high: {
            type: Number,
            required: true,
        },
        low: {
            type: Number,
            required: true,
        },
        close: {
            type: Number,
            required: true,
        },
        volume: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("HhvStock", hhvStockSchema);
