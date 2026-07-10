import {
    BENH_NHAN_MAC_DINH,
    TRANG_THAI_BENH_NHAN,
    TRANG_THAI_DON_THUOC
} from "../constants/hang-so.js";
import {
    chuanHoaChuoi
} from "../utils/kiem-tra.js";
import {
    chuyenNgaySangISO
} from "../utils/ngay-thang.js";
import {
    taoId as taoIdMacDinh,
    taoMaBenhNhan as taoMaBenhNhanMacDinh
} from "../utils/ma.js";

/**
 * Chuẩn hóa số điện thoại về dạng dùng để lưu và so sánh.
 *
 * @param {*} giaTri
 * @returns {string}
 */
function chuanHoaSoDienThoai(giaTri) {
    const soDienThoai = String(giaTri ?? "")
        .trim()
        .replace(/[.\-\s()]/g, "");

    if (soDienThoai.startsWith("+84")) {
        return `0${soDienThoai.slice(3)}`;
    }

    return soDienThoai;
}

/**
 * Chuẩn hóa chuỗi để tìm kiếm không phân biệt hoa thường và dấu tiếng Việt.
 *
 * @param {*} giaTri
 * @returns {string}
 */
function chuanHoaTuKhoaTimKiem(giaTri) {
    return chuanHoaChuoi(giaTri)
        .toLocaleLowerCase("vi-VN")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
}

/**
 * Chuyển thời gian thành chuỗi ISO datetime an toàn.
 *
 * @param {Date|string|number} giaTri
 * @returns {string}
 */
function chuyenThoiGianSangISO(giaTri) {
    const ngay = giaTri instanceof Date
        ? new Date(giaTri.getTime())
        : new Date(giaTri);

    if (Number.isNaN(ngay.getTime())) {
        throw new TypeError("Thời gian hiện tại không hợp lệ.");
    }

    return ngay.toISOString();
}

/**
 * Chuẩn hóa dữ liệu bệnh nhân mà không thay đổi object đầu vào.
 *
 * @param {Object} [benhNhan]
 * @returns {Object}
 */
export function chuanHoaBenhNhan(benhNhan = {}) {
    return {
        ...benhNhan,
        hoTen: chuanHoaChuoi(benhNhan.hoTen),
        ngaySinh: chuyenNgaySangISO(benhNhan.ngaySinh),
        gioiTinh: chuanHoaChuoi(benhNhan.gioiTinh),
        soDienThoai: chuanHoaSoDienThoai(benhNhan.soDienThoai),
        diaChi: chuanHoaChuoi(benhNhan.diaChi),
        trieuChung: chuanHoaChuoi(benhNhan.trieuChung),
        tienSuBenh: chuanHoaChuoi(benhNhan.tienSuBenh),
        diUngThuoc: chuanHoaChuoi(benhNhan.diUngThuoc)
    };
}

/**
 * Tạo bệnh nhân mới.
 * Các dependency sinh ID, mã và thời gian có thể truyền vào để Unit Test.
 *
 * @param {Object} [duLieu]
 * @param {Object} [phuThuoc]
 * @param {Function} [phuThuoc.taoId]
 * @param {Function} [phuThuoc.taoMaBenhNhan]
 * @param {Function} [phuThuoc.layThoiGianHienTai]
 * @returns {Object}
 */
export function taoBenhNhanMoi(
    duLieu = {},
    phuThuoc = {}
) {
    const hamTaoId = phuThuoc.taoId ?? taoIdMacDinh;
    const hamTaoMaBenhNhan = phuThuoc.taoMaBenhNhan ?? taoMaBenhNhanMacDinh;
    const hamLayThoiGian = phuThuoc.layThoiGianHienTai ?? (() => new Date());
    const thoiGian = hamLayThoiGian();
    const thoiGianISO = chuyenThoiGianSangISO(thoiGian);
    const duLieuChuanHoa = chuanHoaBenhNhan(duLieu);

    return {
        ...duLieuChuanHoa,
        id: hamTaoId({ thoiGian }),
        maBenhNhan: hamTaoMaBenhNhan({ thoiGian }),
        trangThai: BENH_NHAN_MAC_DINH.trangThai,
        ngayTiepNhan: thoiGianISO,
        ngayCapNhat: thoiGianISO
    };
}

/**
 * Tìm bệnh nhân có cùng số điện thoại và ngày sinh.
 * Có thể bỏ qua một ID khi kiểm tra cập nhật.
 *
 * @param {Array<Object>} danhSachBenhNhan
 * @param {Object} benhNhanCanKiemTra
 * @param {string|null} [idBoQua]
 * @returns {Object|null}
 */
