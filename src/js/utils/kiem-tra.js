import {
    BIEU_THUC,
    GIOI_HAN,
    TRANG_THAI_BENH_NHAN
} from "../constants/hang-so.js";
import { laNgayTrongTuongLai } from "./ngay-thang.js";

/**
 * Tạo kết quả kiểm tra dữ liệu thống nhất.
 *
 * @param {Object<string, string>} loi
 * @returns {{hopLe: boolean, loi: Object<string, string>}}
 */
function taoKetQuaKiemTra(loi = {}) {
    return {
        hopLe: Object.keys(loi).length === 0,
        loi
    };
}

/**
 * Kiểm tra một giá trị có phải chuỗi rỗng sau khi loại khoảng trắng hay không.
 *
 * @param {*} giaTri
 * @returns {boolean}
 */
export function laChuoiRong(giaTri) {
    return giaTri === null ||
        giaTri === undefined ||
        String(giaTri).trim() === "";
}

/**
 * Chuẩn hóa chuỗi bằng cách cắt khoảng trắng đầu cuối và gộp khoảng trắng liên tiếp.
 *
 * @param {*} giaTri
 * @returns {string}
 */
export function chuanHoaChuoi(giaTri) {
    if (giaTri === null || giaTri === undefined) {
        return "";
    }

    return String(giaTri)
        .trim()
        .replace(BIEU_THUC.KHOANG_TRANG, " ");
}

/**
 * Chuẩn hóa số điện thoại trước khi kiểm tra.
 *
 * @param {*} soDienThoai
 * @returns {string}
 */
function chuanHoaSoDienThoai(soDienThoai) {
    return String(soDienThoai ?? "")
        .trim()
        .replace(/[.\-\s()]/g, "");
}

/**
 * Kiểm tra số điện thoại Việt Nam.
 *
 * @param {*} soDienThoai
 * @param {string} [tenTruong="soDienThoai"]
 * @returns {{hopLe: boolean, loi: Object<string, string>}}
 */
export function kiemTraSoDienThoai(
    soDienThoai,
    tenTruong = "soDienThoai"
) {
    const loi = {};
    const giaTri = chuanHoaSoDienThoai(soDienThoai);

    if (laChuoiRong(giaTri)) {
        loi[tenTruong] = "Số điện thoại là bắt buộc.";
    } else if (!BIEU_THUC.SO_DIEN_THOAI_VIET_NAM.test(giaTri)) {
        loi[tenTruong] = "Số điện thoại không hợp lệ.";
    }

    return taoKetQuaKiemTra(loi);
}

/**
 * Kiểm tra giá trị có phải số hữu hạn lớn hơn 0 hay không.
 *
 * @param {*} giaTri
 * @param {string} [tenTruong="giaTri"]
 * @param {string} [thongBao="Giá trị phải là số lớn hơn 0."]
 * @returns {{hopLe: boolean, loi: Object<string, string>}}
 */
export function kiemTraSoDuong(
    giaTri,
    tenTruong = "giaTri",
    thongBao = "Giá trị phải là số lớn hơn 0."
) {
    const loi = {};
    const so = typeof giaTri === "string" && giaTri.trim() === ""
        ? Number.NaN
        : Number(giaTri);

    if (!Number.isFinite(so) || so <= 0) {
        loi[tenTruong] = thongBao;
    }

    return taoKetQuaKiemTra(loi);
}

/**
 * Gộp lỗi từ một kết quả kiểm tra vào đối tượng lỗi đích.
 *
 * @param {Object<string, string>} loiDich
 * @param {{hopLe: boolean, loi: Object<string, string>}} ketQua
 * @returns {void}
 */
function gopLoi(loiDich, ketQua) {
    Object.assign(loiDich, ketQua.loi);
}

/**
 * Kiểm tra độ dài tối đa của một trường chuỗi không bắt buộc.
 *
 * @param {Object<string, string>} loi
 * @param {string} tenTruong
 * @param {*} giaTri
 * @param {number} doDaiToiDa
 * @param {string} tenHienThi
 * @returns {void}
 */
function kiemTraDoDaiToiDa(
    loi,
    tenTruong,
    giaTri,
    doDaiToiDa,
    tenHienThi
) {
    const chuoi = chuanHoaChuoi(giaTri);

    if (chuoi.length > doDaiToiDa) {
        loi[tenTruong] = `${tenHienThi} không được vượt quá ${doDaiToiDa} ký tự.`;
    }
}

/**
 * Kiểm tra dữ liệu bệnh nhân ở mức dữ liệu đầu vào.
 * Không kiểm tra trùng bệnh nhân hoặc các quy tắc cần truy xuất kho dữ liệu.
 *
 * @param {Object} benhNhan
 * @returns {{hopLe: boolean, loi: Object<string, string>}}
 */
