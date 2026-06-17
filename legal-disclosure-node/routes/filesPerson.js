const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const upload = require("../middlewares/upload");
const Person = require("../models/Person");

router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Không có file Excel" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    let allRows = [];

    const dataSheets = workbook.SheetNames.slice(2);

    if (dataSheets.length === 0) {
      return res.status(400).json({
        message: "File Excel không có đủ dữ liệu từ sheet thứ 3 trở đi.",
      });
    }

    dataSheets.forEach((sheetName) => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      allRows = allRows.concat(rows);
    });

    if (allRows.length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để import" });
    }

    // Làm sạch cơ sở dữ liệu trước khi import mới
    if (Person.collection) {
      await Person.collection.deleteMany({});
      console.log("Đã xóa thành công và an toàn");
    } else {
      await Person.deleteMany({});
      console.log("Đã xóa thành công và an toàn _1");
    }

    const operations = allRows.map((row) => {
      const soGiayNsh = String(row["Số giấy NSH"] || "").trim();
      const typePerson = String(
        row["Loại hình Giấy NSH (CCCD, Hộ chiếu, ĐKKD)"] || "",
      )
        .trim()
        .toUpperCase();

      const relatedNshRaw = String(
        row["Số giấy NSH của người nội bộ có liên quan"] || "",
      );
      const mqhNshRaw = String(
        row["Mối quan hệ đối với người nội bộ"] || "",
      ).trim();

      // Tách chuỗi số giấy NSH liên quan thành mảng các chuỗi
      const relatedNshArray = relatedNshRaw
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      // CHUYỂN ĐỔI: Ép cấu trúc mảng chuỗi thành mảng Object phù hợp với Schema [{ number_nsh, mqh_nsh }]
      const related_nsh_objects = relatedNshArray.map((num) => ({
        number_nsh: num,
        mqh_nsh: mqhNshRaw,
      }));

      // Xây dựng object dữ liệu cơ bản sẽ được $set
      const baseUpdate = {
        ma_chung_khoan: row["Mã chứng khoán"] || "HHV",
        ho_ten: row["Họ tên"] || "",
        tk_giao_dich: row["Tài khoản giao dịch chứng khoán (nếu có)"] || "",
        chuc_vu: row["Chức vụ tại công ty"] || "",
        moi_quan_he: mqhNshRaw,
        loai_giay_nsh: typePerson,
        so_giay_nsh: soGiayNsh,
        ngay_cap_nsh: row["Ngày cấp giấy NSH"] || "",
        noi_cap_nsh: row["Nơi cấp"] || "",
        dia_chi: row["Địa chỉ trụ sở chính/Địa chỉ liên hệ"] || "",
        so_co_phieu_cuoi_ky:
          Number(row["Số cổ phiếu sở hữu cuối kỳ (cổ phiếu)"]) || 0,
        ty_le_so_huu: Number(row["Tỷ lệ sở hữu cuối kỳ (%)"]) || 0,
        thoi_diem_bat_dau: row["Thời điểm bắt đầu..."] || "",
        thoi_diem_ket_thuc: row["Thời điểm không còn..."] || "",
        ly_do_thay_doi: row["Lý do"] || "",
        ghi_chu: row["Ghi chú"] || "",
      };

      const isSingle = typePerson === "CCCD" || typePerson === "CMND";

      // SỬA LỖI CÚ PHÁP: Gom toàn bộ lệnh cập nhật vào đúng vị trí nguyên tử tương ứng
      let updateQuery = {};
      if (isSingle) {
        // Nếu là cá nhân, ghi đè trực tiếp mảng (lấy phần tử đầu tiên hoặc toàn bộ mảng object sạch)
        updateQuery = {
          $set: {
            ...baseUpdate,
            related_nsh: related_nsh_objects.slice(0, 1), // Lưu mảng chứa 1 object duy nhất cho đúng cấu trúc []
          },
        };
      } else {
        // Nếu là tổ chức/loại hình khác, dùng $set thông tin gốc và dùng $addToSet chuẩn cho mảng object
        updateQuery = {
          $set: baseUpdate,
          $addToSet: {
            related_nsh: { $each: related_nsh_objects },
          },
        };
      }

      return {
        updateOne: {
          filter: { so_giay_nsh: soGiayNsh },
          update: updateQuery,
          upsert: true,
        },
      };
    });

    const result = await Person.bulkWrite(operations);
    res.status(200).json({
      message: "Import thành công",
      processed: allRows.length,
      inserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Import thất bại", error: error.message });
  }
});

module.exports = router;
