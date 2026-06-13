/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import { personService } from "../services/people";
import React from "react";
import { legalService } from "../services/legal";
import FilesManage from "../components/FilesManage";
import { useNavigate } from "react-router-dom";

const COLUMNS = [
    { label: "Mã CK", key: "Mã chứng khoán" },
    { label: "Họ tên", key: "Họ tên" },
    { label: "TK Giao dịch", key: "Tài khoản giao dịch chứng khoán (nếu có)" },
    { label: "Chức vụ", key: "Chức vụ tại công ty" },
    { label: "Mối quan hệ", key: "Mối quan hệ đối với người nội bộ" },
    { label: "Loại NSH", key: "Loại hình Giấy NSH (CCCD, Hộ chiếu, ĐKKD)" },
    { label: "Số NSH", key: "Số giấy NSH" },
    { label: "Ngày cấp", key: "Ngày cấp giấy NSH" },
    { label: "Nơi cấp", key: "Nơi cấp" },
    { label: "Địa chỉ", key: "Địa chỉ trụ sở chính/Địa chỉ liên hệ" },
    { label: "Số CP cuối kỳ", key: "Số cổ phiếu sở hữu cuối kỳ (cổ phiếu)" },
    { label: "Tỷ lệ sở hữu (%)", key: "Tỷ lệ sở hữu cuối kỳ (%)" },
    { label: "Thời điểm bắt đầu", key: "Thời điểm bắt đầu là người có liên quan của công ty/ người nội bộ" },
    { label: "Thời điểm kết thúc", key: "Thời điểm không còn là người có liên quan của công ty/ người nội bộ" },
    { label: "Lý do thay đổi", key: "Lý do (khi phát sinh thay đổi liên quan đến mục 13 và mục 14)" },
    { label: "Ghi chú", key: "Ghi chú (về việc không có số giấy NSH và các ghi chú khác)" },
    { label: "Related NSH", key: "Số giấy NSH của người nội bộ có liên quan" }
];

