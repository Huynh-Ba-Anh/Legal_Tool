
const express = require("express");
const router = express.Router();

const Support = require("../models/Support");
const { protectedRoute } = require("../auth/protectedRoute");


router.get("/", protectedRoute, async (req, res) => {
    try {
        const supports = await Support.aggregate([
            {
                $addFields: {
                    statusOrder: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$status", "pending"] },
                                    then: 1,
                                },
                                {
                                    case: { $eq: ["$status", "processing"] },
                                    then: 2,
                                },
                                {
                                    case: { $eq: ["$status", "done"] },
                                    then: 3,
                                },
                            ],
                            default: 4,
                        },
                    },
                },
            },
            {
                $sort: {
                    statusOrder: 1,
                    createdAt: -1,
                },
            },
        ]);

        res.json(supports);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi lấy danh sách hỗ trợ",
        });
    }
});

router.get("/:id", protectedRoute, async (req, res) => {
    try {
        const support = await Support.findById(req.params.id);

        if (!support) {
            return res.status(404).json({
                message: "Không tìm thấy yêu cầu hỗ trợ",
            });
        }

        res.json(support);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi lấy dữ liệu",
        });
    }
});


router.post("/", async (req, res) => {
    try {
        const {
            phone,
            message,
            cccd,
            personName,
            typePerson,
            currentObligation,
        } = req.body;

        const support = await Support.create({
            phone,
            message,
            cccd,
            personName,
            typePerson,
            currentObligation,
        });

        res.status(201).json(support);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Tạo yêu cầu hỗ trợ thất bại",
        });
    }
});


router.patch("/:id/status", protectedRoute, async (req, res) => {
    try {
        const { status } = req.body;

        const support = await Support.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!support) {
            return res.status(404).json({
                message: "Không tìm thấy yêu cầu hỗ trợ",
            });
        }

        res.json(support);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Cập nhật trạng thái thất bại",
        });
    }
});

router.delete("/:id", protectedRoute, async (req, res) => {
    try {
        const support = await Support.findByIdAndDelete(
            req.params.id
        );

        if (!support) {
            return res.status(404).json({
                message: "Không tìm thấy yêu cầu hỗ trợ",
            });
        }

        res.json({
            message: "Xóa thành công",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Xóa thất bại",
        });
    }
});

module.exports = router;
