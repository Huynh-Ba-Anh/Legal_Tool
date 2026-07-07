/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import type { IFile, IFileDraft } from "../../ts/IFile";
import { X, Download, Trash2, Loader2 } from "lucide-react";
import { fileService } from "../../services/file";

interface Props {
    selectedFile: IFile;
    editDraft: IFileDraft | null;
    setEditDraft: (data: IFileDraft | null) => void;
    setSelectedFile: (data: IFile | null) => void;
    handleUpdate: (data: IFileDraft) => Promise<void>;
    getTypeText: (type: string) => string;

    uploadFiles: File[];
    setUploadFiles: (files: File[]) => void;
    onFileDeleted?: () => void;
}

export default function Update({
    selectedFile,
    editDraft,
    setEditDraft,
    setSelectedFile,
    handleUpdate,
    getTypeText,
    uploadFiles,
    setUploadFiles,
    onFileDeleted,
}: Props) {
    const [fileToUpdateIndices, setFileToUpdateIndices] = React.useState<number[]>([]);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [isUpdatingFile, setIsUpdatingFile] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        const combined = [...uploadFiles, ...newFiles];

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

    const handleDeleteFile = async (fileIndex: number) => {
        if (!window.confirm("Bạn có chắc muốn xóa file này?")) return;

        try {
            setIsDeleting(true);
            await fileService.deleteFile(selectedFile._id, fileIndex);
            alert("Xóa file thành công");
            onFileDeleted?.();
            setSelectedFile(null);
        } catch (error) {
            alert("Lỗi khi xóa file");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFileUpdateChange = (fileIndex: number) => {
        setFileToUpdateIndices((prev) =>
            prev.includes(fileIndex)
                ? prev.filter((i) => i !== fileIndex)
                : [...prev, fileIndex]
        );
    };

    const handleUpdateSelectedFiles = async () => {
        if (uploadFiles.length === 0) {
            alert("Vui lòng chọn file để cập nhật");
            return;
        }

        if (uploadFiles.length !== fileToUpdateIndices.length) {
            alert("Số lượng file và vị trí cập nhật phải khớp nhau");
            return;
        }

        const sortedIndices = [...fileToUpdateIndices].sort((a, b) => a - b);

        try {
            setIsUpdatingFile(true);
            await fileService.updateFiles(selectedFile._id, uploadFiles, sortedIndices);
            alert("Cập nhật file thành công");
            onFileDeleted?.();
            setSelectedFile(null);
            setUploadFiles([]);
            setFileToUpdateIndices([]);
        } catch (error) {
            alert("Lỗi khi cập nhật file");
            console.error(error);
        } finally {
            setIsUpdatingFile(false);
        }
    };

    const onSave = async () => {
        if (!editDraft) return;
        try {
            setIsSaving(true);
            await handleUpdate(editDraft);

            setSelectedFile(null);
            setEditDraft(null);
            setUploadFiles([]);
        } catch (error) {
            alert("Lỗi khi lưu thông tin");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!selectedFile) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">

                {(isSaving || isDeleting || isUpdatingFile) && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl z-50 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-slate-600">
                            {isSaving && "Đang lưu thay đổi..."}
                            {isDeleting && "Đang xóa dữ liệu..."}
                            {isUpdatingFile && "Đang cập nhật tập tin..."}
                        </span>
                    </div>
                )}

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
                            disabled={isSaving}
                            onChange={(e) =>
                                setEditDraft({
                                    ...editDraft,
                                    title: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2 disabled:bg-slate-50"
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
                            disabled={isSaving}
                            onChange={(e) =>
                                setEditDraft({
                                    ...editDraft,
                                    content: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2 disabled:bg-slate-50"
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
                            disabled={isSaving}
                            onChange={(e) =>
                                setEditDraft({
                                    ...editDraft,
                                    typePerson: e.target.value,
                                })
                            }
                            className="w-full mt-1 border rounded-xl px-3 py-2 bg-white disabled:bg-slate-50"
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
                        File (Tối đa 3)
                    </span>

                    {editDraft ? (
                        <>
                            <div className="mt-2">
                                {selectedFile.files && selectedFile.files.length > 0 ? (
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-slate-600 mb-2">
                                            File hiện tại (chọn để cập nhật):
                                        </p>
                                        <div className="space-y-1">
                                            {selectedFile.files.map((file: any, idx: number) => (
                                                <label key={idx} className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={fileToUpdateIndices.includes(idx)}
                                                        onChange={() => handleFileUpdateChange(idx)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm text-slate-600">
                                                        📎 {file.originalName}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 mb-3">Không có file</p>
                                )}
                            </div>

                            {fileToUpdateIndices.length > 0 && (
                                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-xs font-semibold text-blue-700 mb-2">
                                        Cập nhật {fileToUpdateIndices.length} file
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                        onChange={handleAddFiles}
                                        multiple
                                        className="w-full border rounded-xl px-3 py-2 text-sm"
                                    />
                                    {uploadFiles.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {uploadFiles.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between bg-white p-2 rounded border border-blue-200 text-sm"
                                                >
                                                    <span className="text-blue-700 truncate">
                                                        📎 {file.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFile(index)}
                                                        className="p-1 hover:bg-red-100 rounded transition"
                                                    >
                                                        <X size={14} className="text-red-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleUpdateSelectedFiles}
                                        disabled={isUpdatingFile || uploadFiles.length !== fileToUpdateIndices.length}
                                        className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-1"
                                    >
                                        {isUpdatingFile && <Loader2 className="w-3. h-3 animate-spin" />}
                                        {isUpdatingFile ? "Đang cập nhật..." : "Cập nhật file"}
                                    </button>
                                </div>
                            )}

                            {fileToUpdateIndices.length === 0 && (
                                <>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                        onChange={handleAddFiles}
                                        multiple
                                        className="w-full mt-2 border rounded-xl px-3 py-2"
                                    />

                                    {uploadFiles.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs font-semibold text-green-700">
                                                Thêm {uploadFiles.length} file mới:
                                            </p>
                                            <div className="space-y-2">
                                                {uploadFiles.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between bg-green-50 p-2 rounded-lg border border-green-200"
                                                    >
                                                        <span className="text-sm text-green-700 truncate">
                                                            📎 {file.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="p-1 hover:bg-red-100 rounded transition"
                                                        >
                                                            <X size={16} className="text-red-500" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="mt-2">
                            {selectedFile.files && selectedFile.files.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedFile.files.map((file: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            <span className="text-sm text-slate-700 truncate flex-1">
                                                📎 {file.originalName}
                                            </span>
                                            <div className="flex items-center gap-2 ml-2">
                                                <a
                                                    href={`${import.meta.env.VITE_API_BASE_URL}/filesInform/${selectedFile._id}/preview?fileIndex=${idx}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 hover:bg-blue-100 rounded transition text-blue-600"
                                                    title="Tải xuống"
                                                >
                                                    <Download size={16} />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteFile(idx)}
                                                    disabled={isDeleting}
                                                    className="p-2 hover:bg-red-100 rounded transition text-red-600 disabled:opacity-50"
                                                    title="Xóa file"
                                                >
                                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                                    Không có file
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => {
                            setSelectedFile(null);
                            setEditDraft(null);
                            setUploadFiles([]);
                        }}
                        disabled={isSaving || isDeleting || isUpdatingFile}
                        className="px-4 py-2 bg-slate-100 rounded-xl disabled:opacity-50"
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
                                setUploadFiles([]);
                            }}
                            className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl"
                        >
                            Sửa
                        </button>
                    ) : (
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-50 text-green-600 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSaving ? "Đang lưu..." : "Lưu"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}