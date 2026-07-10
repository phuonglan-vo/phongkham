import { KHOA_LUU_TRU } from "../constants/hang-so.js";
import { taoKhoLuuTru } from "./kho-luu-tru.js";

/**
 * Tạo repository bệnh nhân với kho lưu trữ có thể thay thế khi kiểm thử.
 * Repository chỉ truy xuất dữ liệu, không áp dụng quy tắc nghiệp vụ.
 *
 * @param {ReturnType<typeof taoKhoLuuTru>} [khoLuuTru]
 * @returns {Object}
 */
export function taoBenhNhanRepository(
    khoLuuTru = taoKhoLuuTru()
) {
    /**
     * Lấy toàn bộ bệnh nhân.
     *
     * @returns {Array<Object>}
     */
    function layTatCaBenhNhan() {
        return khoLuuTru.docDanhSach(KHOA_LUU_TRU.BENH_NHAN);
    }

    /**
     * Tìm bệnh nhân theo ID.
     *
     * @param {string} id
     * @returns {Object|null}
     */
    function timBenhNhanTheoId(id) {
        return layTatCaBenhNhan().find(
            (benhNhan) => benhNhan.id === id
        ) ?? null;
    }

    /**
     * Thêm bệnh nhân vào kho dữ liệu.
     *
     * @param {Object} benhNhan
     * @returns {Object}
     */
    function themBenhNhan(benhNhan) {
        const danhSach = layTatCaBenhNhan();
        danhSach.push(benhNhan);
        khoLuuTru.ghiDanhSach(KHOA_LUU_TRU.BENH_NHAN, danhSach);
        return benhNhan;
    }

    /**
     * Cập nhật bệnh nhân theo ID.
     *
     * @param {Object} benhNhan
     * @returns {Object|null} Bệnh nhân đã cập nhật hoặc null nếu không tìm thấy
     */
    function capNhatBenhNhan(benhNhan) {
        const danhSach = layTatCaBenhNhan();
        const viTri = danhSach.findIndex(
            (phanTu) => phanTu.id === benhNhan?.id
        );

        if (viTri < 0) {
            return null;
        }

        danhSach[viTri] = benhNhan;
        khoLuuTru.ghiDanhSach(KHOA_LUU_TRU.BENH_NHAN, danhSach);
        return benhNhan;
    }

    /**
     * Xóa bệnh nhân theo ID.
     *
     * @param {string} id
     * @returns {boolean}
     */
    function xoaBenhNhan(id) {
        const danhSach = layTatCaBenhNhan();
        const danhSachMoi = danhSach.filter(
            (benhNhan) => benhNhan.id !== id
        );

        if (danhSachMoi.length === danhSach.length) {
            return false;
        }

        khoLuuTru.ghiDanhSach(
            KHOA_LUU_TRU.BENH_NHAN,
            danhSachMoi
        );
        return true;
    }

    /**
     * Thay đổi trạng thái của bệnh nhân theo ID.
     * Repository không kiểm tra tính hợp lệ của trạng thái.
     *
     * @param {string} id
     * @param {string} trangThai
     * @returns {Object|null}
     */
    function thayDoiTrangThaiBenhNhan(id, trangThai) {
        const benhNhan = timBenhNhanTheoId(id);

        if (!benhNhan) {
            return null;
        }

        const benhNhanCapNhat = {
            ...benhNhan,
            trangThai
        };

        return capNhatBenhNhan(benhNhanCapNhat);
    }

    return Object.freeze({
        layTatCaBenhNhan,
        timBenhNhanTheoId,
        themBenhNhan,
        capNhatBenhNhan,
        xoaBenhNhan,
        thayDoiTrangThaiBenhNhan
    });
}

let repositoryMacDinh = null;

function layRepositoryMacDinh() {
    if (!repositoryMacDinh) {
        repositoryMacDinh = taoBenhNhanRepository();
    }

    return repositoryMacDinh;
}

export function layTatCaBenhNhan() {
    return layRepositoryMacDinh().layTatCaBenhNhan();
}

export function timBenhNhanTheoId(id) {
    return layRepositoryMacDinh().timBenhNhanTheoId(id);
}

export function themBenhNhan(benhNhan) {
    return layRepositoryMacDinh().themBenhNhan(benhNhan);
}

export function capNhatBenhNhan(benhNhan) {
    return layRepositoryMacDinh().capNhatBenhNhan(benhNhan);
}

export function xoaBenhNhan(id) {
    return layRepositoryMacDinh().xoaBenhNhan(id);
}

export function thayDoiTrangThaiBenhNhan(id, trangThai) {
    return layRepositoryMacDinh().thayDoiTrangThaiBenhNhan(id, trangThai);
}
