/**
 * ============================================================
 * QUẢN LÝ CÔNG VIỆC – PHÒNG PHÁT TRIỂN GIẢI PHÁP KHDN
 * VietinBank – Google Apps Script Backend
 * ============================================================
 * CÁCH DEPLOY:
 * 1. Mở Google Sheet → Extensions → Apps Script
 * 2. Dán toàn bộ code này vào editor
 * 3. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy URL và dán vào trang web (tab Cài Đặt)
 * ============================================================
 */

// ── CẤU HÌNH ────────────────────────────────────────────────
const SHEET_ID    = '1FkrRG2HPAXnxMgMI_hx7SHiWXXK2rqaBim5uc6NRY_c';
const SHEET_NAME  = 'CongViec';   // Tên sheet tab (sẽ tự tạo nếu chưa có)
const NOTIFY_EMAIL = 'nguyenvietdung.bc@gmail.com';

// Thứ tự cột trong sheet (bắt đầu từ 1)
const COLUMNS = [
  'ma_cong_viec',       // A – Mã công việc
  'ten_cong_viec',      // B – Tên công việc
  'loai_cong_viec',     // C – Loại công việc
  'nhom_san_pham',      // D – Nhóm sản phẩm
  'nguoi_phu_trach',    // E – Người phụ trách
  'uu_tien',            // F – Ưu tiên
  'trang_thai',         // G – Trạng thái
  'phan_khuc_khach_hang', // H – Phân khúc KH
  'deadline',           // I – Deadline
  'ngay_bat_dau',       // J – Ngày bắt đầu
  'nguoi_phoi_hop',     // K – Người phối hợp
  'nguoi_phe_duyet',    // L – Người phê duyệt
  'tien_do',            // M – Tiến độ %
  'phong_ban_phoi_hop', // N – Phòng ban phối hợp
  'khoi_luong',         // O – Khối lượng
  'mo_ta',              // P – Mô tả
  'ket_qua_du_kien',    // Q – Kết quả dự kiến
  'rui_ro',             // R – Rủi ro
  'nguon_luc',          // S – Nguồn lực
  'link_tai_lieu',      // T – Link tài liệu
  'ghi_chu',            // U – Ghi chú
  'ngay_tao',           // V – Ngày tạo
  'ngay_cap_nhat',      // W – Ngày cập nhật
  'gio_tao',            // X – Giờ tạo
];

// ── HEADER ROW ───────────────────────────────────────────────
const HEADERS = [
  'Mã Công Việc', 'Tên Công Việc', 'Loại Công Việc', 'Nhóm Sản Phẩm',
  'Người Phụ Trách', 'Ưu Tiên', 'Trạng Thái', 'Phân Khúc Khách Hàng',
  'Deadline', 'Ngày Bắt Đầu', 'Người Phối Hợp', 'Người Phê Duyệt',
  'Tiến Độ (%)', 'Phòng Ban Phối Hợp', 'Khối Lượng', 'Mô Tả',
  'Kết Quả Dự Kiến', 'Rủi Ro / Vướng Mắc', 'Nguồn Lực', 'Link Tài Liệu',
  'Ghi Chú', 'Ngày Tạo', 'Ngày Cập Nhật', 'Giờ Tạo'
];

// ── GET: Lấy danh sách công việc ─────────────────────────────
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  // Ping để kiểm tra kết nối
  if (action === 'ping') {
    return jsonResponse({ status: 'ok', message: 'Apps Script đang hoạt động!' });
  }

  // Lấy danh sách
  if (action === 'list') {
    try {
      const sheet = getOrCreateSheet();
      const data  = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        return jsonResponse({ status: 'ok', rows: [] });
      }
      // Bỏ header row, trả về tất cả hàng dữ liệu
      const rows = data.slice(1).map(row => row.map(cell => cell.toString()));
      return jsonResponse({ status: 'ok', rows });
    } catch (err) {
      return jsonResponse({ status: 'error', message: err.message });
    }
  }

  return jsonResponse({ status: 'ok', message: 'VietinBank Task Manager API' });
}