export default function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [excelData, setExcelData] = useState<any[]>([]);
    const [dbPeople, setDbPeople] = useState<any[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();


    useEffect(() => {
        const loadAllPeople = async () => {
            try {
                const data = await legalService.getAllLegalInfo();
                setDbPeople(data || []);
                console.log(data)

            } catch (err) {
                console.error("Lỗi tải danh sách người dùng");
            }
        };
        loadAllPeople();
    }, []);

    const groupedData = useMemo(() => {
        if (!Array.isArray(dbPeople)) return [];

        const nnbList = dbPeople.filter(p => p.moi_quan_he == "Người nội bộ");
        console.log(nnbList)

        return nnbList.map(nnb => ({
            ...nnb,
            related: dbPeople.filter(p =>
                Array.isArray(p.related_nsh) &&
                p.related_nsh.includes(nnb.so_giay_nsh?.trim())
            )
        }));
    }, [dbPeople]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });

            let allData: any[] = [];

            workbook.SheetNames.forEach((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet);
                allData = [...allData, ...rows];
            });

            setExcelData(allData);
            setMessage(`Đã đọc ${allData.length} dòng từ ${workbook.SheetNames.length} sheet.`);
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (!selectedFile) return;
        try {
            setLoading(true);
            await personService.importData(selectedFile);
            const updated = await legalService.getAllLegalInfo();
            setDbPeople(updated);
            setMessage("Import thành công!");
            setShowConfirm(false);
        } catch (error: any) {
            setMessage("Import thất bại");
        } finally {
            setLoading(false);
            setExcelData([]);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/admin-login");
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#2e2c7d]">
                        Dashboard Quản trị
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Hệ thống Công bố thông tin - Ban Pháp chế HHV
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-[#2e2c7d] text-white px-5 py-3 rounded-xl font-semibold shadow hover:bg-indigo-800 hover:shadow-lg transition-all duration-200"
                >
                    Đăng xuất
                </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow p-6"><p className="text-slate-500">Người nội bộ</p><h3 className="text-3xl font-bold">{groupedData.length}</h3></div>
                <div className="bg-white rounded-2xl shadow p-6"><p className="text-slate-500">Người liên quan</p><h3 className="text-3xl font-bold">{dbPeople.length - groupedData.length}</h3></div>
                <div className="bg-white rounded-2xl shadow p-6"><p className="text-slate-500">Biểu mẫu</p><h3 className="text-3xl font-bold">0</h3></div>
            </div>

            <div className="bg-white rounded-2xl shadow overflow-hidden mb-8">
                <div className="bg-[#2e2c7d] text-white px-6 py-4 font-bold">Danh sách đối tượng (NNB & NLQ)</div>
                <div className="p-6">
                    <div className="overflow-auto max-h-125">
                        <table className="min-w-full text-sm border-collapse">
                            <thead className="bg-slate-100 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left">Họ tên / Mối quan hệ</th>
                                    <th className="p-3 text-left">Chức vụ tại công ty</th>
                                    <th className="p-3 text-left">Số giấy NSH</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData.map((nnb) => (
                                    <React.Fragment key={nnb.so_giay_nsh}>
                                        <tr className="bg-blue-50 font-bold border-t">
                                            <td className="p-3 text-[#2e2c7d]">{nnb.ho_ten}</td>
                                            <td className="p-3">{nnb.chuc_vu || "-"}</td>
                                            <td className="p-3">{nnb.so_giay_nsh}</td>
                                        </tr>
                                        {nnb.related?.map((nlq: any) => (
                                            <tr key={nlq.so_giay_nsh} className="border-b hover:bg-slate-50">
                                                <td className="p-3 pl-10 text-slate-600">
                                                    <span className="text-slate-400 mr-2">↳</span>
                                                    {nlq.ho_ten}
                                                    <span className="italic text-xs ml-1 font-semibold text-slate-500">
                                                        ({nlq.moi_quan_he} của người nội bộ {nnb.ho_ten})
                                                    </span>
                                                </td>
                                                <td className="p-3 text-slate-400 italic">NLQ</td>
                                                <td className="p-3 text-slate-600">{nlq.so_giay_nsh}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>


            {/* Upload Area */}
            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <div className="bg-[#2e2c7d] text-white px-6 py-4 font-semibold">Cập nhật dữ liệu từ Excel</div>
                <div className="p-8">
                    <label htmlFor="excel-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl py-12 cursor-pointer hover:border-[#2e2c7d] hover:bg-slate-50">
                        <Upload size={50} className="text-[#2e2c7d]" />
                        <h3 className="mt-4 font-semibold text-lg">Chọn file Excel</h3>
                        <input ref={fileInputRef} id="excel-upload" type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                    </label>

                    {message && <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl">{message}</div>}

                    {excelData.length > 0 && (
                        <div className="mt-6">
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setShowConfirm(true)} className="bg-[#2e2c7d] text-white px-6 py-3 rounded-xl font-bold">
                                    Xác nhận Import ({excelData.length})
                                </button>
                            </div>

                            {/* Preview Table giống Excel */}
                            <div className="overflow-auto border rounded-xl max-h-125 shadow-sm">
                                <table className="min-w-full text-xs border-collapse">
                                    <thead className="sticky top-0 bg-[#2e2c7d] text-white">
                                        <tr>
                                            {COLUMNS.map(c => <th key={c.key} className="border p-3 text-left whitespace-nowrap">{c.label}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {excelData.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-50 border-b">
                                                {COLUMNS.map(c => <td key={c.key} className="border p-2 text-slate-700">{row[c.key] ?? ""}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Confirm */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-112.5">
                        <h2 className="font-bold text-lg">Xác nhận Import</h2>
                        <p className="mt-3 text-slate-600">Bạn có chắc muốn import <strong>{excelData.length}</strong> dòng dữ liệu vào hệ thống?</p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowConfirm(false)} className="border px-4 py-2 rounded-lg">Huỷ</button>
                            <button onClick={handleImport} disabled={loading} className="bg-[#2e2c7d] text-white px-4 py-2 rounded-lg">
                                {loading ? "Đang xử lý..." : "Đồng ý"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <FilesManage />
        </div>
    );
}