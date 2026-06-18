/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Phone, User, FileText, CheckCircle, Clock, Trash2, ShieldAlert, Check } from "lucide-react";
import type { ISupport } from "../ts/ISupport";
import supportService from "../services/support";

export default function SupportManagement() {
    const [supports, setSupports] = useState<ISupport[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const pendingCount = useMemo(() => supports.filter(item => item.status === "pending").length, [supports]);
    const processingCount = useMemo(() => supports.filter(item => item.status === "processing").length, [supports]);
    const doneCount = useMemo(() => supports.filter(item => item.status === "done").length, [supports]);

    const fetchSupports = async () => {
        try {
            setLoading(true);
            const data = await supportService.getAll();
            setSupports(data || []);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu hỗ trợ:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupports();
    }, []);

    const updateStatus = async (id: string, status: "pending" | "processing" | "done") => {
        try {
            const updated = await supportService.updateStatus(id, status);
            setSupports(prev => prev.map(item => item._id === id ? updated : item));
        } catch (error) {
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;
        try {
            await supportService.delete(deleteTargetId);
            setSupports(prev => prev.filter(item => item._id !== deleteTargetId));
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteTargetId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Chưa xử lý</p>
                        <h3 className="text-3xl font-black text-red-600 mt-1">{pendingCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500"><Clock size={20} /></div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Đang xử lý</p>
                        <h3 className="text-3xl font-black text-amber-600 mt-1">{processingCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Clock size={20} /></div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Hoàn thành</p>
                        <h3 className="text-3xl font-black text-emerald-600 mt-1">{doneCount}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><CheckCircle size={20} /></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-[#2e2c7d] text-white flex justify-between items-center">
                    <h2 className="font-bold tracking-wide text-sm uppercase">Danh sách yêu cầu hỗ trợ</h2>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Tổng số: {supports.length}</span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500 font-medium text-sm animate-pulse">Đang tải dữ liệu...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                                    <th className="text-left p-4 font-semibold">Người yêu cầu</th>
                                    <th className="text-left p-4 font-semibold">Nghĩa vụ liên quan</th>
                                    <th className="text-left p-4 font-semibold">Nội dung ghi chú</th>
                                    <th className="text-left p-4 font-semibold">Trạng thái</th>
                                    <th className="text-center p-4 font-semibold w-36">Thao tác</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {supports.map(item => (
                                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors duration-150">
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                                    <User size={14} className="text-slate-400" />
                                                    {item.personName || "Khách vãng lai"}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                    <Phone size={14} className="text-slate-400" />
                                                    {item.phone}
                                                </div>
                                                <div className="text-xs text-slate-400 pl-5">
                                                    {item.typePerson === "NNB"
                                                        ? "Người nội bộ"
                                                        : item.typePerson === "NLQ"
                                                            ? "Người có liên quan"
                                                            : item.typePerson === "TC" ? "Người có liên quan" : ""}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-start gap-1.5 max-w-xs text-slate-700 font-medium">
                                                <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{item.currentObligation || "-"}</span>
                                            </div>
                                        </td>

                                        <td className="p-4 max-w-xs text-slate-600 leading-relaxed text-xs">
                                            {item.message || <span className="text-slate-400 italic">Không có nội dung</span>}
                                        </td>

                                        <td className="p-4">
                                            {item.status === "pending" && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                                                    <Clock size={12} /> Chưa xử lý
                                                </span>
                                            )}
                                            {item.status === "processing" && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                                                    <Clock size={12} /> Đang xử lý
                                                </span>
                                            )}
                                            {item.status === "done" && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                                                    <CheckCircle size={12} /> Hoàn thành
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex justify-center items-center gap-1.5">
                                                {item.status === "pending" && (
                                                    <button
                                                        onClick={() => updateStatus(item._id, "processing")}
                                                        className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white border border-amber-200 transition-all duration-200"
                                                    >
                                                        <Clock size={14} />
                                                    </button>
                                                )}

                                                {item.status !== "done" && (
                                                    <button
                                                        onClick={() => updateStatus(item._id, "done")}
                                                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all duration-200"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => setDeleteTargetId(item._id)}
                                                    className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 transition-all duration-200"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {deleteTargetId && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100">
                        <div className="flex items-center gap-3 text-rose-600">
                            <ShieldAlert size={22} />
                            <h4 className="font-bold text-slate-900">Xác nhận xóa</h4>
                        </div>
                        <p className="mt-2 text-slate-600 text-xs leading-relaxed">
                            Bạn chắc chắn muốn loại bỏ yêu cầu hỗ trợ này chứ? Dữ liệu bị xóa sẽ không thể khôi phục lại.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button onClick={() => setDeleteTargetId(null)} className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600">Hủy</button>
                            <button onClick={confirmDelete} className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white">Xóa bỏ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}