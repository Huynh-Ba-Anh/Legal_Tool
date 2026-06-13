const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protectedRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        const token =
            authHeader &&
                authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : null;

        if (!token) {
            return res.status(401).json({
                message: "Chưa đăng nhập",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "Người dùng không tồn tại",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(403).json({
            message: "Token không hợp lệ hoặc đã hết hạn",
        });
    }
};