import {
    KHOA_LUU_TRU,
    PHIEN_BAN_DU_LIEU
} from "../constants/hang-so.js";

/**
 * Lấy localStorage mặc định trong môi trường trình duyệt.
 *
 * @returns {Storage}
 * @throws {Error}
 */
function layStorageMacDinh() {
    if (
        typeof globalThis !== "undefined" &&
        globalThis.localStorage
    ) {
        return globalThis.localStorage;
    }

    throw new Error(
        "Không tìm thấy localStorage. Hãy truyền một đối tượng storage khi kiểm thử."
    );
}

/**
 * Kiểm tra storage có đủ giao diện cần thiết hay không.
 *
 * @param {*} storage
 * @throws {TypeError}
 */
function kiemTraStorage(storage) {
    const cacHamBatBuoc = [
        "getItem",
        "setItem",
        "removeItem",
        "clear"
    ];

    const hopLe = storage && cacHamBatBuoc.every(
        (tenHam) => typeof storage[tenHam] === "function"
    );

    if (!hopLe) {
        throw new TypeError("Đối tượng storage không hợp lệ.");
    }
}

/**
 * Tạo lớp truy cập kho lưu trữ có thể thay thế storage để kiểm thử.
 *
 * @param {Storage|Object} [storage]
 * @returns {{
 *   docDanhSach: Function,
 *   ghiDanhSach: Function,
 *   docGiaTri: Function,
 *   ghiGiaTri: Function,
 *   xoaTheoKhoa: Function,
 *   xoaToanBo: Function,
 *   khoiTaoDuLieuMau: Function
 * }}
 */
export function taoKhoLuuTru(storage = layStorageMacDinh()) {
    kiemTraStorage(storage);

    /**
     * Đọc một giá trị JSON từ storage.
     * Nếu khóa không tồn tại hoặc JSON bị lỗi, trả về giá trị mặc định.
     *
     * @param {string} khoa
     * @param {*} giaTriMacDinh
     * @returns {*}
     */
    function docGiaTri(khoa, giaTriMacDinh = null) {
        const duLieuTho = storage.getItem(khoa);

        if (duLieuTho === null) {
            return giaTriMacDinh;
        }

        try {
            return JSON.parse(duLieuTho);
        } catch (loi) {
            console.warn(
                `Dữ liệu JSON tại khóa "${khoa}" không hợp lệ.`,
                loi
            );
            return giaTriMacDinh;
        }
    }

    /**
     * Ghi một giá trị dưới dạng JSON.
     *
     * @param {string} khoa
     * @param {*} giaTri
     * @returns {*} Giá trị đã ghi
     */
    function ghiGiaTri(khoa, giaTri) {
        if (typeof khoa !== "string" || khoa.trim() === "") {
            throw new TypeError("Khóa lưu trữ không hợp lệ.");
        }

        const duLieuJson = JSON.stringify(giaTri);
        storage.setItem(khoa, duLieuJson);
        return giaTri;
    }

    /**
     * Đọc danh sách từ storage.
     * Luôn trả về một mảng mới; dữ liệu không phải mảng được xem là danh sách rỗng.
     *
     * @param {string} khoa
     * @returns {Array}
     */
    function docDanhSach(khoa) {
        const danhSach = docGiaTri(khoa, []);
        return Array.isArray(danhSach) ? [...danhSach] : [];
    }

    /**
     * Ghi danh sách vào storage.
     *
     * @param {string} khoa
     * @param {Array} danhSach
     * @returns {Array} Bản sao danh sách đã ghi
     */
    function ghiDanhSach(khoa, danhSach) {
        if (!Array.isArray(danhSach)) {
            throw new TypeError("Dữ liệu cần ghi phải là một mảng.");
        }

        const banSao = [...danhSach];
        ghiGiaTri(khoa, banSao);
        return banSao;
    }

    /**
     * Xóa một khóa khỏi storage.
     *
     * @param {string} khoa
     * @returns {void}
     */
    function xoaTheoKhoa(khoa) {
        storage.removeItem(khoa);
    }

    /**
     * Xóa toàn bộ dữ liệu trong đối tượng storage được cung cấp.
     *
     * @returns {void}
     */
    function xoaToanBo() {
        storage.clear();
    }

    /**
     * Khởi tạo dữ liệu phục vụ phát triển hoặc kiểm thử.
     * Cho phép truyền dữ liệu mẫu từ bên ngoài để module kho lưu trữ không chứa nghiệp vụ.
     *
     * @param {Object} [duLieuMau]
     * @param {Array} [duLieuMau.benhNhan]
     * @param {Array} [duLieuMau.donThuoc]
     * @param {string} [duLieuMau.phienBan]
     * @returns {{benhNhan: Array, donThuoc: Array, phienBan: string}}
     */
    function khoiTaoDuLieuMau(duLieuMau = {}) {
        const benhNhan = Array.isArray(duLieuMau.benhNhan)
            ? [...duLieuMau.benhNhan]
            : [];
        const donThuoc = Array.isArray(duLieuMau.donThuoc)
            ? [...duLieuMau.donThuoc]
            : [];
        const phienBan = typeof duLieuMau.phienBan === "string" &&
            duLieuMau.phienBan.trim() !== ""
            ? duLieuMau.phienBan
            : PHIEN_BAN_DU_LIEU;

        ghiDanhSach(KHOA_LUU_TRU.BENH_NHAN, benhNhan);
        ghiDanhSach(KHOA_LUU_TRU.DON_THUOC, donThuoc);
        ghiGiaTri(KHOA_LUU_TRU.PHIEN_BAN_DU_LIEU, phienBan);

        return {
            benhNhan,
            donThuoc,
            phienBan
        };
    }

    return Object.freeze({
        docDanhSach,
        ghiDanhSach,
        docGiaTri,
        ghiGiaTri,
        xoaTheoKhoa,
        xoaToanBo,
        khoiTaoDuLieuMau
    });
}