export function timBenhNhanTrung(
    danhSachBenhNhan = [],
    benhNhanCanKiemTra = {},
    idBoQua = null
) {
    const benhNhanChuanHoa = chuanHoaBenhNhan(benhNhanCanKiemTra);

    return danhSachBenhNhan.find((benhNhan) => {
        if (idBoQua && benhNhan.id === idBoQua) {
            return false;
        }

        const benhNhanTrongDanhSach = chuanHoaBenhNhan(benhNhan);

        return benhNhanTrongDanhSach.soDienThoai === benhNhanChuanHoa.soDienThoai &&
            benhNhanTrongDanhSach.ngaySinh === benhNhanChuanHoa.ngaySinh;
    }) ?? null;
}

/**
 * Lọc bệnh nhân theo mã, họ tên hoặc số điện thoại.
 *
 * @param {Array<Object>} danhSachBenhNhan
 * @param {*} tuKhoa
 * @returns {Array<Object>}
 */
export function locBenhNhanTheoTuKhoa(
    danhSachBenhNhan = [],
    tuKhoa = ""
) {
    const tuKhoaChuanHoa = chuanHoaTuKhoaTimKiem(tuKhoa);

    if (!tuKhoaChuanHoa) {
        return [...danhSachBenhNhan];
    }

    return danhSachBenhNhan.filter((benhNhan) => {
        const cacGiaTri = [
            benhNhan.maBenhNhan,
            benhNhan.hoTen,
            benhNhan.soDienThoai
        ];

        return cacGiaTri.some((giaTri) =>
            chuanHoaTuKhoaTimKiem(giaTri).includes(tuKhoaChuanHoa)
        );
    });
}

/**
 * Lọc bệnh nhân theo trạng thái.
 * Trạng thái rỗng trả về bản sao toàn bộ danh sách.
 *
 * @param {Array<Object>} danhSachBenhNhan
 * @param {string} trangThai
 * @returns {Array<Object>}
 */
export function locBenhNhanTheoTrangThai(
    danhSachBenhNhan = [],
    trangThai = ""
) {
    if (!trangThai) {
        return [...danhSachBenhNhan];
    }

    return danhSachBenhNhan.filter(
        (benhNhan) => benhNhan.trangThai === trangThai
    );
}

/**
 * Sắp xếp bệnh nhân mới nhất theo ngày tiếp nhận, sau đó ngày cập nhật.
 * Không thay đổi mảng đầu vào.
 *
 * @param {Array<Object>} danhSachBenhNhan
 * @returns {Array<Object>}
 */
export function sapXepBenhNhanMoiNhat(danhSachBenhNhan = []) {
    function layMocThoiGian(benhNhan) {
        const giaTri = benhNhan.ngayTiepNhan ?? benhNhan.ngayCapNhat;
        const thoiGian = new Date(giaTri).getTime();
        return Number.isNaN(thoiGian) ? 0 : thoiGian;
    }

    return [...danhSachBenhNhan].sort((a, b) =>
        layMocThoiGian(b) - layMocThoiGian(a)
    );
}

/**
 * Kiểm tra có thể xóa bệnh nhân hay không.
 *
 * @param {Object} benhNhan
 * @param {Array<Object>} danhSachDonThuoc
 * @returns {boolean}
 */
export function coTheXoaBenhNhan(
    benhNhan,
    danhSachDonThuoc = []
) {
    if (!benhNhan?.id) {
        return false;
    }

    return !danhSachDonThuoc.some((donThuoc) =>
        donThuoc.benhNhanId === benhNhan.id &&
        donThuoc.trangThai === TRANG_THAI_DON_THUOC.DA_HOAN_TAT
    );
}

/**
 * Kiểm tra bệnh nhân có thể bắt đầu khám hay không.
 *
 * @param {Object} benhNhan
 * @returns {boolean}
 */
export function coTheBatDauKham(benhNhan) {
    return benhNhan?.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM;
}

/**
 * Kiểm tra bệnh nhân có thể được lập đơn thuốc hay không.
 *
 * @param {Object} benhNhan
 * @returns {boolean}
 */
export function coTheLapDonThuoc(benhNhan) {
    return benhNhan?.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM ||
        benhNhan?.trangThai === TRANG_THAI_BENH_NHAN.DANG_KHAM;
}