// ── POST: Tạo công việc mới ───────────────────────────────────
function doPost(e) {
  try {
    let data = {};

    // Cách 1: JSON trong postData.contents (fetch no-cors + text/plain)
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        // Cách 2: URL-encoded fallback
        e.postData.contents.split('&').forEach(function(p) {
          var kv = p.split('=');
          if (kv[0]) data[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
        });
      }
    }

    // Cách 3: URL parameters fallback
    if (Object.keys(data).length === 0 && e.parameter) {
      data = e.parameter;
    }

    if (!data.ten_cong_viec) {
      return jsonResponse({ status: 'error', message: 'Thiếu tên công việc' });
    }

    // Tự sinh mã nếu chưa có
    if (!data.ma_cong_viec) {
      var now = new Date();
      data.ma_cong_viec = 'CV-' +
        String(now.getFullYear()).slice(-2) +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(Math.floor(Math.random() * 900) + 100);
    }

    var sheet   = getOrCreateSheet();
    var row     = COLUMNS.map(function(col) { return data[col] || ''; });
    sheet.appendRow(row);

    var lastRow = sheet.getLastRow();
    formatLastRow(sheet, lastRow);

    var emailTo = data.notify_email || NOTIFY_EMAIL;
    sendNotificationEmail(data, emailTo);

    Logger.log('Task created: ' + data.ma_cong_viec + ' | ' + data.nguoi_phu_trach);
    return jsonResponse({ status: 'ok', result: 'success', id: data.ma_cong_viec });

  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ── Helper: Lấy/Tạo sheet ────────────────────────────────────
function getOrCreateSheet() {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Tạo header
    sheet.appendRow(HEADERS);

    // Định dạng header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#C8102E');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    sheet.setRowHeight(1, 36);

    // Freeze header
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(2);

    // Set column widths
    const widths = [110,260,160,160,180,90,130,170,95,100,180,140,80,170,120,300,220,180,180,180,200,100,110,80];
    widths.forEach((w, i) => sheet.setColumnWidth(i+1, w));
  }

  return sheet;
}

// ── Helper: Định dạng hàng mới ────────────────────────────────
function formatLastRow(sheet, rowNum) {
  const numCols = COLUMNS.length;
  const range   = sheet.getRange(rowNum, 1, 1, numCols);

  // Alternating row color
  const bgColor = rowNum % 2 === 0 ? '#FFF8F8' : '#FFFFFF';
  range.setBackground(bgColor);
  range.setVerticalAlignment('middle');
  sheet.setRowHeight(rowNum, 30);

  // Border
  range.setBorder(false, false, true, false, false, false, '#EEE', SpreadsheetApp.BorderStyle.SOLID);

  // Mã công việc – bold navy
  sheet.getRange(rowNum, 1).setFontWeight('bold').setFontColor('#1A2E5A');
  // Tên công việc – bold
  sheet.getRange(rowNum, 2).setFontWeight('bold');

  // Tô màu ưu tiên (cột F = 6)
  const priorityCell = sheet.getRange(rowNum, 6);
  const priorityVal  = priorityCell.getValue();
  const priorityColors = {
    'Khẩn cấp': '#C8102E',
    'Cao':      '#E8700A',
    'Trung bình':'#E6A817',
    'Thấp':     '#1A7F5A',
  };
  if (priorityColors[priorityVal]) {
    priorityCell.setFontColor(priorityColors[priorityVal]).setFontWeight('bold');
  }

  // Tô màu trạng thái (cột G = 7)
  const statusCell = sheet.getRange(rowNum, 7);
  const statusVal  = statusCell.getValue();
  const statusColors = {
    'Chưa bắt đầu': '#7A8499',
    'Đang thực hiện':'#1A2E5A',
    'Chờ phê duyệt': '#A07010',
    'Tạm dừng':      '#E8700A',
    'Hoàn thành':    '#1A7F5A',
    'Hủy bỏ':        '#C8102E',
  };
  if (statusColors[statusVal]) {
    statusCell.setFontColor(statusColors[statusVal]).setFontWeight('bold');
  }
}

