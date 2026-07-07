var express = require('express');
const { protectedRoute } = require('../auth/protectedRoute');
const File = require('../models/File');
const Person = require('../models/Person');
const multer = require('multer');
const upload = require('../middlewares/upload');
var router = express.Router();



router.get("/", async (req, res) => {
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
    upload.array("file", 3),
    async (req, res) => {
        try {
            const { id } = req.params;

            const updateData = {
                title: req.body.title,
                content: req.body.content,
                typePerson: req.body.typePerson,
            };

            if (req.files && req.files.length > 0) {
                updateData.files = req.files.map((file) => ({
                    data: file.buffer,
                    contentType: file.mimetype,
                    originalName: file.originalname,
                }));
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
    upload.array("file", 3),
    async (req, res) => {
        try {

            const fileData = req.files && req.files.length > 0
                ? req.files.map((file) => ({
                    data: file.buffer,
                    contentType: file.mimetype,
                    originalName: file.originalname,
                }))
                : [];

            const newFile = await File.create({
                title: req.body.title,
                content: req.body.content,
                typePerson: req.body.typePerson,
                files: fileData,
            });

            res.status(201).json(newFile);
        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    }
);

router.get("/:id/files", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file || !file.files || file.files.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy file",
            });
        }

        const filesList = file.files.map((f, index) => ({
            index,
            originalName: f.originalName,
            contentType: f.contentType,
        }));

        res.status(200).json(filesList);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

router.get("/:id/preview", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        const fileIndex = parseInt(req.query.fileIndex) || 0;

        if (!file || !file.files || file.files.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy file",
            });
        }

        if (fileIndex >= file.files.length) {
            return res.status(404).json({
                message: "File không tồn tại",
            });
        }

        const selectedFile = file.files[fileIndex];

        res.setHeader(
            "Content-Type",
            selectedFile.contentType
        );

        res.send(selectedFile.data);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
});

router.delete("/:id/file/:fileIndex", protectedRoute, async (req, res) => {
    try {
        const { id, fileIndex } = req.params;
        const index = parseInt(fileIndex);

        const file = await File.findById(id);

        if (!file) {
            return res.status(404).json({
                message: "Không tìm thấy biểu mẫu",
            });
        }

        if (!file.files || file.files.length === 0) {
            return res.status(400).json({
                message: "Biểu mẫu không có file nào",
            });
        }

        if (index < 0 || index >= file.files.length) {
            return res.status(400).json({
                message: "Chỉ số file không hợp lệ",
            });
        }

        // Xóa file theo index
        file.files.splice(index, 1);
        await file.save();

        res.status(200).json({
            message: "Xóa file thành công",
            files: file.files,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
});

router.patch("/:id/files", protectedRoute, upload.array("file", 2), async (req, res) => {
    try {
        const { id } = req.params;
        const { fileIndices } = req.body; // JSON string: "[0]" hoặc "[0,1]"

        const file = await File.findById(id);

        if (!file) {
            return res.status(404).json({
                message: "Không tìm thấy biểu mẫu",
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "Vui lòng cung cấp file để cập nhật",
            });
        }

        // Parse indices từ JSON string
        let indices = [0]; // Mặc định index 0 nếu không có
        try {
            if (fileIndices) {
                indices = JSON.parse(fileIndices);
            }
        } catch (e) {
            indices = [0];
        }

        // Validate indices
        if (!Array.isArray(indices)) {
            return res.status(400).json({
                message: "fileIndices phải là array",
            });
        }

        if (indices.length !== req.files.length) {
            return res.status(400).json({
                message: "Số lượng file và indices không khớp",
            });
        }

        // Kiểm tra indices hợp lệ
        for (let idx of indices) {
            if (idx < 0 || idx >= file.files.length) {
                return res.status(400).json({
                    message: `Chỉ số file ${idx} không hợp lệ`,
                });
            }
        }

        // Cập nhật từng file theo index
        req.files.forEach((newFile, i) => {
            const fileIndex = indices[i];
            file.files[fileIndex] = {
                data: newFile.buffer,
                contentType: newFile.mimetype,
                originalName: newFile.originalname,
            };
        });

        await file.save();

        res.status(200).json({
            message: "Cập nhật file thành công",
            files: file.files,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({
                message: "Không tìm thấy file",
            });
        }

        await File.deleteOne({ _id: req.params.id });

        return res.status(200).json({
            message: "Xóa file thành công",
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router;
