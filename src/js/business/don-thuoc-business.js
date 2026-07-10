import {
    DON_THUOC_MAC_DINH,
    TRANG_THAI_DON_THUOC
} from "../constants/hang-so.js";
import {
    chuanHoaChuoi,
    kiemTraThongTinKham,
    kiemTraThuocTrongDon
} from "../utils/kiem-tra.js";
import {
    taoId as taoIdMacDinh,
    taoMaDonThuoc as taoMaDonThuocMacDinh
} from "../utils/ma.js";

/**
 * Chuyển thời gian thành chuỗi ISO datetime hợp lệ.
 *
 * @param {Date|string|number} giaTri
 * @returns {string}
 * @throws {TypeError}
 */
function chuyenThoiGianSangISO(giaTri) {
    const ngay = giaTri instanceof Date
        ? new Date(giaTri.getTime())
        : new Date(giaTri);

    if (Number.isNaN(ngay.getTime())) {
        throw new TypeError("Thời gian kê đơn không hợp lệ.");
    }

    return ngay.toISOString();
}

/**
 * Chuẩn hóa từ khóa để tìm kiếm không phân biệt hoa thường và dấu tiếng Việt.
 *
 * @param {*} giaTri
 * @returns {string}
 */
function chuanHoaTuKhoa(giaTri) {
    return chuanHoaChuoi(giaTri)
        .toLocaleLowerCase("vi-VN")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
}

/**
 * Tạo kết quả kiểm tra thống nhất.
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
 * Tính tổng số lượng thuốc theo liều dùng.
 *
 * @param {number|string} soLuongMoiLan
 * @param {number|string} soLanMoiNgay
 * @param {number|string} soNgayDung
 * @returns {number}
 * @throws {RangeError}
 */
export function tinhTongSoLuongThuoc(
    soLuongMoiLan,
    soLanMoiNgay,
    soNgayDung
) {
    const cacGiaTri = [
        Number(soLuongMoiLan),
        Number(soLanMoiNgay),
        Number(soNgayDung)
    ];

    if (cacGiaTri.some((giaTri) => !Number.isFinite(giaTri) || giaTri <= 0)) {
        throw new RangeError("Các thông tin liều dùng phải là số lớn hơn 0.");
    }

    const tongSoLuong = cacGiaTri.reduce(
        (ketQua, giaTri) => ketQua * giaTri,
        1
    );

    if (!Number.isFinite(tongSoLuong) || tongSoLuong <= 0) {
        throw new RangeError("Tổng số lượng thuốc phải là số lớn hơn 0.");
    }

    return tongSoLuong;
}

/**
 * Tạo một thuốc trong đơn từ dữ liệu do người dùng nhập.
 * Không tự đề xuất tên thuốc, hàm lượng, liều dùng hoặc cách dùng.
 *
 * @param {Object} [duLieu]
 * @param {Object} [phuThuoc]
 * @param {Function} [phuThuoc.taoId]
 * @returns {Object}
 */
export function taoThuocTrongDon(
    duLieu = {},
    phuThuoc = {}
) {
    const hamTaoId = phuThuoc.taoId ?? taoIdMacDinh;
    const soLuongMoiLan = Number(duLieu.soLuongMoiLan);
    const soLanMoiNgay = Number(duLieu.soLanMoiNgay);
    const soNgayDung = Number(duLieu.soNgayDung);

    return {
        id: duLieu.id ?? hamTaoId(),
        tenThuoc: chuanHoaChuoi(duLieu.tenThuoc),
        hamLuong: chuanHoaChuoi(duLieu.hamLuong),
        donVi: chuanHoaChuoi(duLieu.donVi),
        soLuongMoiLan,
        soLanMoiNgay,
        soNgayDung,
        tongSoLuong: tinhTongSoLuongThuoc(
            soLuongMoiLan,
            soLanMoiNgay,
            soNgayDung
        ),
        cachDung: chuanHoaChuoi(duLieu.cachDung),
        thoiDiemDung: chuanHoaChuoi(duLieu.thoiDiemDung)
    };
}

/**
 * Tạo đơn thuốc nháp mới.
 *
 * @param {string} benhNhanId
 * @param {Object} [thongTinKham]
 * @param {Object} [phuThuoc]
 * @param {Function} [phuThuoc.taoId]
 * @param {Function} [phuThuoc.taoMaDonThuoc]
 * @param {Function} [phuThuoc.layThoiGianHienTai]
 * @returns {Object}
 */
export function taoDonThuocMoi(
    benhNhanId,
    thongTinKham = {},
    phuThuoc = {}
) {
    const hamTaoId = phuThuoc.taoId ?? taoIdMacDinh;
    const hamTaoMaDonThuoc = phuThuoc.taoMaDonThuoc ?? taoMaDonThuocMacDinh;
    const hamLayThoiGian = phuThuoc.layThoiGianHienTai ?? (() => new Date());
    const thoiGian = hamLayThoiGian();

    return {
        id: hamTaoId({ thoiGian }),
        maDonThuoc: hamTaoMaDonThuoc({ thoiGian }),
        benhNhanId: chuanHoaChuoi(benhNhanId),
        tenBacSi: chuanHoaChuoi(thongTinKham.tenBacSi),
        chuanDoan: chuanHoaChuoi(thongTinKham.chuanDoan),
        loiDan: chuanHoaChuoi(thongTinKham.loiDan),
        ngayKeDon: chuyenThoiGianSangISO(thoiGian),
        danhSachThuoc: [],
        trangThai: DON_THUOC_MAC_DINH.trangThai
    };
}

