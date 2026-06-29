var express = require('express');
var HhvStock = require('../models/HhvStock');
var { runHhvCrawler } = require('../cron/hhvScheduler');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    success: true,
    message: 'Legal Tool API Running',
  });
});

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
