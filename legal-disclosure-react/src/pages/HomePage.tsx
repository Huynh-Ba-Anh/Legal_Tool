/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  User,
  BadgeInfo,
  AlertTriangle,
  FileText,
  Send,
  Download,
} from "lucide-react";
import type { IPerson } from "../ts/IPerson";
import { legalService } from "../services/legal";
import type { IFile } from "../ts/IFile";
import { fileService } from "../services/file";
import supportService from "../services/support";
import { HhvStock } from "../components/Hhv_stock";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [person, setPerson] = useState<IPerson | null>(null);
  const [file, setFile] = useState<IFile[]>([]);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);

  const [feedback, setFeedback] = useState("");
  const [phone, setPhone] = useState("");
  const [sendingSupport, setSendingSupport] = useState(false);

  const searchSectionRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (person && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [person]);

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      setSelectedFile(null);

      const data = await legalService.searchPerson(trimmedQuery);

      if (!data || Object.keys(data).length === 0) {
        setError("Không tìm thấy thông tin cho số giấy tờ này");
        return;
      }

      setPerson(data);
      if (data.typePerson) {
        const fileData = await fileService.getObligations(data.typePerson);
        setFile(fileData);
        if (fileData && fileData.length > 0) {
          setSelectedFile(fileData[0]);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đã có lỗi xảy ra khi tra cứu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại!");
      return;
    }

    try {
      setSendingSupport(true);

      await supportService.create({
        phone: phone.trim(),
        message: feedback.trim(),
        cccd: person?.so_giay_nsh || searchQuery.trim(),
        personName: person?.ho_ten || "",
        typePerson: person?.typePerson as "NNB" | "NLQ" | undefined,
        currentObligation: selectedFile?.title || "",
      });

      alert("Hệ thống đã ghi nhận yêu cầu hỗ trợ của bạn. Chúng tôi sẽ liên hệ lại sớm nhất có thể.");

      setPhone("");
      setFeedback("");
    } catch (error: any) {
      console.error("Lỗi gửi hỗ trợ:", error);

      alert(
        error?.response?.data?.message ||
        "Gửi yêu cầu hỗ trợ thất bại. Vui lòng thử lại sau!"
      );
    } finally {
      setSendingSupport(false);
    }
  };

  const renderRelationship = () => {
    if (!person) return null;
    const type = person.typePerson?.trim();

    switch (type) {
      case "TC":
        return person.related_info && person.related_info.length > 0 ? (
          <div className="space-y-1.5 text-sm text-slate-700">
            <div className="font-medium text-slate-700">
              Mối quan hệ pháp lý: Người có liên quan của Người nội bộ:
            </div>

            <div className="space-y-1 pl-3">
              {person.related_info.map((i) => {
                const relation = person.related_nsh?.find((r) => r.number_nsh === i.so_giay_nsh);
                return (
                  <div key={i._id || i.ho_ten} className="leading-relaxed">
                    • <strong>{i.ho_ten}</strong>
                    {relation?.mqh_nsh && (
                      <span className="text-slate-500 text-xs italic ml-1">
                        ({relation.mqh_nsh.replace(/Người nội bộ/i, "").trim()})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <span className="text-sm text-slate-400 italic">Tổ chức chưa cập nhật người nội bộ liên quan.</span>
        );
      case "NNB":
        return <div className="text-sm text-slate-700">Chức vụ hiện tại: <strong className="text-indigo-950">{person.chuc_vu || "Chưa rõ"}</strong></div>;
      case "NLQ":
        return person.related_info && person.related_info.length > 0 ? (
          <div className="space-y-1.5 text-sm text-slate-700">
            {person.related_info.map((nnb) => {
              const relation = person.related_nsh?.find((r: any) => r.number_nsh === nnb.so_giay_nsh);
              return (
                <div key={nnb._id || nnb.so_giay_nsh}>
                  Là <strong className="text-amber-700">{relation?.mqh_nsh || "Người liên quan"}</strong> của Người nội bộ: <strong>{nnb.ho_ten}</strong>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-sm text-slate-400 italic">Chưa có thông tin NNB liên quan</span>
        );
      default:
        return <span className="text-sm text-slate-500">{Array.isArray(person.related_nsh) ? person.related_nsh.map((r: any) => r.mqh_nsh).join(", ") : "Không xác định"}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200 flex flex-col font-sans">
      <div className="relative">
        <div
          className="relative min-h-130 h-screen flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: "url('/image copy.png')" }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-[#0f172a]/75 via-[#1e1b4b]/55 to-[#312e81]/60" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 text-xs sm:text-sm font-semibold backdrop-blur-xs">
              Hệ thống tra cứu trực tuyến
            </span>
            <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              CÔNG TY CỔ PHẦN<br />ĐẦU TƯ HẠ TẦNG GIAO THÔNG ĐÈO CẢ
            </h1>
            <p className="mt-5 text-sm sm:text-base text-white max-w-3xl mx-auto font-medium drop-shadow-xs">
              Phần mềm tra cứu nghĩa vụ công bố thông tin của Người nội bộ và Người có liên quan của người nội bộ
            </p>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
            <button
              onClick={scrollToSearch}
              className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/40 bg-white/10 backdrop-blur-xs text-white hover:bg-white/25 active:scale-90 transition-all duration-200 cursor-pointer shadow-lg animate-bounce"
              title="Cuộn xuống nội dung tra cứu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>

        <div ref={searchSectionRef} className="relative z-10 max-w-6xl mx-auto px-4 py-12 scroll-mt-6">
          <div className="flex items-center justify-center">
            <div className="w-full grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-5 items-center">

              <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 max-w-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <div className="text-center mb-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-500/70">Tra cứu nhanh</p>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-1 tracking-tight">Nhập thông tin tra cứu</h2>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="relative group">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-indigo-500" />
                    <input
                      type="text"
                      placeholder="CCCD / Mã số thuế..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50/80 border border-slate-200/80 placeholder:text-slate-400/90 text-sm font-medium text-slate-700 outline-none transition-all duration-200 hover:bg-slate-100/50 hover:border-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                  <button type="submit" disabled={loading} className="h-11 rounded-xl bg-linear-to-r from-[#2e2c7d] to-[#4338ca] text-white text-sm font-bold tracking-wide hover:opacity-95 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-indigo-900/10">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang tìm...
                      </span>
                    ) : "TRA CỨU"}
                  </button>
                </div>
              </form>

              <div className="w-full">
                <HhvStock />
              </div>

            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto w-full px-4 lg:px-6 mt-6">
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-sm shadow-sm">
            <AlertTriangle size={20} /> {error}
          </div>
        </div>
      )}

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 mt-4">
        {person ? (
          <div ref={resultRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch animate-in fade-in duration-300">

            <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between overflow-hidden">
              <div>
                <div className="bg-linear-to-r from-[#2e2c7d] to-[#4338ca] px-5 py-4 flex justify-between items-center">
                  <h2 className="font-bold text-white text-sm tracking-wide uppercase">Thông tin cá nhân, tổ chức</h2>
                  <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                    {person.typePerson === "TC" ? "Tổ chức" : person.typePerson === "NNB" ? "Người nội bộ" : "Người liên quan"}
                  </span>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">Họ và tên:</label>
                    <p className="font-bold text-slate-900 text-lg">{person.ho_ten}</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider">NSH (Số giấy tờ):</label>
                    <p className="font-semibold text-slate-700 text-sm">{person.so_giay_nsh}</p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block uppercase font-bold tracking-wider mb-2">Mối quan hệ pháp lý:</label>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-inner">
                      {renderRelationship()}
                    </div>
                  </div>

                  {(person.ma_chung_khoan || person.tk_giao_dich) && (
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Mã CK</span>
                        <span className="text-sm font-bold text-[#2e2c7d]">{person.ma_chung_khoan || "-"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Tài khoản GD</span>
                        <span className="text-sm font-bold text-[#2e2c7d]">{person.tk_giao_dich || "-"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmitSupport} className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-3 rounded-b-3xl">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ý kiến / Lời nhắn để lại</h3>
                <textarea
                  rows={2}
                  placeholder="Ghi nội dung lời nhắn tại đây..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2e2c7d] focus:border-transparent outline-none bg-white shadow-xs resize-none text-slate-800"
                  required
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Số điện thoại..."
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 11) setPhone(value);
                    }}
                    className="flex-1 text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2e2c7d] focus:border-transparent outline-none bg-white shadow-xs text-slate-800"
                    required
                  />
                  <button
                    type="submit"
                    disabled={sendingSupport}
                    className="bg-linear-to-r from-[#2e2c7d] to-[#4338ca] text-white px-5 py-2 rounded-xl text-xs font-bold hover:opacity-95 transition-all duration-300 shadow-sm flex items-center gap-1.5 shrink-0 disabled:bg-slate-400"
                  >
                    <Send size={12} /> {sendingSupport ? "..." : "GỬI"}
                  </button>
                </div>
              </form>
            </section>

            <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col overflow-hidden">
              <div className="bg-linear-to-r from-[#2e2c7d] to-[#4338ca] px-5 py-4">
                <h2 className="font-bold text-white text-sm tracking-wide uppercase">Nghĩa vụ CBTT, báo cáo</h2>
              </div>
              <div className="p-5 flex-1 space-y-3 overflow-y-auto max-h-112.5 md:max-h-137.5">
                {file && file.length > 0 ? (
                  file.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => setSelectedFile(item)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border hover:-translate-y-1 hover:shadow-lg text-xs font-semibold block relative pr-8 ${selectedFile?._id === item._id
                        ? "border-[#2e2c7d] bg-linear-to-r from-indigo-50 to-cyan-50 text-[#2e2c7d]"
                        : "border-slate-200 bg-white text-slate-700"
                        }`}
                    >
                      <div className="line-clamp-2 leading-relaxed">{item.title}</div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 text-sm">→</div>
                    </button>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs italic text-center py-8">
                    Không tìm thấy dữ liệu nghĩa vụ phù hợp.
                  </p>
                )}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col overflow-hidden">
              <div className="bg-linear-to-r from-[#2e2c7d] to-[#4338ca] px-5 py-4">
                <h2 className="font-bold text-white text-sm tracking-wide uppercase">NỘI DUNG VÀ BIỂU MẪU ÁP DỤNG</h2>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between h-full">
                {selectedFile ? (
                  <>
                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug shrink-0">
                        {selectedFile.title}
                      </h3>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 leading-relaxed shadow-inner text-sm text-slate-700 overflow-y-auto whitespace-pre-line flex-1 max-h-96">
                        {selectedFile.content}
                      </div>
                    </div>

                    {selectedFile.file && (
                      <div className="pt-3 border-t border-slate-100 mt-4 shrink-0">
                        <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Hồ sơ đính kèm:</div>
                        <a
                          href={`${API_URL}/filesInform/${selectedFile._id}/preview`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-between rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-800 transition-all duration-200 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FileText size={16} className="text-red-500 shrink-0" />
                            <span className="font-bold truncate text-slate-700">{selectedFile.file.originalName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-indigo-700 font-extrabold shrink-0 ml-2">
                            <Download size={13} /> Tải về
                          </div>
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-20 text-slate-400 text-xs italic">
                    Vui lòng chọn danh mục báo cáo bên cột trái để xem mẫu văn bản chi tiết.
                  </div>
                )}
              </div>
            </section>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center pt-4 pb-16 animate-in fade-in duration-500">
            <div className="max-w-xl text-center">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-xl">
                <User size={42} />
              </div>
              <h2 className="mt-8 text-3xl font-bold text-slate-800">
                Tra cứu nghĩa vụ công bố thông tin
              </h2>
              <p className="mt-4 text-slate-500 leading-relaxed">
                Nhập mã định danh cá nhân, hoặc mã số thuế để tra cứu nghĩa vụ công bố thông tin và các biểu mẫu liên quan.
              </p>
              <div className="mt-8 flex items-start gap-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-left text-xs text-slate-600 max-w-md mx-auto">
                <BadgeInfo size={18} className="text-[#2e2c7d] shrink-0 mt-0.5" />
                <span>Cơ sở dữ liệu dựa trên thông tin danh sách Người nội bộ và Người có liên quan của người nội bộ.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}