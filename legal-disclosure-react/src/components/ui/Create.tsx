import type { IFileDraft } from "../../ts/IFile";

interface Props {
    newFile: IFileDraft;
    setNewFile: (data: IFileDraft) => void;

    uploadFile: File | null;
    setUploadFile: (file: File | null) => void;

    handleCreate: () => Promise<void>;
    setIsCreate: (value: boolean) => void;
}

export default function Create({
    newFile,
    setNewFile,
    uploadFile,
    setUploadFile,
    handleCreate,
    setIsCreate,
}: Props) {
    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">

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
                            onChange={(e) =>
                                setNewFile({
                                    ...newFile,
                                    title: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2"
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
                            onChange={(e) =>
                                setNewFile({
                                    ...newFile,
                                    content: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2"
                            placeholder="Nhập nội dung..."
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase">
                            Nhóm áp dụng
                        </label>

                        <select
                            value={newFile.typePerson}
                            onChange={(e) =>
                                setNewFile({
                                    ...newFile,
                                    typePerson: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2"
                        >
                            <option value="NNB">Người nội bộ</option>
                            <option value="NLQ">Người liên quan</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase">
                            File đính kèm
                        </label>

                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                setUploadFile(file ?? null);
                            }}
                            className="w-full mt-1 border rounded-xl px-3 py-2"
                        />

                        {uploadFile && (
                            <p className="mt-2 text-sm text-slate-600">
                                📎 {uploadFile.name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">

                    <button
                        onClick={() => setIsCreate(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-[#2e2c7d] text-white font-semibold rounded-xl"
                    >
                        Tạo mới
                    </button>
                </div>
            </div>
        </div>
    );
}