/**
 * Thêm thuốc vào bản sao của danh sách.
 *
 * @param {Array<Object>} danhSachThuoc
 * @param {Object} thuoc
 * @returns {Array<Object>}
 */
export function themThuocVaoDanhSach(
    danhSachThuoc = [],
    thuoc
) {
    return [
        ...danhSachThuoc.map((phanTu) => ({ ...phanTu })),
        { ...thuoc }
    ];
}

/**
 * Xóa thuốc khỏi bản sao của danh sách theo ID.
 *
 * @param {Array<Object>} danhSachThuoc
 * @param {string} thuocId
 * @returns {Array<Object>}
 */
export function xoaThuocKhoiDanhSach(
    danhSachThuoc = [],
    thuocId
) {
    return danhSachThuoc
        .filter((thuoc) => thuoc.id !== thuocId)
        .map((thuoc) => ({ ...thuoc }));
}

/**
 * Kiểm tra đơn thuốc có đủ điều kiện hoàn tất hay không.
 *
 * @param {Object} [donThuoc]
 * @returns {{hopLe: boolean, loi: Object<string, string>}}
 */
export function kiemTraDonThuocCoTheHoanTat(donThuoc = {}) {
    const loi = {};

    if (donThuoc.trangThai !== TRANG_THAI_DON_THUOC.NHAP) {
        loi.trangThai = donThuoc.trangThai === TRANG_THAI_DON_THUOC.DA_HOAN_TAT
            ? "Đơn thuốc đã hoàn tất."
            : "Đơn thuốc đã hủy.";
    }

    const ketQuaThongTinKham = kiemTraThongTinKham(donThuoc);
    Object.assign(loi, ketQuaThongTinKham.loi);

    const danhSachThuoc = Array.isArray(donThuoc.danhSachThuoc)
        ? donThuoc.danhSachThuoc
        : [];

    if (danhSachThuoc.length === 0) {
        loi.danhSachThuoc = "Đơn thuốc phải có ít nhất một loại thuốc.";
    }

    danhSachThuoc.forEach((thuoc, chiSo) => {
        const ketQuaThuoc = kiemTraThuocTrongDon(thuoc);

        for (const [tenTruong, thongBao] of Object.entries(ketQuaThuoc.loi)) {
            loi[`danhSachThuoc.${chiSo}.${tenTruong}`] = thongBao;
        }

        try {
            const tongSoLuong = tinhTongSoLuongThuoc(
                thuoc.soLuongMoiLan,
                thuoc.soLanMoiNgay,
                thuoc.soNgayDung
            );

            if (Number(thuoc.tongSoLuong) !== tongSoLuong) {
                loi[`danhSachThuoc.${chiSo}.tongSoLuong`] =
                    "Tổng số lượng thuốc không đúng với liều dùng.";
            }
        } catch (error) {
            loi[`danhSachThuoc.${chiSo}.tongSoLuong`] = error.message;
        }
    });

    return taoKetQuaKiemTra(loi);
}

/**
 * Kiểm tra đơn thuốc có thể chỉnh sửa hay không.
 *
 * @param {Object} donThuoc
 * @returns {boolean}
 */
export function coTheSuaDonThuoc(donThuoc) {
    return donThuoc?.trangThai === TRANG_THAI_DON_THUOC.NHAP;
}

/**
 * Kiểm tra đơn thuốc có thể hủy hay không.
 *
 * @param {Object} donThuoc
 * @returns {boolean}
 */
export function coTheHuyDonThuoc(donThuoc) {
    return donThuoc?.trangThai === TRANG_THAI_DON_THUOC.NHAP;
}

/**
 * Tìm kiếm và lọc đơn thuốc theo mã đơn, bệnh nhân, bác sĩ và trạng thái.
 *
 * @param {Array<Object>} danhSachDonThuoc
 * @param {*} tuKhoa
 * @param {string} trangThai
 * @param {Array<Object>} danhSachBenhNhan
 * @returns {Array<Object>}
 */
export function timKiemDonThuoc(
    danhSachDonThuoc = [],
    tuKhoa = "",
    trangThai = "",
    danhSachBenhNhan = []
) {
    const tuKhoaChuanHoa = chuanHoaTuKhoa(tuKhoa);
    const tenBenhNhanTheoId = new Map(
        danhSachBenhNhan.map((benhNhan) => [
            benhNhan.id,
            benhNhan.hoTen
        ])
    );

    return danhSachDonThuoc.filter((donThuoc) => {
        const dungTrangThai = !trangThai || donThuoc.trangThai === trangThai;

        if (!dungTrangThai) {
            return false;
        }

        if (!tuKhoaChuanHoa) {
            return true;
        }

        const cacGiaTri = [
            donThuoc.maDonThuoc,
            donThuoc.tenBacSi,
            donThuoc.tenBenhNhan,
            tenBenhNhanTheoId.get(donThuoc.benhNhanId)
        ];

        return cacGiaTri.some((giaTri) =>
            chuanHoaTuKhoa(giaTri).includes(tuKhoaChuanHoa)
        );
    });
}

/**
 * Sắp xếp đơn thuốc mới nhất đứng trước mà không thay đổi mảng đầu vào.
 *
 * @param {Array<Object>} danhSachDonThuoc
 * @returns {Array<Object>}
 */
export function sapXepDonThuocMoiNhat(danhSachDonThuoc = []) {
    function layMocThoiGian(donThuoc) {
        const thoiGian = new Date(donThuoc.ngayKeDon).getTime();
        return Number.isNaN(thoiGian) ? 0 : thoiGian;
    }

    return [...danhSachDonThuoc].sort((a, b) =>
        layMocThoiGian(b) - layMocThoiGian(a)
    );
}