// ── Helper: Gửi email thông báo ───────────────────────────────
function sendNotificationEmail(data, emailTo) {
  const subject = `[VietinBank PM] ✅ Công việc mới: ${data.ten_cong_viec || '(Không có tên)'}`;

  const priorityEmoji = {
    'Khẩn cấp': '🔴', 'Cao': '🟠', 'Trung bình': '🟡', 'Thấp': '🟢'
  }[data.uu_tien] || '⚪';

  const htmlBody = `
<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin:0; padding:20px; }
  .wrap { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px;
    overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.1); }
  .hdr { background: linear-gradient(135deg, #1A2E5A, #C8102E);
    padding: 28px 32px; color: #fff; }
  .hdr .bank { font-size: 13px; color: rgba(255,255,255,.7); margin-bottom: 4px; }
  .hdr h1 { font-size: 20px; margin: 0; }
  .hdr .id { margin-top: 8px; font-size: 12px; background: rgba(255,255,255,.15);
    display: inline-block; padding: 3px 12px; border-radius: 20px; }
  .body { padding: 28px 32px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: #C8102E; margin-bottom: 10px;
    border-bottom: 2px solid #f0f0f0; padding-bottom: 6px; }
  .row { display: flex; margin-bottom: 8px; }
  .lbl { min-width: 160px; font-size: 12.5px; color: #666; font-weight: 500; }
  .val { font-size: 12.5px; color: #222; font-weight: 600; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700; }
  .b-red    { background: #F9E5E8; color: #C8102E; }
  .b-green  { background: #E6F5EE; color: #1A7F5A; }
  .b-navy   { background: #EAF0FB; color: #1A2E5A; }
  .b-gold   { background: #FEF7E0; color: #A07010; }
  .desc { background: #f9f9f9; border-left: 4px solid #C8102E;
    padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px;
    color: #444; line-height: 1.6; }
  .footer { background: #f9f9f9; padding: 16px 32px; font-size: 11.5px;
    color: #999; border-top: 1px solid #eee; }
  .btn { display: inline-block; padding: 10px 24px; background: #C8102E;
    color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700;
    font-size: 13px; margin-top: 12px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="bank">VietinBank – Phòng Phát Triển Giải Pháp KHDN</div>
    <h1>📋 Công Việc Mới Được Tạo</h1>
    <div class="id">Mã: ${data.ma_cong_viec || 'N/A'}</div>
  </div>
  <div class="body">
    <div class="section">
      <div class="section-title">Thông Tin Công Việc</div>
      <div class="row"><div class="lbl">Tên công việc</div><div class="val">${data.ten_cong_viec || ''}</div></div>
      <div class="row"><div class="lbl">Loại</div><div class="val"><span class="badge b-navy">${data.loai_cong_viec || ''}</span></div></div>
      <div class="row"><div class="lbl">Nhóm sản phẩm</div><div class="val">${data.nhom_san_pham || ''}</div></div>
      <div class="row"><div class="lbl">Phân khúc KH</div><div class="val">${data.phan_khuc_khach_hang || ''}</div></div>
    </div>
    <div class="section">
      <div class="section-title">Phân Công & Thời Gian</div>
      <div class="row"><div class="lbl">Người phụ trách</div><div class="val">👤 ${data.nguoi_phu_trach || ''}</div></div>
      <div class="row"><div class="lbl">Người phối hợp</div><div class="val">${data.nguoi_phoi_hop || '–'}</div></div>
      <div class="row"><div class="lbl">Ngày bắt đầu</div><div class="val">📅 ${data.ngay_bat_dau || ''}</div></div>
      <div class="row"><div class="lbl">Deadline</div><div class="val">⏰ <strong style="color:#C8102E">${data.deadline || ''}</strong></div></div>
      <div class="row"><div class="lbl">Ưu tiên</div><div class="val">${priorityEmoji} <strong>${data.uu_tien || ''}</strong></div></div>
      <div class="row"><div class="lbl">Trạng thái</div><div class="val"><span class="badge b-green">${data.trang_thai || ''}</span></div></div>
    </div>
    ${data.mo_ta ? `
    <div class="section">
      <div class="section-title">Mô Tả Công Việc</div>
      <div class="desc">${data.mo_ta.replace(/\n/g, '<br>')}</div>
    </div>` : ''}
    ${data.ket_qua_du_kien ? `
    <div class="section">
      <div class="section-title">Kết Quả Dự Kiến</div>
      <div class="desc">${data.ket_qua_du_kien.replace(/\n/g, '<br>')}</div>
    </div>` : ''}
    <a class="btn" href="https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit">
      📊 Xem Google Sheet
    </a>
  </div>
  <div class="footer">
    Email tự động từ Hệ thống Quản lý Công việc VietinBank &bull; ${new Date().toLocaleString('vi-VN')}
    <br>Phòng Phát Triển Giải Pháp Khách Hàng Doanh Nghiệp
  </div>
</div>
</body>
</html>`;

  const plainText = `
[VietinBank PM] Công việc mới: ${data.ten_cong_viec}
Mã: ${data.ma_cong_viec}
Người phụ trách: ${data.nguoi_phu_trach}
Deadline: ${data.deadline}
Ưu tiên: ${data.uu_tien}
Trạng thái: ${data.trang_thai}
Mô tả: ${data.mo_ta}

Xem Google Sheet: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit
  `.trim();

  GmailApp.sendEmail(emailTo, subject, plainText, { htmlBody });
  Logger.log('Email sent to: ' + emailTo);
}

// ── Helper: JSON Response ─────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── TEST: Chạy thủ công để kiểm tra ─────────────────────────
function testScript() {
  const fakeData = {
    ma_cong_viec:        'CV-2605-001',
    ten_cong_viec:       'Test: Phát triển sản phẩm vay SME',
    loai_cong_viec:      'Phát triển sản phẩm mới',
    nhom_san_pham:       'Tín dụng doanh nghiệp',
    nguoi_phu_trach:     'Nguyễn Việt Dũng (Trưởng phòng)',
    uu_tien:             'Cao',
    trang_thai:          'Đang thực hiện',
    phan_khuc_khach_hang:'DN vừa và nhỏ – SME',
    deadline:            '2026-06-30',
    ngay_bat_dau:        '2026-05-17',
    tien_do:             '10',
    mo_ta:               'Test script tự động từ Google Apps Script',
    ket_qua_du_kien:     'Đề án sản phẩm vay SME không TSĐB',
    ngay_tao:            '17/05/2026',
    ngay_cap_nhat:       '17/05/2026',
    gio_tao:             '08:00:00',
    notify_email:        NOTIFY_EMAIL,
  };
  const sheet = getOrCreateSheet();
  const row = COLUMNS.map(col => fakeData[col] || '');
  sheet.appendRow(row);
  formatLastRow(sheet, sheet.getLastRow());
  sendNotificationEmail(fakeData, NOTIFY_EMAIL);
  Logger.log('Test completed!');
}
