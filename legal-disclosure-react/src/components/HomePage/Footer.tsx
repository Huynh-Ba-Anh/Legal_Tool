export default function Footer() {
    return (
        <footer className="bg-[#2e2c7d] text-white mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Top content area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <div className="lg:col-span-5 space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-32 h-12 shrink-0 rounded-md bg-white flex items-center justify-center overflow-hidden">
                                <img
                                    src="/image.png"
                                    alt="HHV Logo"
                                    className="h-8 w-auto object-contain"
                                />
                            </div>

                            <div>
                                <h2 className="font-bold text-base md:text-lg leading-snug uppercase text-white">
                                    CỔNG TRA CỨU VÀ HỖ TRỢ CÔNG BỐ THÔNG TIN CHO NGƯỜI NỘI BỘ VÀ NGƯỜI CÓ LIÊN QUAN CỦA NGƯỜI NỘI BỘ HHV
                                </h2>
                            </div>
                        </div>

                        <div className="text-sm text-white/80 space-y-2 pt-2">
                            <p>
                                <span className="font-semibold text-white">Nhóm phát triển:</span>{" "}
                                Ban Pháp chế HHV – ITS XN hầm Hải Vân
                            </p>
                            <p>
                                <span className="font-semibold text-white">Địa chỉ liên hệ:</span>{" "}
                                Km11 + 500 tuyến đường dẫn phía Nam hầm Hải Vân, phường Hải Vân, TP. Đà Nẵng.
                            </p>
                            <p>
                                <span className="font-semibold text-white">Điện thoại:</span>{" "}
                                0903 673 684 (mr. Huy)
                            </p>
                            <p>
                                <span className="font-semibold text-white">Email:</span>{" "}
                                HHV.PhapChe@deoca.vn
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-7 bg-white/5 p-5 rounded-xl border border-white/10 text-xs md:text-sm text-white/70 space-y-3">
                        <h3 className="font-bold text-sm md:text-base text-white uppercase tracking-wider border-b border-white/10 pb-2">
                            TUYÊN BỐ TRÁCH NHIỆM
                        </h3>

                        <p className="leading-relaxed text-justify">
                            Cổng tra cứu này được sử dụng nội bộ để phục vụ cho mục đích đầu tiên và duy nhất là phục vụ tra cứu thông tin và hỗ trợ công bố thông tin cho người nội bộ và người có liên quan của người nội bộ HHV. Nghiêm cấm mọi hành vi chia sẻ hoặc phát tán dữ liệu có được từ Cổng tra cứu này cho bất kỳ bên thứ ba nào dưới mọi hình thức hoặc lợi dụng Cổng tra cứu này để trục lợi cá nhân, tống tiền, bôi nhọ, xâm phạm quyền riêng tư, hoặc thực hiện bất kỳ hành vi nào vi phạm pháp luật hiện hành.
                        </p>

                        <p className="leading-relaxed text-justify">
                            Mọi thông tin, dữ liệu hiển thị trên Cổng tra cứu chỉ mang tính chất thống kê. Cổng tra cứu này <span className="font-semibold text-white underline decoration-amber-400">hoàn toàn không</span> được thiết kế để phục vụ, định hướng hay hỗ trợ cho các hoạt động mua bán, giao dịch cổ phiếu HHV. Dữ liệu tra cứu không cấu thành lời khuyên hay khuyến nghị đầu tư dưới bất kỳ hình thức nào.
                        </p>
                    </div>

                </div>

                {/* Divider */}
                <div className="border-t border-white/15 my-6" />

                {/* Bottom copyright */}
                <div className="text-center text-xs text-white/60">
                    © {new Date().getFullYear()} CTCP Đầu tư Hạ tầng Giao thông Đèo Cả (HHV). Mọi quyền được bảo lưu.
                </div>
            </div>
        </footer>
    );
}