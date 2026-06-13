export interface IPerson {
    _id: string;
    ma_chung_khoan: string;
    ho_ten: string;
    tk_giao_dich?: string;
    chuc_vu?: string;
    related_nsh?: string[];
    moi_quan_he?: string;
    loai_giay_nsh?: string;
    so_giay_nsh: string;
    noi_cap_nsh?: string;
    dia_chi?: string;
    so_co_phieu_cuoi_ky?: number;
    ty_le_so_huu?: number;
    thoi_diem_bat_dau?: string;
    thoi_diem_ket_thuc?: string;
    ly_do_thay_doi?: string;
    ghi_chu?: string;
    createdAt?: string;
    updatedAt?: string;
    related_info?: RelatedInfo[];
    typePerson?: string;
}

interface RelatedInfo {
    _id: string;
    ho_ten: string;
}