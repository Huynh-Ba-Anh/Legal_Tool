import React from "react";
import type { IFileDraft } from "../../ts/IFile";
import { X, Loader2 } from "lucide-react"; // Bổ sung icon Loader2 cho hiệu ứng xoay

interface Props {
    newFile: IFileDraft;
    setNewFile: (data: IFileDraft) => void;

    uploadFiles: File[];
    setUploadFiles: (files: File[]) => void;

    handleCreate: () => Promise<void>;
    setIsCreate: (value: boolean) => void;
}

export default function Create({
    newFile,
    setNewFile,
    uploadFiles,
    setUploadFiles,
    handleCreate,
    setIsCreate,
}: Props) {
    // State quản lý trạng thái đang xử lý khi gửi form
    const [isCreating, setIsCreating] = React.useState(false);

    const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        const combined = [...uploadFiles, ...newFiles];

        // Giới hạn tối đa 3 file
        if (combined.length > 3) {
            alert("Tối đa 3 file được phép");
            return;
        }

        setUploadFiles(combined);
        e.target.value = "";
    };

    const handleRemoveFile = (index: number) => {
        setUploadFiles(uploadFiles.filter((_, i) => i !== index));
    };

    // Hàm bọc xử lý sự kiện Tạo mới để bật/tắt loading
    const onSubmit = async () => {
        try {
            setIsCreating(true);
            await handleCreate();
        } catch (error) {
            alert("Lỗi khi thêm biểu mẫu mới");
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative overflow-hidden">

                {/* Lớp phủ thông báo Đang xử lý */}
                {isCreating && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-50 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-[#2e2c7d]" />
                        <span className="text-sm font-medium text-slate-600">
                            Đang tạo biểu mẫu...
                        </span>
                    </div>
                )}

                <h3 className="font-bold text-lg text-slate-800 mb-4">
                    Thêm biểu mẫu mới
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase">
                            Tiêu đề
                        </label>
                        <input
                            value={newFile.title}
                            disabled={isCreating}
                            onChange={(e) =>
                                setNewFile({
                                    ...newFile,
                                    title: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2 disabled:bg-slate-50 disabled:text-slate-400"
                            placeholder="Nhập tiêu đề..."
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase">
                            Nội dung
                        </label>
                        <textarea
                            rows={3}
                            value={newFile.content}
                            disabled={isCreating}
                            onChange={(e) =>
                                setNewFile({
                                    ...newFile,
                                    content: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2 disabled:bg-slate-50 disabled:text-slate-400"
                            placeholder="Nhập nội dung..."
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase">
                            Nhóm áp dụng
                        </label>
                        <select
                            value={newFile.typePerson}
                            disabled={isCreating}
                            onChange={(e) =>
                                setNewFile({
                                    ...newFile,
                                    typePerson: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            <option value="NNB">Người nội bộ</option>
                            <option value="NLQ">Người liên quan</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase">
                            File đính kèm (Tối đa 3)
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            disabled={isCreating}
                            onChange={handleAddFiles}
                            multiple
                            className="w-full mt-1 border rounded-xl px-3 py-2 disabled:opacity-50"
                        />

                        {uploadFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold text-slate-600">
                                    Đã chọn {uploadFiles.length} file:
                                </p>
                                <div className="space-y-2">
                                    {uploadFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200"
                                        >
                                            <span className="text-sm text-slate-700 truncate">
                                                📎 {file.name}
                                            </span>
                                            <button
                                                type="button"
                                                disabled={isCreating}
                                                onClick={() => handleRemoveFile(index)}
                                                className="p-1 hover:bg-red-100 rounded transition disabled:opacity-30"
                                            >
                                                <X size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        disabled={isCreating}
                        onClick={() => setIsCreate(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl disabled:opacity-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        disabled={isCreating}
                        onClick={onSubmit}
                        className="px-4 py-2 bg-[#2e2c7d] text-white font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2"
                    >
                        {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isCreating ? "Đang tạo..." : "Tạo mới"}
                    </button>
                </div>
            </div>
        </div>
    );
}