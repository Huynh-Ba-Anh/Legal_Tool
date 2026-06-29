var express = require("express");
const Person = require("../models/Person");
const { protectedRoute } = require("../auth/protectedRoute");
var router = express.Router();

/* GET users listing. */
router.get("/search", async (req, res) => {
  try {
    const { cccd } = req.query;
    if (!cccd)
      return res.status(400).json({ message: "Vui lòng nhập số giấy NSH" });

    const person = await Person.findOne({ so_giay_nsh: cccd.trim() }).lean();

    if (!person) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin của đối tượng này" });
    }

    let typePerson = null;

    if (person.loai_giay_nsh !== "CCCD" && person.loai_giay_nsh !== "CMND") {
      typePerson = "TC";
    } else if (person.chuc_vu === "Không") {
      typePerson = "NLQ";
    } else {
      typePerson = "NNB";
    }

    let relatedPeople = [];

    if (person.related_nsh && person.related_nsh.length > 0) {
      const relatedNumbers = person.related_nsh.map((item) => item.number_nsh);

      relatedPeople = await Person.find({
        so_giay_nsh: { $in: relatedNumbers },
      })
        .select("ho_ten so_giay_nsh")
        .lean();
    }

    res.json({
      ...person,
      typePerson,
      related_info: relatedPeople,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
});

router.get("/all", protectedRoute, async (req, res) => {
  try {
    const allPeople = await Person.find({}).select(
      "ho_ten chuc_vu moi_quan_he so_giay_nsh related_nsh",
    );
    res.json(allPeople);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách" });
  }
});

module.exports = router;
