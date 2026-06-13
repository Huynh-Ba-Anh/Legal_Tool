var express = require('express');
const { protectedRoute } = require('../auth/protectedRoute');
const File = require('../models/File');
const Person = require('../models/Person');
const multer = require('multer');
const upload = require('../middlewares/upload');
var router = express.Router();



router.get("/", protectedRoute, async (req, res) => {
    try {
        const { typePerson } = req.query;
        const queryType = typePerson == "TC" ? "NLQ" : typePerson;

        const files = await File.find({ typePerson: queryType });
        if (!files || files.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy tài liệu phù hợp" });
        }

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

router.get("/get-all", protectedRoute, async (req, res) => {
    try {
        const files = await File.find()
            .sort({ updatedAt: -1 });

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});
router.patch(
    "/:id",
    protectedRoute,
    upload.single("file"),
    async (req, res) => {
        try {
            const { id } = req.params;

            const updateData = {
                title: req.body.title,
                content: req.body.content,
                typePerson: req.body.typePerson,
            };

            if (req.file) {
                updateData.file = {
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                    originalName: req.file.originalname,
                };
            }

            const updatedFile = await File.findByIdAndUpdate(
                id,
                updateData,
                {
                    new: true,
                }
            );

            if (!updatedFile) {
                return res.status(404).json({
                    message: "Không tìm thấy file",
                });
            }

            res.status(200).json(updatedFile);
        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    }
);
router.post(
    "/",
    protectedRoute,
    upload.single("file"),
    async (req, res) => {
        try {

            const fileData = req.file
                ? {
                    data: req.file.buffer,
                    contentType: req.file.mimetype,
                    originalName: req.file.originalname,
                }
                : null;

            const newFile = await File.create({
                title: req.body.title,
                content: req.body.content,
                typePerson: req.body.typePerson,
                file: fileData,
            });

            res.status(201).json(newFile);
        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    }
);

router.get("/:id/preview", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file || !file.file) {
            return res.status(404).json({
                message: "Không tìm thấy file",
            });
        }

        res.setHeader(
            "Content-Type",
            file.file.contentType
        );

        res.send(file.file.data);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router;
