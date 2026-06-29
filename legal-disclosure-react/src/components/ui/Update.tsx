import type { IFile, IFileDraft } from "../../ts/IFile";

interface Props {
    selectedFile: IFile;
    editDraft: IFileDraft | null;
    setEditDraft: (data: IFileDraft | null) => void;
    setSelectedFile: (data: IFile | null) => void;
    handleUpdate: (data: IFileDraft) => Promise<void>;
    getTypeText: (type: string) => string;

    uploadFile: File | null;
    setUploadFile: (file: File | null) => void;
}

export default function Update({
    selectedFile,
    editDraft,
    setEditDraft,
    setSelectedFile,
    handleUpdate,
    getTypeText,
    uploadFile,
    setUploadFile,
}: Props) {
    if (!selectedFile) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">

                <h3 className="font-bold text-lg mb-4">
                    {editDraft ? "Chỉnh sửa biểu mẫu" : "Chi tiết biểu mẫu"}
                </h3>

                <div>
                    <span className="text-xs text-slate-400 uppercase">
                        Tiêu đề
                    </span>

                    {editDraft ? (
                        <input
                            value={editDraft.title}
                            onChange={(e) =>
                                setEditDraft({
                                    ...editDraft,
                                    title: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2"
                        />
                    ) : (
                        <p>{selectedFile.title}</p>
                    )}
                </div>

                <div className="mt-3">
                    <span className="text-xs text-slate-400 uppercase">
                        Nội dung
                    </span>

                    {editDraft ? (
                        <textarea
                            value={editDraft.content}
                            onChange={(e) =>
                                setEditDraft({
                                    ...editDraft,
                                    content: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2"
                        />
                    ) : (
                        <p className="text-sm bg-slate-50 p-3 rounded-xl">
                            {selectedFile.content}
                        </p>
                    )}
                </div>

                <div className="mt-3">
                    <span className="text-xs text-slate-400 uppercase">
                        Nhóm
                    </span>

                    {editDraft ? (
                        <select
                            value={editDraft.typePerson}
                            onChange={(e) =>
                                setEditDraft({
                                    ...editDraft,
                                    typePerson: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2 bg-white"
                        >
                            <option value="NNB">Người nội bộ</option>
                            <option value="NLQ">Người liên quan</option>
                        </select>
                    ) : (
                        <p className="text-sm bg-slate-50 p-3 rounded-xl">
                            {getTypeText(selectedFile.typePerson)}
                        </p>
                    )}
                </div>

                <div className="mt-3">
                    <span className="text-xs text-slate-400 uppercase">
                        File
                    </span>

                    {editDraft ? (
                        <>
                            <p className="text-sm mb-2">
                                File hiện tại:
                                {" "}
                                {selectedFile.file?.originalName ||
                                    "Không có file"}
                            </p>

                            <input
                                type="file"
                                onChange={(e) => {
                                    const file =
                                        e.target.files?.[0];

                                    setUploadFile(file ?? null);
                                }}
                                className="w-full mt-1 border rounded-xl px-3 py-2"
                            />

                            {uploadFile && (
                                <p className="mt-2 text-sm text-green-600">
                                    📎 File mới:
                                    {" "}
                                    {uploadFile.name}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm bg-slate-50 p-3 rounded-xl">
                            {selectedFile.file?.originalName ||
                                "Không có file"}
                        </p>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3">

                    <button
                        onClick={() => {
                            setSelectedFile(null);
                            setEditDraft(null);
                            setUploadFile(null);
                        }}
                        className="px-4 py-2 bg-slate-100 rounded-xl"
                    >
                        Đóng
                    </button>

                    {!editDraft ? (
                        <button
                            onClick={() => {
                                setEditDraft({
                                    title: selectedFile.title,
                                    content: selectedFile.content,
                                    typePerson: selectedFile.typePerson,
                                });

                                setUploadFile(null);
                            }}
                            className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl"
                        >
                            Sửa
                        </button>
                    ) : (
                        <button
                            onClick={async () => {
                                await handleUpdate(editDraft);

                                setSelectedFile(null);
                                setEditDraft(null);
                                setUploadFile(null);
                            }}
                            className="px-4 py-2 bg-green-50 text-green-600 rounded-xl"
                        >
                            Lưu
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}