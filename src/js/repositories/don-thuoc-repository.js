import { KHOA_LUU_TRU } from "../constants/hang-so.js";
import { taoKhoLuuTru } from "./kho-luu-tru.js";

/**
 * Tạo repository đơn thuốc với kho lưu trữ có thể thay thế khi kiểm thử.
 * Repository chỉ truy xuất dữ liệu, không áp dụng quy tắc nghiệp vụ.
 *
 * @param {ReturnType<typeof taoKhoLuuTru>} [khoLuuTru]
 * @returns {Object}
 */
export function taoDonThuocRepository(
    khoLuuTru = taoKhoLuuTru()
) {
    /**
     * Lấy toàn bộ đơn thuốc.
     *
     * @returns {Array<Object>}
     */
    function layTatCaDonThuoc() {
        return khoLuuTru.docDanhSach(KHOA_LUU_TRU.DON_THUOC);
    }

    /**
     * Tìm đơn thuốc theo ID.
     *
     * @param {string} id
     * @returns {Object|null}
     */
    function timDonThuocTheoId(id) {
        return layTatCaDonThuoc().find(
            (donThuoc) => donThuoc.id === id
        ) ?? null;
    }

    /**
     * Tìm tất cả đơn thuốc của một bệnh nhân.
     *
     * @param {string} benhNhanId
     * @returns {Array<Object>}
     */
    function timDonThuocTheoBenhNhan(benhNhanId) {
        return layTatCaDonThuoc().filter(
            (donThuoc) => donThuoc.benhNhanId === benhNhanId
        );
    }

    /**
     * Thêm đơn thuốc vào kho dữ liệu.
     *
     * @param {Object} donThuoc
     * @returns {Object}
     */
    function themDonThuoc(donThuoc) {
        const danhSach = layTatCaDonThuoc();
        danhSach.push(donThuoc);
        khoLuuTru.ghiDanhSach(KHOA_LUU_TRU.DON_THUOC, danhSach);
        return donThuoc;
    }

    /**
     * Cập nhật đơn thuốc theo ID.
     *
     * @param {Object} donThuoc
     * @returns {Object|null} Đơn thuốc đã cập nhật hoặc null nếu không tìm thấy
     */
    function capNhatDonThuoc(donThuoc) {
        const danhSach = layTatCaDonThuoc();
        const viTri = danhSach.findIndex(
            (phanTu) => phanTu.id === donThuoc?.id
        );

        if (viTri < 0) {
            return null;
        }

        danhSach[viTri] = donThuoc;
        khoLuuTru.ghiDanhSach(KHOA_LUU_TRU.DON_THUOC, danhSach);
        return donThuoc;
    }

    /**
     * Xóa đơn thuốc theo ID.
     *
     * @param {string} id
     * @returns {boolean}
     */
    function xoaDonThuoc(id) {
        const danhSach = layTatCaDonThuoc();
        const danhSachMoi = danhSach.filter(
            (donThuoc) => donThuoc.id !== id
        );

        if (danhSachMoi.length === danhSach.length) {
            return false;
        }

        khoLuuTru.ghiDanhSach(
            KHOA_LUU_TRU.DON_THUOC,
            danhSachMoi
        );
        return true;
    }

    return Object.freeze({
        layTatCaDonThuoc,
        timDonThuocTheoId,
        timDonThuocTheoBenhNhan,
        themDonThuoc,
        capNhatDonThuoc,
        xoaDonThuoc
    });
}

let repositoryMacDinh = null;

function layRepositoryMacDinh() {
    if (!repositoryMacDinh) {
        repositoryMacDinh = taoDonThuocRepository();
    }

    return repositoryMacDinh;
}

export function layTatCaDonThuoc() {
    return layRepositoryMacDinh().layTatCaDonThuoc();
}

export function timDonThuocTheoId(id) {
    return layRepositoryMacDinh().timDonThuocTheoId(id);
}

export function timDonThuocTheoBenhNhan(benhNhanId) {
    return layRepositoryMacDinh().timDonThuocTheoBenhNhan(benhNhanId);
}

export function themDonThuoc(donThuoc) {
    return layRepositoryMacDinh().themDonThuoc(donThuoc);
}

export function capNhatDonThuoc(donThuoc) {
    return layRepositoryMacDinh().capNhatDonThuoc(donThuoc);
}

export function xoaDonThuoc(id) {
    return layRepositoryMacDinh().xoaDonThuoc(id);
}
