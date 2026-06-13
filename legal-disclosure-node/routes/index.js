var express = require('express');
var router = express.Router();

/* GET home page - Đổi từ res.render sang res.json */
router.get('/', function (req, res, next) {
  res.json({
    status: "success",
    message: "Legal Tool API is running perfectly!"
  });
});

module.exports = router;