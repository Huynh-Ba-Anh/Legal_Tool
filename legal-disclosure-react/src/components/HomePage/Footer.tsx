import { Building2, ShieldCheck } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#2e2c7d] text-white mt-auto">

            <div className="max-w-7xl mx-auto px-6 py-6">

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">

                    {/* Left */}
                    <div className="flex items-center gap-3">
                        <Building2 size={20} />
                        <div>
                            <p className="font-semibold">
                                CTCP Đầu tư Hạ tầng Giao thông Đèo Cả (HHV)
                            </p>
                            <p className="text-sm text-white/70">
                                Cổng tra cứu nghĩa vụ công bố thông tin
                            </p>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2 text-sm text-white/80">
                        <ShieldCheck size={16} />
                        <span>
                            Chỉ dành cho nhân viên và đối tượng được ủy quyền
                        </span>
                    </div>

                </div>

                {/* Divider */}
                <div className="border-t border-white/20 my-4" />

                {/* Copyright */}
                <div className="text-center text-xs text-white/60">
                    © {new Date().getFullYear()} HHV - Ban Pháp chế.
                    Mọi quyền được bảo lưu.
                </div>

            </div>

        </footer>
    );
}