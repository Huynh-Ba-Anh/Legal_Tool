# HHV Insider Compliance Lookup System (Hệ thống Tra cứu Nghĩa vụ CBTT - HHV)

Hệ thống web-app hỗ trợ tra cứu nhanh nghĩa vụ và tải biểu mẫu Công bố thông tin (CBTT) dành cho **Người nội bộ (NNB)** và **Người có liên quan (NCLQ)** của Công ty Cổ phần Đầu tư Hạ tầng Giao thông Đèo Cả (HHV) dựa trên số CCCD.

## 🚀 Tính năng cốt lõi (Core Features)

Hệ thống tự động phân loại người dùng sau khi kiểm tra mã số CCCD:

*   **Trường hợp A (Khách thể thông thường):** Thông báo kết quả không thuộc đối tượng quản lý.
*   **Trường hợp B (Người nội bộ HHV):** Hiển thị thông báo kèm các Tab-Option hành động:
    1.  *Thay đổi thông tin NCLQ:* Hướng dẫn nội dung + Tải mẫu thông báo.
    2.  *Báo cáo giao dịch (Trước/Sau):* Quy trình thực hiện + Tải mẫu báo cáo.
    3.  *Nghĩa vụ khác:* Các quy định pháp lý liên quan.
*   **Trường hợp C (Người có liên quan của NNB):** Hiển thị thông báo kèm các Tab-Option hành động:
    1.  *Báo cáo giao dịch (Trước/Sau):* Quy trình thực hiện + Tải mẫu báo cáo.
    2.  *Nghĩa vụ khác:* Các quy định pháp lý liên quan.

---

## 🔄 Giải pháp Cập nhật Dữ liệu Thường xuyên (Data Synchronization)

Vì danh sách Người nội bộ và Người có liên quan biến động liên tục, dự án áp dụng kiến trúc tách biệt dữ liệu (Data-Driven Architecture):

*   **Data Format:** Toàn bộ danh sách được chuẩn hóa dưới dạng tệp `insiders_database.json` (hoặc kết nối qua API bảo mật).
*   **Cơ chế cập nhật:**
    *   *Option 1 (Cơ bản):* Quản trị viên cập nhật file JSON trực tiếp thông qua một nhánh bảo mật (Private Branch) hoặc CMS mini.
    *   *Option 2 (Nâng cao):* Sử dụng **GitHub Actions** để tự động đồng bộ dữ liệu từ file Excel/Google Sheets của phòng Pháp chế/Nhân sự vào hệ thống theo lịch định kỳ (Cronjob hàng ngày).

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

*   **Frontend:** HTML5, CSS3, JavaScript (hoặc React/Vue để xử lý các Tab-Option mượt mà).
*   **Backend:** Node.js (Express) để xử lý logic tra cứu bảo mật.
*   **Database:** JSON Local File (cho dự án nhỏ gọn) hoặc MongoDB/PostgreSQL.
