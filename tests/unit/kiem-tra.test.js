import { BIEU_THUC } from "../constants/hang-so.js";

/**
 * Tạo kết quả kiểm tra chuẩn.
 *
 * @param {boolean} hopLe
 * @param {Object} [loi]
 * @returns {{hopLe:boolean,loi:Object}}
 */
function taoKetQua(hopLe = true, loi = {}) {

    return {
        hopLe,
        loi
    };

}

/**
 * Chuẩn hóa chuỗi.
 *
 * - Chuyển undefined/null thành chuỗi rỗng.
 * - Loại bỏ khoảng trắng đầu cuối.
 * - Gom nhiều khoảng trắng liên tiếp thành một khoảng trắng.
 *
 * @param {*} giaTri
 * @returns {string}
 */
export function chuanHoaChuoi(giaTri) {

    if (giaTri === null || giaTri === undefined) {
        return "";
    }

    return String(giaTri)
        .replace(BIEU_THUC.KHOANG_TRANG, " ")
        .trim();

}

/**
 * Kiểm tra chuỗi rỗng.
 *
 * @param {*} giaTri
 * @returns {boolean}
 */
export function laChuoiRong(giaTri) {

    return chuanHoaChuoi(giaTri).length === 0;

}

/**
 * Kiểm tra số điện thoại Việt Nam.
 *
 * Trả về:
 * {
 *   hopLe: boolean,
 *   loi: {
 *      soDienThoai: "..."
 *   }
 * }
 *
 * @param {*} soDienThoai
 * @returns {{hopLe:boolean,loi:Object}}
 */
export function kiemTraSoDienThoai(soDienThoai) {

    const giaTri = chuanHoaChuoi(soDienThoai);

    if (giaTri === "") {

        return taoKetQua(false, {
            soDienThoai: "Số điện thoại là bắt buộc."
        });

    }

    if (!BIEU_THUC.SO_DIEN_THOAI_VIET_NAM.test(giaTri)) {

        return taoKetQua(false, {
            soDienThoai: "Số điện thoại không hợp lệ."
        });

    }

    return taoKetQua(true);

}

/**
 * Kiểm tra số dương.
 *
 * @param {*} giaTri
 * @param {string} tenTruong
 * @returns {{hopLe:boolean,loi:Object}}
 */
export function kiemTraSoDuong(
    giaTri,
    tenTruong = "giaTri"
) {

    const so = Number(giaTri);

    if (!Number.isFinite(so)) {

        return taoKetQua(false, {
            [tenTruong]: "Giá trị phải là một số."
        });

    }

    if (so <= 0) {

        return taoKetQua(false, {
            [tenTruong]: "Giá trị phải lớn hơn 0."
        });

    }

    return taoKetQua(true);

}

import { GIOI_HAN } from "../constants/hang-so.js";
import { laNgayTrongTuongLai } from "./ngay-thang.js";

/**
 * Kiểm tra thông tin bệnh nhân.
 *
 * Hàm chỉ kiểm tra dữ liệu đầu vào.
 * Không kiểm tra quy tắc nghiệp vụ liên quan đến repository
 * (ví dụ: trùng số điện thoại + ngày sinh).
 *
 * @param {Object} benhNhan
 * @returns {{hopLe:boolean,loi:Object}}
 */
export function kiemTraBenhNhan(benhNhan = {}) {

    const loi = {};

    const hoTen = chuanHoaChuoi(benhNhan.hoTen);

    if (laChuoiRong(hoTen)) {

        loi.hoTen = "Họ tên bệnh nhân là bắt buộc.";

    } else if (hoTen.length > GIOI_HAN.HO_TEN_TOI_DA) {

        loi.hoTen =
            `Họ tên không được vượt quá ${GIOI_HAN.HO_TEN_TOI_DA} ký tự.`;

    }

    if (laChuoiRong(benhNhan.ngaySinh)) {

        loi.ngaySinh = "Ngày sinh là bắt buộc.";

    } else if (laNgayTrongTuongLai(benhNhan.ngaySinh)) {

        loi.ngaySinh =
            "Ngày sinh không được lớn hơn ngày hiện tại.";

    }

    const ketQuaSoDienThoai =
        kiemTraSoDienThoai(benhNhan.soDienThoai);

    if (!ketQuaSoDienThoai.hopLe) {

        Object.assign(loi, ketQuaSoDienThoai.loi);

    }

    const diaChi =
        chuanHoaChuoi(benhNhan.diaChi);

    if (
        diaChi.length >
        GIOI_HAN.DIA_CHI_TOI_DA
    ) {

        loi.diaChi =
            `Địa chỉ không được vượt quá ${GIOI_HAN.DIA_CHI_TOI_DA} ký tự.`;

    }

    const trieuChung =
        chuanHoaChuoi(benhNhan.trieuChung);

    if (
        trieuChung.length >
        GIOI_HAN.TRIEU_CHUNG_TOI_DA
    ) {

        loi.trieuChung =
            `Triệu chứng không được vượt quá ${GIOI_HAN.TRIEU_CHUNG_TOI_DA} ký tự.`;

    }

    const tienSuBenh =
        chuanHoaChuoi(benhNhan.tienSuBenh);

    if (
        tienSuBenh.length >
        GIOI_HAN.TIEN_SU_BENH_TOI_DA
    ) {

        loi.tienSuBenh =
            `Tiền sử bệnh không được vượt quá ${GIOI_HAN.TIEN_SU_BENH_TOI_DA} ký tự.`;

    }

    const diUngThuoc =
        chuanHoaChuoi(benhNhan.diUngThuoc);

    if (
        diUngThuoc.length >
        GIOI_HAN.DI_UNG_THUOC_TOI_DA
    ) {

        loi.diUngThuoc =
            `Dị ứng thuốc không được vượt quá ${GIOI_HAN.DI_UNG_THUOC_TOI_DA} ký tự.`;

    }

    if (
        benhNhan.gioiTinh !== undefined &&
        laChuoiRong(benhNhan.gioiTinh)
    ) {

        loi.gioiTinh = "Giới tính không được để trống.";

    }

    if (
        benhNhan.trangThai !== undefined &&
        laChuoiRong(benhNhan.trangThai)
    ) {

        loi.trangThai = "Trạng thái bệnh nhân là bắt buộc.";

    }

    return {
        hopLe: Object.keys(loi).length === 0,
        loi
    };

}


