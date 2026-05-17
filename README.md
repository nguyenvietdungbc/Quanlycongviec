# 📋 Quản Lý Công Việc – Phòng Phát Triển Giải Pháp KHDN
**VietinBank | Hệ thống quản lý công việc nội bộ**

---

## 🚀 Hướng Dẫn Triển Khai

### Bước 1 – Cài Đặt Google Apps Script

1. Mở Google Sheet: https://docs.google.com/spreadsheets/d/1FkrRG2HPAXnxMgMI_hx7SHiWXXK2rqaBim5uc6NRY_c/edit
2. Vào **Extensions → Apps Script**
3. Xóa code cũ, dán toàn bộ nội dung file `Code.gs` vào
4. Nhấn **Save** (Ctrl+S)
5. Chạy hàm `testScript()` một lần để cấp quyền (sẽ có popup xác nhận)
6. **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Nhấn **Deploy** → Copy URL (dạng `https://script.google.com/macros/s/.../exec`)

### Bước 2 – Cấu Hình Web App

1. Mở `index.html` trên trình duyệt (hoặc sau khi deploy lên GitHub Pages)
2. Vào tab **Cài Đặt**
3. Dán URL Apps Script vào ô "URL Google Apps Script"
4. Nhấn **Lưu Cấu Hình**
5. Nhấn **Kiểm Tra Kết Nối** để xác nhận

### Bước 3 – Deploy lên GitHub Pages

```bash
# Clone hoặc tạo repo mới
git init
git add .
git commit -m "feat: VietinBank task manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Sau đó vào **Settings → Pages → Source: Deploy from branch (main)**

URL sẽ là: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

---

## 📁 Cấu Trúc File

```
├── index.html      # Landing page chính (toàn bộ frontend)
├── Code.gs         # Google Apps Script backend
└── README.md       # Hướng dẫn này
```

---

## ✨ Tính Năng

| Tính năng | Mô tả |
|-----------|-------|
| 📝 Tạo công việc | Form nhập liệu đầy đủ với 20+ trường dữ liệu |
| ☁️ Lưu Google Sheet | Tự động tạo bản ghi mới trong sheet |
| 📧 Email thông báo | Gửi email HTML đẹp tới `nguyenvietdung.bc@gmail.com` |
| 📊 Dashboard | KPI stats + biểu đồ theo loại công việc & người phụ trách |
| 🔍 Tìm kiếm & lọc | Lọc theo trạng thái, ưu tiên, tên công việc |
| 📱 Responsive | Hoạt động tốt trên mobile |

---

## 📊 Các Trường Dữ Liệu

| Trường | Ý nghĩa |
|--------|---------|
| Mã công việc | Tự động sinh (VD: CV-2605-123) |
| Tên công việc | Tên mô tả công việc |
| Loại công việc | Phát triển SP / Nghiên cứu / Quy trình... |
| Nhóm sản phẩm | Tín dụng / Trade Finance / CMS... |
| Phân khúc KH | SME / Corporate / FDI... |
| Người phụ trách | 1 trong 20 nhân viên phòng |
| Người phối hợp | Nhiều người, cách nhau bằng dấu phẩy |
| Ưu tiên | Khẩn cấp / Cao / Trung bình / Thấp |
| Trạng thái | 6 trạng thái từ Chưa bắt đầu → Hoàn thành |
| Tiến độ % | Slider 0-100% |
| Deadline | Ngày hết hạn |
| Mô tả | Nội dung chi tiết |
| Kết quả dự kiến | Deliverables |
| Rủi ro | Vướng mắc dự kiến |

---

## 👥 Cập Nhật Danh Sách Nhân Viên

Mở `index.html`, tìm `id="f-owner"` và chỉnh sửa các thẻ `<option>`:

```html
<select id="f-owner" name="nguoi_phu_trach" required>
  <option value="">-- Chọn nhân viên --</option>
  <option>Nguyễn Văn A (Chức vụ)</option>
  <!-- Thêm/sửa nhân viên tại đây -->
</select>
```

---

## ⚠️ Lưu Ý

- Sau khi chỉnh sửa `Code.gs`, cần **deploy lại** (New Deployment) và cập nhật URL mới
- Sheet tab tên `CongViec` sẽ được tự động tạo lần đầu
- Cấu hình URL Apps Script được lưu trong `localStorage` của trình duyệt
- Nếu deploy trên GitHub Pages, mỗi user cần tự nhập URL Apps Script một lần

---

*VietinBank – Phòng Phát Triển Giải Pháp Khách Hàng Doanh Nghiệp*
