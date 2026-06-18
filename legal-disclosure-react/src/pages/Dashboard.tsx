/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Loader2, Upload } from "lucide-react";
import { personService } from "../services/people";
import React from "react";
import { legalService } from "../services/legal";
import FilesManage from "../components/FilesManage";
import { useNavigate } from "react-router-dom";
import type { IFile } from "../ts/IFile";

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
  {
    label: "Thời điểm bắt đầu",
    key: "Thời điểm bắt đầu là người có liên quan của công ty/ người nội bộ",
  },
  {
    label: "Thời điểm kết thúc",
    key: "Thời điểm không còn là người có liên quan của công ty/ người nội bộ",
  },
  {
    label: "Lý do thay đổi",
    key: "Lý do (khi phát sinh thay đổi liên quan đến mục 13 và mục 14)",
  },
  {
    label: "Ghi chú",
    key: "Ghi chú (về việc không có số giấy NSH và các ghi chú khác)",
  },
  { label: "Related NSH", key: "Số giấy NSH của người nội bộ có liên quan" },
];

export default function Dashboard() {
  const [filesAll, setFilesAll] = useState<IFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [message, setMessage] = useState("");
  const [excelData, setExcelData] = useState<any[]>([]);
  const [dbPeople, setDbPeople] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFilesChange = (newFiles: IFile[]) => {
    setFilesAll(newFiles);
  };

  useEffect(() => {
    const loadAllPeople = async () => {
      try {
        const data = await legalService.getAllLegalInfo();
        setDbPeople(data || []);
      } catch (err) {
        console.error("Lỗi tải danh sách người dùng", err);
      }
    };
    loadAllPeople();
  }, []);

  const groupedData = useMemo(() => {
    if (!Array.isArray(dbPeople)) return [];

    const nnbList = dbPeople.filter(
      (p) =>
        p.typePerson === "NNB" ||
        p.typePerson === "TC" ||
        !p.related_nsh ||
        p.related_nsh.length === 0,
    );

    return nnbList.map((nnb) => {
      const nnbTargetNum = nnb.so_giay_nsh?.trim();

      const related = dbPeople.filter((p) => {
        if (!Array.isArray(p.related_nsh)) return false;
        return p.related_nsh.some(
          (r: any) => r.number_nsh?.trim() === nnbTargetNum,
        );
      });

      return {
        ...nnb,
        related,
      };
    });
  }, [dbPeople]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setMessage("");
    setExcelData([]);
    setIsReadingFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        let allData: any[] = [];
        const dataSheets = workbook.SheetNames.slice(2);

        dataSheets.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet);
          allData = [...allData, ...rows];
        });

        setExcelData(allData);
        setMessage(
          `Đã đọc ${allData.length} dòng từ ${dataSheets.length} sheet dữ liệu (đã bỏ qua 2 sheet đầu).`,
        );
      } catch (err) {
        setMessage("Có lỗi xảy ra trong quá trình đọc file cấu trúc Excel.");
      } finally {
        setIsReadingFile(false);
      }
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
      setMessage("Import dữ liệu thành công!");
      setShowConfirm(false);
    } catch (error: any) {
      setMessage("Import thất bại, vui lòng kiểm tra lại cấu trúc file.");
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

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 font-medium">
            Người nội bộ / Tổ chức gốc
          </p>
          <h3 className="text-3xl font-bold mt-1 text-[#2e2c7d]">
            {groupedData.length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 font-medium">
            Người có liên quan tổng số
          </p>
          <h3 className="text-3xl font-bold mt-1 text-amber-600">
            {dbPeople.length - groupedData.length}
          </h3>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <p className="text-slate-500 font-medium">Biểu mẫu nghĩa vụ</p>
          <h3 className="text-3xl font-bold mt-1 text-green-600">
            {filesAll.length}
          </h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden mb-8 border border-slate-200">
        <div className="bg-[#2e2c7d] text-white px-6 py-4 font-bold tracking-wide">
          DANH SÁCH ĐỐI TƯỢNG PHÂN CẤP QUẢN LÝ
        </div>
        <div className="p-6">
          <div className="overflow-auto max-h-125 border rounded-xl">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-slate-100 sticky top-0 border-b z-10">
                <tr>
                  <th className="p-3 text-left font-semibold text-slate-700">
                    Họ và tên đối tượng
                  </th>
                  <th className="p-3 text-left font-semibold text-slate-700">
                    Phân loại / Mối quan hệ
                  </th>
                  <th className="p-3 text-left font-semibold text-slate-700">
                    Số giấy tờ NSH
                  </th>
                </tr>
              </thead>
              <tbody>
                {groupedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center p-8 text-slate-400 italic"
                    >
                      Chưa có dữ liệu trong hệ thống. Vui lòng thực hiện Import
                      file Excel phía dưới.
                    </td>
                  </tr>
                ) : (
                  groupedData.map((nnb) => (
                    <React.Fragment key={nnb._id || nnb.so_giay_nsh}>
                      <tr className="bg-indigo-50/70 font-semibold border-b border-slate-200">
                        <td className="p-3 text-[#2e2c7d] font-bold">
                          {nnb.ho_ten}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-xs rounded-md bg-indigo-100 text-indigo-800 font-medium">
                            {nnb.typePerson === "TC"
                              ? "Tổ chức"
                              : "Người nội bộ"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">
                          {nnb.so_giay_nsh}
                        </td>
                      </tr>

                      {nnb.related?.map((nlq: any) => {
                        const specRel = nlq.related_nsh?.find(
                          (r: any) =>
                            r.number_nsh?.trim() === nnb.so_giay_nsh?.trim(),
                        );
                        return (
                          <tr
                            key={nlq._id || nlq.so_giay_nsh}
                            className="border-b border-slate-100 hover:bg-slate-50/80"
                          >
                            <td className="p-3 pl-10 text-slate-600 flex items-center">
                              <span className="text-slate-400 mr-2 select-none">
                                ↳
                              </span>
                              <span className="font-medium text-slate-800">
                                {nlq.ho_ten}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 italic text-xs">
                              {specRel?.mqh_nsh ||
                                "Người có liên quan"}
                            </td>
                            <td className="p-3 text-slate-500">
                              {nlq.so_giay_nsh}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden border border-slate-200 mb-8">
        <div className="bg-[#2e2c7d] text-white px-6 py-4 font-semibold tracking-wide">
          CẬP NHẬT DỮ LIỆU ĐỒNG BỘ HỆ THỐNG
        </div>
        <div className="p-8">
          <label
            htmlFor="excel-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl py-12 cursor-pointer hover:border-[#2e2c7d] hover:bg-slate-50 transition-all duration-200"
          >
            {isReadingFile ? (
              <>
                <Loader2 size={50} className="text-[#2e2c7d] animate-spin" />
                <h3 className="mt-4 font-semibold text-lg text-slate-600">
                  Hệ thống đang phân tích cấu trúc cấu trúc file Excel, vui lòng
                  đợi...
                </h3>
              </>
            ) : (
              <>
                <Upload size={50} className="text-[#2e2c7d]" />
                <h3 className="mt-4 font-semibold text-lg text-slate-700">
                  Kéo thả hoặc Click để chọn file Excel mẫu
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Hỗ trợ định dạng .xlsx, .xls (Hệ thống sẽ tự động bỏ qua 2
                  sheet index đầu tiên)
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              onClick={(e) => {
                e.currentTarget.value = "";
              }}
              className="hidden"
            />
          </label>

          {message && (
            <div
              className={`mt-4 p-4 rounded-xl border ${message.includes("thành công") ? "bg-green-50 border-green-200 text-green-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}
            >
              {message}
            </div>
          )}

          {excelData.length > 0 && (
            <div className="mt-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-slate-600">
                  Bản xem trước dữ liệu cấu trúc tải lên:
                </span>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="bg-[#2e2c7d] text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-indigo-900 transition-all"
                >
                  Xác nhận nạp vào DB ({excelData.length} dòng)
                </button>
              </div>

              <div className="overflow-auto border rounded-xl max-h-125 shadow-sm">
                <table className="min-w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-[#2e2c7d] text-white z-10">
                    <tr>
                      {COLUMNS.map((c) => (
                        <th
                          key={c.key}
                          className="border border-indigo-900/20 p-3 text-left whitespace-nowrap"
                        >
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 border-b border-slate-100"
                      >
                        {COLUMNS.map((c) => (
                          <td
                            key={c.key}
                            className="border border-slate-100 p-2 text-slate-700 whitespace-nowrap max-w-xs truncate"
                          >
                            {row[c.key] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-112.5 shadow-2xl">
            <h2 className="font-bold text-lg text-slate-800">
              Xác nhận ghi đè / Cập nhật dữ liệu
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed text-sm">
              Hệ thống sẽ tiến hành nạp <strong>{excelData.length}</strong> bản
              ghi từ file Excel vào cơ sở dữ liệu. Quá trình này có thể mất vài
              giây. Bạn có chắc chắn muốn tiếp tục?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="bg-[#2e2c7d] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-900 shadow disabled:bg-slate-400 transition"
              >
                {loading ? "Đang ghi dữ liệu..." : "Đồng ý Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FilesManage onFilesChange={handleFilesChange} />

    </div>
  );
}