export function kiemTraBenhNhan(benhNhan = {}) {
    const loi = {};
    const hoTen = chuanHoaChuoi(benhNhan.hoTen);

    if (laChuoiRong(hoTen)) {
        loi.hoTen = "Họ tên bệnh nhân là bắt buộc.";
    } else if (hoTen.length > GIOI_HAN.HO_TEN_TOI_DA) {
        loi.hoTen = `Họ tên không được vượt quá ${GIOI_HAN.HO_TEN_TOI_DA} ký tự.`;
    }

    if (laChuoiRong(benhNhan.ngaySinh)) {
        loi.ngaySinh = "Ngày sinh là bắt buộc.";
    } else {
        const ngaySinh = new Date(benhNhan.ngaySinh);

        if (Number.isNaN(ngaySinh.getTime())) {
            loi.ngaySinh = "Ngày sinh không hợp lệ.";
        } else if (laNgayTrongTuongLai(benhNhan.ngaySinh)) {
            loi.ngaySinh = "Ngày sinh không được lớn hơn ngày hiện tại.";
        }
    }

    gopLoi(loi, kiemTraSoDienThoai(benhNhan.soDienThoai));

    if (
        benhNhan.trangThai !== undefined &&
        benhNhan.trangThai !== null &&
        benhNhan.trangThai !== "" &&
        !Object.values(TRANG_THAI_BENH_NHAN).includes(benhNhan.trangThai)
    ) {
        loi.trangThai = "Trạng thái bệnh nhân không hợp lệ.";
    }

    kiemTraDoDaiToiDa(
        loi,
        "diaChi",
        benhNhan.diaChi,
        GIOI_HAN.DIA_CHI_TOI_DA,
        "Địa chỉ"
    );
    kiemTraDoDaiToiDa(
        loi,
        "trieuChung",
        benhNhan.trieuChung,
        GIOI_HAN.TRIEU_CHUNG_TOI_DA,
        "Triệu chứng"
    );
    kiemTraDoDaiToiDa(
        loi,
        "tienSuBenh",
        benhNhan.tienSuBenh,
        GIOI_HAN.TIEN_SU_BENH_TOI_DA,
        "Tiền sử bệnh"
    );
    kiemTraDoDaiToiDa(
        loi,
        "diUngThuoc",
        benhNhan.diUngThuoc,
        GIOI_HAN.DI_UNG_THUOC_TOI_DA,
        "Dị ứng thuốc"
    );

    return taoKetQuaKiemTra(loi);
}

/**
 * Kiểm tra một thuốc trong đơn thuốc.
 *
 * @param {Object} thuoc
 * @returns {{hopLe: boolean, loi: Object<string, string>}}
 */
export function kiemTraThuocTrongDon(thuoc = {}) {
    const loi = {};
    const tenThuoc = chuanHoaChuoi(thuoc.tenThuoc);

    if (laChuoiRong(tenThuoc)) {
        loi.tenThuoc = "Tên thuốc là bắt buộc.";
    } else if (tenThuoc.length > GIOI_HAN.TEN_THUOC_TOI_DA) {
        loi.tenThuoc = `Tên thuốc không được vượt quá ${GIOI_HAN.TEN_THUOC_TOI_DA} ký tự.`;
    }

    gopLoi(
        loi,
        kiemTraSoDuong(
            thuoc.soLuongMoiLan,
            "soLuongMoiLan",
            "Số lượng mỗi lần phải lớn hơn 0."
        )
    );
    gopLoi(
        loi,
        kiemTraSoDuong(
            thuoc.soLanMoiNgay,
            "soLanMoiNgay",
            "Số lần mỗi ngày phải lớn hơn 0."
        )
    );
    gopLoi(
        loi,
        kiemTraSoDuong(
            thuoc.soNgayDung,
            "soNgayDung",
            "Số ngày dùng phải lớn hơn 0."
        )
    );

    return taoKetQuaKiemTra(loi);
}

/**
 * Kiểm tra thông tin khám bệnh trước khi lưu hoặc hoàn tất đơn thuốc.
 *
 * @param {Object} thongTinKham
 * @returns {{hopLe: boolean, loi: Object<string, string>}}
 */
export function kiemTraThongTinKham(thongTinKham = {}) {
    const loi = {};
    const tenBacSi = chuanHoaChuoi(thongTinKham.tenBacSi);
    const chuanDoan = chuanHoaChuoi(thongTinKham.chuanDoan);
    const loiDan = chuanHoaChuoi(thongTinKham.loiDan);

    if (laChuoiRong(tenBacSi)) {
        loi.tenBacSi = "Tên bác sĩ là bắt buộc.";
    } else if (tenBacSi.length > GIOI_HAN.TEN_BAC_SI_TOI_DA) {
        loi.tenBacSi = `Tên bác sĩ không được vượt quá ${GIOI_HAN.TEN_BAC_SI_TOI_DA} ký tự.`;
    }

    if (laChuoiRong(chuanDoan)) {
        loi.chuanDoan = "Chẩn đoán là bắt buộc.";
    } else if (chuanDoan.length > GIOI_HAN.CHUAN_DOAN_TOI_DA) {
        loi.chuanDoan = `Chẩn đoán không được vượt quá ${GIOI_HAN.CHUAN_DOAN_TOI_DA} ký tự.`;
    }

    if (loiDan.length > GIOI_HAN.LOI_DAN_TOI_DA) {
        loi.loiDan = `Lời dặn không được vượt quá ${GIOI_HAN.LOI_DAN_TOI_DA} ký tự.`;
    }

    return taoKetQuaKiemTra(loi);
}
