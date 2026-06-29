/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo, useState } from "react";
import { Eye, Trash2, Plus, FileText } from "lucide-react";
import { fileService } from "../services/file";
import type { IFile, IFileDraft } from "../ts/IFile";
import Update from "./ui/Update";
import Create from "./ui/Create";

type Props = {
    onFilesChange: (files: IFile[]) => void;
};

export default function FilesManage({ onFilesChange }: Props) {
    const [files, setFiles] = useState<IFile[]>([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [isCreate, setIsCreate] = useState(false);
    const [editDraft, setEditDraft] = useState<IFileDraft | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [editUploadFile, setEditUploadFile] = useState<File | null>(null);

    const [newFile, setNewFile] = useState<IFileDraft>({
        title: "",
        content: "",
        typePerson: "NNB",
    });

    const [selectedFile, setSelectedFile] = useState<IFile | null>(null);

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const data = await fileService.getAll();
            const safeData = Array.isArray(data) ? data : [];

            setFiles(safeData);
            onFilesChange(safeData);
        } catch (err) {
            console.error("Lỗi tải danh sách biểu mẫu:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa biểu mẫu này không?")) return;

        try {
            await fileService.delete(id);

            const updated = files.filter(item => item._id !== id);

            setFiles(updated);

            if (selectedFile?._id === id) {
                setSelectedFile(null);
            }

            onFilesChange(updated);

        } catch (err) {
            console.error("Lỗi xóa biểu mẫu:", err);
            alert("Có lỗi xảy ra khi xóa.");
        }
    };

    const handleUpdate = async (data: IFileDraft) => {
        try {
            if (!selectedFile) return;

            const formData = new FormData();

            formData.append("title", data.title);
            formData.append("content", data.content);
            formData.append("typePerson", data.typePerson);

            if (editUploadFile) {
                formData.append("file", editUploadFile);
            }

            const updatedFile = await fileService.update(
                selectedFile._id,
                formData
            );

            setFiles(prev =>
                prev.map(item =>
                    item._id === selectedFile._id
                        ? updatedFile
                        : item
                )
            );

            setSelectedFile(null);
            setEditDraft(null);
            setEditUploadFile(null);

        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert("Không thể cập nhật biểu mẫu");
        }
    };

    const handleCreate = async () => {
        if (!newFile.title || !newFile.content) {
            alert("Vui lòng nhập đầy đủ tiêu đề và nội dung.");
            return;
        }

        try {
            const formData = new FormData();

            formData.append("title", newFile.title);
            formData.append("content", newFile.content);
            formData.append("typePerson", newFile.typePerson);

            if (uploadFile) {
                formData.append("file", uploadFile);
            }

            const createdItem = await fileService.create(formData);

            const updated = [...files, createdItem];

            setFiles(updated);
            onFilesChange(updated);

            setNewFile({
                title: "",
                content: "",
                typePerson: "NNB",
            });

            setUploadFile(null);
            setIsCreate(false);

        } catch (err) {
            console.error("Lỗi khi tạo biểu mẫu:", err);
            alert("Không thể tạo biểu mẫu");
        }
    };
    const filteredFiles = useMemo(() => {
        return files.filter((item) => {
            const matchSearch = item.title
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchType =
                filter === "ALL" ||
                item.typePerson === filter;

            return matchSearch && matchType;
        });
    }, [files, search, filter]);

    const getTypeText = (type: string) => {
        switch (type) {
            case "NNB":
                return "Người nội bộ";
            case "NLQ":
                return "Người liên quan";
            default:
                return type;
        }
    };


    return (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
            {/* Header */}
            <div className="bg-[#2e2c7d] text-white px-6 py-4 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-lg">
                        Quản lý Biểu mẫu
                    </h2>
                    <p className="text-white/70 text-sm">
                        Quản lý các file công bố thông tin
                    </p>
                </div>

                <button onClick={() => setIsCreate(true)} className="bg-white text-[#2e2c7d] px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-100 transition-colors">
                    <Plus size={18} />
                    Thêm biểu mẫu
                </button>
            </div>

            {/* Filter */}
            <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm tiêu đề..."
                        className="flex-1 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2e2c7d]"
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-700"
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="NNB">Người nội bộ</option>
                        <option value="NLQ">Người liên quan</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 text-left font-semibold text-slate-600">
                                Tiêu đề
                            </th>
                            <th className="p-4 text-left font-semibold text-slate-600 whitespace-nowrap">
                                Áp dụng cho nhóm
                            </th>
                            <th className="p-4 text-center font-semibold text-slate-600 whitespace-nowrap">
                                Thao tác
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredFiles.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={3}
                                    className="py-12 text-center"
                                >
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <FileText size={40} />
                                        <span>Chưa có biểu mẫu nào phù hợp</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredFiles.map((item) => (
                                <tr
                                    key={item._id}
                                    className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                                >
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-800">
                                            {item.title}
                                        </div>

                                        <div className="text-xs text-slate-500 line-clamp-2 mt-1">
                                            {item.content}
                                        </div>
                                    </td>

                                    <td className="p-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-block ${item.typePerson === "NNB"
                                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                                : item.typePerson === "TC"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                                }`}
                                        >
                                            {getTypeText(item.typePerson)}
                                        </span>
                                    </td>

                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedFile(item)}
                                                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                title="Xóa"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedFile && (
                <Update
                    selectedFile={selectedFile}
                    editDraft={editDraft}
                    setEditDraft={setEditDraft}
                    setSelectedFile={setSelectedFile}
                    handleUpdate={handleUpdate}
                    getTypeText={getTypeText}
                    uploadFile={editUploadFile}
                    setUploadFile={setEditUploadFile}
                />
            )}

            {isCreate && (
                <Create
                    newFile={newFile}
                    setNewFile={setNewFile}
                    uploadFile={uploadFile}
                    setUploadFile={setUploadFile}
                    setIsCreate={setIsCreate}
                    handleCreate={handleCreate}
                />
            )}
        </div>
    );
}