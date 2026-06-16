export default function Footer() {
    return (
        <footer className="bg-[#2e2c7d] text-white mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Top */}
                <div className="flex flex-col md:flex-row justify-between gap-8">

                    {/* LEFT */}
                    <div className="flex gap-4 items-start">

                        <div className="w-32 h-12 rounded-md bg-white flex items-center justify-center overflow-hidden">
                            <img
                                src="/image.png"
                                alt="HHV Logo"
                                className="h-8 w-auto object-contain"
                            />
                        </div>

                        <div>
                            <h2 className="font-semibold text-base md:text-lg leading-snug">
                                CÔNG TY CỔ PHẦN ĐẦU TƯ HẠ TẦNG GIAO THÔNG ĐÈO CẢ
                            </h2>

                            <p className="text-sm text-white/70 mt-1">
                                Cổng tra cứu nghĩa vụ công bố thông tin
                            </p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="text-sm text-white/80 space-y-2 md:text-left max-w-md">

                        <p>
                            <span className="font-medium text-white">Trụ sở:</span>{" "}
                            Km11+500 tuyến đường dẫn phía Nam hầm Hải Vân,
                            phường Hải Vân, TP. Đà Nẵng
                        </p>

                        <p>
                            <span className="font-medium text-white">Liên hệ:</span>{" "}
                            0903 673 684 - Mr. Huy (Trưởng ban Pháp chế)
                        </p>

                        <p>
                            <span className="font-medium text-white">Email:</span>{" "}
                            info@hhv.com.vn
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/15 my-6" />

                {/* Bottom */}
                <div className="text-center text-xs text-white/60">
                    © {new Date().getFullYear()} CTCP Đầu tư Hạ tầng Giao thông Đèo Cả (HHV). All rights reserved.
                </div>
            </div>
        </footer>
    );
}