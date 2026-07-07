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
            enum: ["NNB", "NLQ"],
        },

        files: [
            {
                data: {
                    type: Buffer,
                    required: true,
                },
                contentType: {
                    type: String,
                    required: true,
                },
                originalName: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    {
        timestamps: true,
    });

module.exports = mongoose.model("File", fileSchema);