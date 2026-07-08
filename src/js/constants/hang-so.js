export const KHOA_LUU_TRU = Object.freeze({

    BENH_NHAN: "phong-kham-mini.benh-nhan",

    DON_THUOC: "phong-kham-mini.don-thuoc",

    PHIEN_BAN_DU_LIEU: "phong-kham-mini.phien-ban-du-lieu"

});

/**
 * Trạng thái của bệnh nhân.
 */
export const TRANG_THAI_BENH_NHAN = Object.freeze({

    CHO_KHAM: "cho_kham",

    DANG_KHAM: "dang_kham",

    DA_KHAM: "da_kham"

});

/**
 * Trạng thái của đơn thuốc.
 */
export const TRANG_THAI_DON_THUOC = Object.freeze({

    NHAP: "nhap",

    DA_HOAN_TAT: "da_hoan_tat",

    DA_HUY: "da_huy"

});

/**
 * Phiên bản dữ liệu hiện tại.
 */
export const PHIEN_BAN_DU_LIEU = "1.0.0";

/**
 * Định dạng mã.
 */
export const DINH_DANG_MA = Object.freeze({

    TIEN_TO_BENH_NHAN: "BN",

    TIEN_TO_DON_THUOC: "DT",

    DO_DAI_SO_NGAU_NHIEN: 4

});

/**
 * Giới tính hỗ trợ trong hệ thống.
 */
export const GIOI_TINH = Object.freeze({

    NAM: "Nam",

    NU: "Nữ",

    KHAC: "Khác"

});

/**
 * Giá trị mặc định khi khởi tạo bệnh nhân.
 */
export const BENH_NHAN_MAC_DINH = Object.freeze({

    trangThai: TRANG_THAI_BENH_NHAN.CHO_KHAM

});

/**
 * Giá trị mặc định khi khởi tạo đơn thuốc.
 */
export const DON_THUOC_MAC_DINH = Object.freeze({

    trangThai: TRANG_THAI_DON_THUOC.NHAP,

    danhSachThuoc: []

});

/**
 * Giới hạn sử dụng trong kiểm tra dữ liệu.
 */
export const GIOI_HAN = Object.freeze({

    HO_TEN_TOI_DA: 100,

    DIA_CHI_TOI_DA: 255,

    TRIEU_CHUNG_TOI_DA: 500,

    TIEN_SU_BENH_TOI_DA: 500,

    DI_UNG_THUOC_TOI_DA: 500,

    TEN_BAC_SI_TOI_DA: 100,

    CHUAN_DOAN_TOI_DA: 500,

    LOI_DAN_TOI_DA: 1000,

    TEN_THUOC_TOI_DA: 150

});

/**
 * Biểu thức chính quy.
 */
export const BIEU_THUC = Object.freeze({

    SO_DIEN_THOAI_VIET_NAM: /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/,

    CHI_SO: /^[0-9]+$/,

    KHOANG_TRANG: /\s+/g

});
