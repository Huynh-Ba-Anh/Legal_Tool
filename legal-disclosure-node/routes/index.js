var express = require('express');
var cron = require('node-cron'); // Cần cài đặt: npm install node-cron
var HhvStock = require('../models/HhvStock');
var { runHhvCrawler } = require('../cron/hhvScheduler');
var router = express.Router();

/**
 * ==========================================
 * CRON JOB: TỰ ĐỘNG CÀO DATA MỖI 1 PHÚT
 * ==========================================
 * Chạy ngầm định kỳ để lưu trữ dữ liệu mới vào DB.
 * Chuỗi '* * * * *' tương ứng với chu kỳ mỗi phút một lần.
 */
cron.schedule('* * * * *', async () => {
  console.log(`[${new Date().toLocaleTimeString()}] Đang tự động cào dữ liệu HHV ngầm...`);
  try {
    const jsonData = await runHhvCrawler();
    if (jsonData) {
      console.log('=> Cào và cập nhật dữ liệu HHV vào cơ sở dữ liệu thành công.');
    } else {
      console.warn('=> Crawler trả về dữ liệu rỗng.');
    }
  } catch (err) {
    console.error('=> Lỗi khi chạy cron job cào dữ liệu ngầm:', err.message);
  }
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    success: true,
    message: 'Legal Tool API Running',
  });
});

/* API ép buộc cào trực tiếp ngay lập tức */
router.get('/hhv-data', async function (req, res, next) {
  try {
    const jsonData = await runHhvCrawler();

    if (!jsonData) {
      return res.status(500).json({
        success: false,
        message: 'Không thể chạy crawler HHV',
      });
    }

    res.json({
      success: true,
      data: jsonData,
    });
  } catch (err) {
    console.error('Lỗi trong /hhv-data:', err.message);
    next(err);
  }
});

/* API lấy dữ liệu đã được lưu trong bộ nhớ tạm (Cache/DB) - Frontend sẽ gọi cái này */
router.get('/hhv-data-cached', async function (req, res, next) {
  try {
    const data = await HhvStock.find({}).sort({ time: -1 });
    res.json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error('Lỗi trong /hhv-data-cached:', err.message);
    next(err);
  }
});

module.exports = router;