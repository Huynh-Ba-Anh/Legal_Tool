var express = require('express');
const User = require('../models/User');
const jwt = require("jsonwebtoken");

var router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: "Sai tài khoản hoặc mật khẩu",
            });
        }

        const isMatch = await user.comparePassword(password);

        console.log("PASSWORD MATCH:", isMatch);


        if (!isMatch) {
            return res.status(401).json({
                message: "Sai tài khoản hoặc mật khẩu",
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.json({
            token,
            role: user.role,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/create-manager", async (req, res) => {
    try {
        const { username, password } = req.body;

        const exist = await User.findOne({ username });

        console.log(exist);

        if (exist) {
            return res.status(400).json({
                message: "Username đã tồn tại",
            });
        }

        const manager = await User.create({
            username,
            password,
            role: "manager",
        });

        res.status(201).json({
            message: "Tạo manager thành công",
            user: {
                id: manager._id,
                username: manager.username,
                role: manager.role,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message,
        });
    }
});


module.exports = router;
