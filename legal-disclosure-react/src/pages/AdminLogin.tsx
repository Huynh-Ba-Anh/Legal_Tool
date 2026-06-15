/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ShieldAlert, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../services/auth";

export default function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const data = await adminService.login(username, password);

            console.log("LOGIN RESPONSE:", data);

            navigate("/dashboard");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Đăng nhập thất bại"
            );
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

            <div className="w-full max-w-lg">

                <div className="text-center mb-6">
                    <img
                        src="/image.png"
                        alt="HHV"
                        className="h-20 mx-auto mb-4"
                    />

                    <h1 className="text-3xl font-bold text-[#2e2c7d]">
                        HỆ THỐNG QUẢN TRỊ
                    </h1>

                    <h2 className="text-lg font-semibold text-slate-700 mt-1">
                        CÔNG BỐ THÔNG TIN
                    </h2>

                    <p className="text-sm text-slate-500 mt-3">
                        Ban Pháp chế - HHV
                    </p>
                </div>

                <div className="bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden">

                    <div className="bg-[#2e2c7d] text-white px-6 py-4 flex items-center gap-3">
                        <LockKeyhole size={22} />
                        <span className="font-semibold">
                            Đăng nhập quản trị
                        </span>
                    </div>

                    <div className="p-6">

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Tài khoản
                                </label>

                                <input
                                    type="text"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2e2c7d]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mật khẩu
                                </label>

                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2e2c7d]"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#2e2c7d] hover:bg-[#232167] text-white font-semibold py-3 rounded-lg transition"
                            >
                                {isLoading
                                    ? "Đang xác thực..."
                                    : "ĐĂNG NHẬP HỆ THỐNG"}
                            </button>
                        </form>

                        <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3">
                            <ShieldAlert
                                size={18}
                                className="text-amber-600 shrink-0 mt-0.5"
                            />

                            <div className="text-sm text-amber-800">
                                <div className="font-semibold mb-1">
                                    Thông báo bảo mật
                                </div>

                                <p>
                                    Chỉ dành cho quản trị viên được cấp quyền.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}