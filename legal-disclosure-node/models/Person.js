const mongoose = require("mongoose");

const personSchema = new mongoose.Schema(
    {
        ma_chung_khoan: {
            type: String,
            default: "HHV",
        },

        ho_ten: {
            type: String,
            required: true,
        },

        tk_giao_dich: String,

        chuc_vu: String,

        related_nsh: [String],

        moi_quan_he: String,

        loai_giay_nsh: String,

        so_giay_nsh: {
            type: String,
            required: true,
        },

        ngay_cap_nsh: String,

        noi_cap_nsh: String,

        dia_chi: String,

        so_co_phieu_cuoi_ky: Number,

        ty_le_so_huu: Number,

        thoi_diem_bat_dau: String,

        thoi_diem_ket_thuc: String,

        ly_do_thay_doi: String,

        ghi_chu: String,

    },
    {
        timestamps: true,
    }
);

personSchema.index({
    related_nsh: 1,
});

module.exports = mongoose.model(
    "Person",
    personSchema
);