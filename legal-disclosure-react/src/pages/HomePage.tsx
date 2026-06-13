/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Search, User, BadgeInfo, AlertTriangle, FileCheck, FileText } from "lucide-react";
import type { IPerson } from "../ts/IPerson";
import { legalService } from "../services/legal";
import type { IFile } from "../ts/IFile";
import { fileService } from "../services/file";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function HomePage() {

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [person, setPerson] = useState<IPerson | null>(null);
    const [file, setFile] = useState<IFile[]>([]);

    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery) {
            setError("Vui lòng nhập CCCD/CMND để tra cứu");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setPerson(null);
            setFile([]);

            const data = await legalService.searchPerson(trimmedQuery);

            if (!data || Object.keys(data).length === 0) {
                setError("Không tìm thấy thông tin cho số giấy tờ này");
                return;
            }

            setPerson(data);
            if (data.typePerson) {
                const fileData = await fileService.getObligations(data.typePerson);
                setFile(fileData);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Đã có lỗi xảy ra khi tra cứu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <div
                className="relative bg-cover bg-center text-white py-24"
                style={{
                    backgroundImage: "url('/image copy.png')",
                }}
            >
                <div className="absolute inset-0 bg-indigo-500/20 backdrop-blur-[2px]" />
                {/* Content */}
                <div className="relative max-w-5xl mx-auto text-center px-4">
                    <img
                        src="/image.png"
                        alt="HHV"
                        className="h-24 mx-auto mb-8 bg-white p-3 rounded-xl shadow-lg"
                    />

                    <h1 className="text-5xl font-bold drop-shadow-lg">
                        CỔNG THÔNG TIN CÔNG BỐ THÔNG TIN
                    </h1>

                    <p className="mt-4 text-lg text-slate-200 max-w-3xl mx-auto">
                        Tra cứu nghĩa vụ công bố thông tin của Người nội bộ và. Người có liên quan theo quy định hiện hành.
                    </p>
                </div>
            </div>

            {/* Search Section */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 -mt-20 pb-20">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Nhập số CCCD / CMND..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2e2c7d] outline-none"
                            />
                        </div>
                        <button type="submit" disabled={loading} className="bg-[#2e2c7d] text-white px-8 rounded-xl font-bold hover:bg-[#1f1d56] transition">
                            {loading ? "Đang tra cứu..." : "TRA CỨU"}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2">
                            <AlertTriangle size={20} /> {error}
                        </div>
                    )}
                </div>

                {/* Result Section */}
                {person && (
                    <div className="mt-8 space-y-6 animate-in fade-in duration-500">
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="bg-linear-to-r from-[#2e2c7d] to-indigo-600 px-6 py-5 text-white">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold">
                                        KẾT QUẢ TRA CỨU
                                    </h2>

                                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                                        {person.typePerson == "TC" ? "Tổ chức" : person.typePerson}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid lg:grid-cols-3 gap-6">

                                    <div className="lg:col-span-2 space-y-4">

                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <User className="text-[#2e2c7d]" />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-lg">
                                                    {person.ho_ten}
                                                </h3>

                                                <p className="text-slate-500 text-sm">
                                                    {person.so_giay_nsh}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">

                                            <div className="bg-slate-50 rounded-xl p-4">
                                                <p className="text-xs text-slate-500 uppercase">
                                                    Mã chứng khoán
                                                </p>

                                                <p className="font-semibold">
                                                    {person.ma_chung_khoan || "-"}
                                                </p>
                                            </div>

                                            <div className="bg-slate-50 rounded-xl p-4">
                                                <p className="text-xs text-slate-500 uppercase">
                                                    Tài khoản giao dịch
                                                </p>

                                                <p className="font-semibold">
                                                    {person.tk_giao_dich || "-"}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                            <h4 className="font-semibold text-amber-800 mb-3">
                                                Mối quan hệ
                                            </h4>


                                            <div className="mt-2">
                                                {person.typePerson?.trim() === "TC" ? (
                                                    person.related_info?.map((i) => (
                                                        <div key={i._id || i.ho_ten} className="text-slate-700">
                                                            Người nội bộ <strong>{i.ho_ten}</strong>{" "}
                                                            {person.moi_quan_he?.replace(/Người nội bộ/i, "")}
                                                        </div>
                                                    ))
                                                ) : person.typePerson?.trim() === "NNB" ? (
                                                    <span className="text-slate-500 ml-1">
                                                        {person.moi_quan_he}
                                                    </span>
                                                ) : person.typePerson?.trim() === "NLQ" ? (
                                                    <span className="text-slate-500 ml-1">
                                                        ({person.moi_quan_he} của người nội bộ <strong>{person.related_info?.[0]?.ho_ten || "N/A"}</strong>)
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                    </div>

                                    <div>
                                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 h-full">
                                            <div className="flex items-center gap-2 mb-3">
                                                <BadgeInfo
                                                    size={18}
                                                    className="text-blue-600"
                                                />

                                                <h4 className="font-semibold text-blue-700">
                                                    Ghi chú
                                                </h4>
                                            </div>

                                            <p className="text-sm leading-6 text-slate-700">
                                                {person.ghi_chu ||
                                                    "Hệ thống xác định đối tượng thuộc diện công bố thông tin theo quy định hiện hành."}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <FileCheck className="text-green-600" />
                                Nghĩa vụ và biểu mẫu
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {file.map((item) => (
                                    <div
                                        key={item._id}
                                        className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-[#2e2c7d] transition-all duration-300 hover:-translate-y-1 flex flex-col"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                                            <FileText
                                                size={24}
                                                className="text-[#2e2c7d]"
                                            />
                                        </div>

                                        <h4 className="font-semibold text-slate-800 text-lg mb-2 line-clamp-2">
                                            {item.title}
                                        </h4>

                                        <p className="text-sm text-slate-500 flex-1 line-clamp-4">
                                            {item.content}
                                        </p>

                                        {item.file && (
                                            <a
                                                href={`${API_URL}/filesInform/${item._id}/preview`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#2e2c7d] px-4 py-2 text-sm font-medium text-white hover:bg-[#252365] transition"
                                            >
                                                Xem biểu mẫu
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

