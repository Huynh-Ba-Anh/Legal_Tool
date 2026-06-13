const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        typePerson: {
            type: String,
            required: true,
            enum: ["NNB", "NLQ"]
        },

        file: {
            data: Buffer,
            contentType: String,
            originalName: String,
        },

    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("File", fileSchema);