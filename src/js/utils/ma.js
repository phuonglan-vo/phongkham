import { DINH_DANG_MA } from "../constants/hang-so.js";

/**
 * Chuyển Date hoặc giá trị thời gian thành đối tượng Date hợp lệ.
 *
 * @param {Date|number|string} thoiGian
 * @returns {Date}
 * @throws {TypeError}
 */
function taoDoiTuongNgay(thoiGian = new Date()) {

    const ngay = thoiGian instanceof Date
        ? new Date(thoiGian.getTime())
        : new Date(thoiGian);

    if (Number.isNaN(ngay.getTime())) {
        throw new TypeError("Thời gian không hợp lệ.");
    }

    return ngay;

}

/**
 * Định dạng YYYYMMDD.
 *
 * @param {Date} ngay
 * @returns {string}
 */
function dinhDangNgay(ngay) {

    const nam = String(ngay.getFullYear());

    const thang = String(
        ngay.getMonth() + 1
    ).padStart(2, "0");

    const ngayTrongThang = String(
        ngay.getDate()
    ).padStart(2, "0");

    return `${nam}${thang}${ngayTrongThang}`;

}

/**
 * Chuẩn hóa phần số ngẫu nhiên.
 *
 * @param {number|string} giaTri
 * @param {number} doDai
 * @returns {string}
 */
function taoChuoiNgauNhien(
    giaTri,
    doDai = DINH_DANG_MA.DO_DAI_SO_NGAU_NHIEN
) {

    let so = Number(giaTri);

    if (!Number.isFinite(so)) {
        so = Math.floor(Math.random() * (10 ** doDai));
    }

    const gioiHan = 10 ** doDai;

    so = Math.abs(Math.trunc(so)) % gioiHan;

    return String(so).padStart(doDai, "0");

}

/**
 * Sinh UUID nếu trình duyệt hỗ trợ.
 *
 * @returns {string|null}
 */
function taoUuidNative() {

    if (
        typeof globalThis !== "undefined" &&
        globalThis.crypto &&
        typeof globalThis.crypto.randomUUID === "function"
    ) {
        return globalThis.crypto.randomUUID();
    }

    return null;

}

/**
 * Sinh chuỗi định danh duy nhất.
 *
 * Có thể truyền thời gian và giá trị ngẫu nhiên để Unit Test.
 *
 * @param {Object} [tuyChon]
 * @param {Date|number|string} [tuyChon.thoiGian]
 * @param {number|string} [tuyChon.ngauNhien]
 * @returns {string}
 */
export function taoId(tuyChon = {}) {

    const {
        thoiGian = new Date(),
        ngauNhien
    } = tuyChon;

    const uuid = taoUuidNative();

    if (uuid) {
        return uuid;
    }

    const ngay = taoDoiTuongNgay(thoiGian);

    const dauThoiGian = ngay.getTime().toString(36);

    const duoiNgauNhien = taoChuoiNgauNhien(
        ngauNhien,
        6
    );

    return `${dauThoiGian}-${duoiNgauNhien}`;

}

/**
 * Hàm dùng chung để sinh mã nghiệp vụ.
 *
 * @param {string} tienTo
 * @param {Object} [tuyChon]
 * @param {Date|number|string} [tuyChon.thoiGian]
 * @param {number|string} [tuyChon.ngauNhien]
 * @returns {string}
 */
function taoMa(
    tienTo,
    tuyChon = {}
) {

    const {
        thoiGian = new Date(),
        ngauNhien
    } = tuyChon;

    const ngay = taoDoiTuongNgay(thoiGian);

    const phanNgay = dinhDangNgay(ngay);

    const phanNgauNhien = taoChuoiNgauNhien(
        ngauNhien
    );

    return `${tienTo}-${phanNgay}-${phanNgauNhien}`;

}

/**
 * Sinh mã bệnh nhân.
 *
 * Dạng:
 * BN-YYYYMMDD-XXXX
 *
 * @param {Object} [tuyChon]
 * @param {Date|number|string} [tuyChon.thoiGian]
 * @param {number|string} [tuyChon.ngauNhien]
 * @returns {string}
 */
export function taoMaBenhNhan(
    tuyChon = {}
) {

    return taoMa(
        DINH_DANG_MA.TIEN_TO_BENH_NHAN,
        tuyChon
    );

}

/**
 * Sinh mã đơn thuốc.
 *
 * Dạng:
 * DT-YYYYMMDD-XXXX
 *
 * @param {Object} [tuyChon]
 * @param {Date|number|string} [tuyChon.thoiGian]
 * @param {number|string} [tuyChon.ngauNhien]
 * @returns {string}
 */
export function taoMaDonThuoc(
    tuyChon = {}
) {

    return taoMa(
        DINH_DANG_MA.TIEN_TO_DON_THUOC,
        tuyChon
    );

}

