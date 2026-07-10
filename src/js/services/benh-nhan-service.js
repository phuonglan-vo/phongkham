import {
    TRANG_THAI_BENH_NHAN,
    TRANG_THAI_DON_THUOC
} from "../constants/hang-so.js";
import {
    coTheBatDauKham,
    coTheXoaBenhNhan,
    chuanHoaBenhNhan,
    locBenhNhanTheoTrangThai,
    locBenhNhanTheoTuKhoa,
    sapXepBenhNhanMoiNhat,
    taoBenhNhanMoi,
    timBenhNhanTrung
} from "../business/benh-nhan-business.js";
import {
    kiemTraBenhNhan
} from "../utils/kiem-tra.js";
import {
    taoId as taoIdMacDinh,
    taoMaBenhNhan as taoMaBenhNhanMacDinh
} from "../utils/ma.js";

/**
 * Lấy thông báo lỗi đầu tiên từ kết quả kiểm tra dữ liệu.
 *
 * @param {{hopLe: boolean, loi: Object<string, string>}} ketQua
 * @returns {string}
 */
function layThongBaoLoiDauTien(ketQua) {
    const thuTuTruong = [
        "hoTen",
        "ngaySinh",
        "soDienThoai",
        "gioiTinh",
        "diaChi",
        "trieuChung",
        "tienSuBenh",
        "diUngThuoc",
        "trangThai"
    ];

    for (const tenTruong of thuTuTruong) {
        if (ketQua.loi[tenTruong]) {
            if (
                tenTruong === "hoTen" &&
                ketQua.loi[tenTruong] === "Họ tên bệnh nhân là bắt buộc."
            ) {
                return "Họ tên bệnh nhân không được để trống.";
            }

            return ketQua.loi[tenTruong];
        }
    }

    return Object.values(ketQua.loi)[0] ?? "Dữ liệu bệnh nhân không hợp lệ.";
}

/**
 * Kiểm tra dependency bắt buộc của service.
 *
 * @param {Object} doiTuong
 * @param {string} tenDependency
 * @param {Array<string>} cacHamBatBuoc
 * @returns {void}
 */
function kiemTraDependency(doiTuong, tenDependency, cacHamBatBuoc) {
    if (!doiTuong || typeof doiTuong !== "object") {
        throw new TypeError(`${tenDependency} là bắt buộc.`);
    }

    for (const tenHam of cacHamBatBuoc) {
        if (typeof doiTuong[tenHam] !== "function") {
            throw new TypeError(`${tenDependency}.${tenHam} phải là một hàm.`);
        }
    }
}

/**
 * Tạo service quản lý bệnh nhân qua dependency injection.
 * Có thể truyền repository dùng storage giả khi kiểm thử.
 *
 * @param {Object} phuThuoc
 * @param {Object} phuThuoc.benhNhanRepository
 * @param {Object} phuThuoc.donThuocRepository
 * @param {Function} [phuThuoc.taoId]
 * @param {Function} [phuThuoc.taoMaBenhNhan]
 * @param {Function} [phuThuoc.layThoiGianHienTai]
 * @returns {Object}
 */
export function taoBenhNhanService({
    benhNhanRepository,
    donThuocRepository,
    taoId = taoIdMacDinh,
    taoMaBenhNhan = taoMaBenhNhanMacDinh,
    layThoiGianHienTai = () => new Date()
} = {}) {
    kiemTraDependency(
        benhNhanRepository,
        "benhNhanRepository",
        [
            "layTatCaBenhNhan",
            "timBenhNhanTheoId",
            "themBenhNhan",
            "capNhatBenhNhan",
            "xoaBenhNhan"
        ]
    );
    kiemTraDependency(
        donThuocRepository,
        "donThuocRepository",
        [
            "timDonThuocTheoBenhNhan",
            "xoaDonThuoc"
        ]
    );

    if (typeof taoId !== "function") {
        throw new TypeError("taoId phải là một hàm.");
    }
    if (typeof taoMaBenhNhan !== "function") {
        throw new TypeError("taoMaBenhNhan phải là một hàm.");
    }
    if (typeof layThoiGianHienTai !== "function") {
        throw new TypeError("layThoiGianHienTai phải là một hàm.");
    }

    /**
     * Lấy toàn bộ bệnh nhân, mới nhất đứng trước.
     *
     * @returns {Array<Object>}
     */
    function layDanhSachBenhNhan() {
        return sapXepBenhNhanMoiNhat(
            benhNhanRepository.layTatCaBenhNhan()
        );
    }

    /**
     * Lấy chi tiết bệnh nhân theo ID.
     *
     * @param {string} id
     * @returns {Object}
     * @throws {Error}
     */
    function layChiTietBenhNhan(id) {
        const benhNhan = benhNhanRepository.timBenhNhanTheoId(id);

        if (!benhNhan) {
            throw new Error("Không tìm thấy bệnh nhân.");
        }

        return benhNhan;
    }

    /**
     * Kiểm tra dữ liệu bệnh nhân và ném lỗi nghiệp vụ rõ ràng.
     *
     * @param {Object} benhNhan
     * @returns {void}
     */
    function damBaoDuLieuHopLe(benhNhan) {
        const ketQua = kiemTraBenhNhan(benhNhan);

        if (!ketQua.hopLe) {
            throw new Error(layThongBaoLoiDauTien(ketQua));
        }
    }

    /**
     * Thêm bệnh nhân mới.
     *
     * @param {Object} duLieu
     * @returns {Object}
     */
    function themBenhNhan(duLieu = {}) {
        const duLieuChuanHoa = chuanHoaBenhNhan(duLieu);
        damBaoDuLieuHopLe(duLieuChuanHoa);

        const danhSachHienTai = benhNhanRepository.layTatCaBenhNhan();
        const benhNhanTrung = timBenhNhanTrung(
            danhSachHienTai,
            duLieuChuanHoa
        );

        if (benhNhanTrung) {
            throw new Error("Bệnh nhân đã tồn tại.");
        }

        const benhNhanMoi = taoBenhNhanMoi(
            duLieuChuanHoa,
            {
                taoId,
                taoMaBenhNhan,
                layThoiGianHienTai
            }
        );

        return benhNhanRepository.themBenhNhan(benhNhanMoi);
    }

    /**
     * Cập nhật bệnh nhân.
     *
     * @param {string} id
     * @param {Object} duLieu
     * @returns {Object}
     */
    function capNhatBenhNhan(id, duLieu = {}) {
        const benhNhanHienTai = layChiTietBenhNhan(id);
        const duLieuChuanHoa = chuanHoaBenhNhan({
            ...benhNhanHienTai,
            ...duLieu,
            id: benhNhanHienTai.id,
            maBenhNhan: benhNhanHienTai.maBenhNhan,
            ngayTiepNhan: benhNhanHienTai.ngayTiepNhan
        });

        damBaoDuLieuHopLe(duLieuChuanHoa);

        const benhNhanTrung = timBenhNhanTrung(
            benhNhanRepository.layTatCaBenhNhan(),
            duLieuChuanHoa,
            id
        );

        if (benhNhanTrung) {
            throw new Error("Bệnh nhân đã tồn tại.");
        }

        const thoiGian = layThoiGianHienTai();
        const ngayCapNhat = new Date(thoiGian);

        if (Number.isNaN(ngayCapNhat.getTime())) {
            throw new Error("Thời gian cập nhật bệnh nhân không hợp lệ.");
        }

        const benhNhanCapNhat = {
            ...duLieuChuanHoa,
            ngayCapNhat: ngayCapNhat.toISOString()
        };
        const ketQua = benhNhanRepository.capNhatBenhNhan(benhNhanCapNhat);

        if (!ketQua) {
            throw new Error("Không thể cập nhật bệnh nhân.");
        }

        return ketQua;
    }

    /**
     * Xóa bệnh nhân và các đơn thuốc chưa hoàn tất liên quan.
     *
     * @param {string} id
     * @returns {boolean}
     */
    function xoaBenhNhan(id) {
        const benhNhan = layChiTietBenhNhan(id);
        const danhSachDonThuoc = donThuocRepository.timDonThuocTheoBenhNhan(id);

        if (!coTheXoaBenhNhan(benhNhan, danhSachDonThuoc)) {
            throw new Error("Không thể xóa bệnh nhân đã có đơn thuốc hoàn tất.");
        }

        for (const donThuoc of danhSachDonThuoc) {
            if (donThuoc.trangThai !== TRANG_THAI_DON_THUOC.DA_HOAN_TAT) {
                const daXoaDon = donThuocRepository.xoaDonThuoc(donThuoc.id);

                if (!daXoaDon) {
                    throw new Error("Không thể xóa đơn thuốc liên quan của bệnh nhân.");
                }
            }
        }

        const daXoa = benhNhanRepository.xoaBenhNhan(id);

        if (!daXoa) {
            throw new Error("Không thể xóa bệnh nhân.");
        }

        return true;
    }

    /**
     * Tìm kiếm và lọc bệnh nhân.
     *
     * @param {string} tuKhoa
     * @param {string} trangThai
     * @returns {Array<Object>}
     */
    function timKiemBenhNhan(tuKhoa = "", trangThai = "") {
        const theoTuKhoa = locBenhNhanTheoTuKhoa(
            benhNhanRepository.layTatCaBenhNhan(),
            tuKhoa
        );
        const theoTrangThai = locBenhNhanTheoTrangThai(
            theoTuKhoa,
            trangThai
        );

        return sapXepBenhNhanMoiNhat(theoTrangThai);
    }

    /**
     * Chuyển bệnh nhân từ chờ khám sang đang khám.
     *
     * @param {string} id
     * @returns {Object}
     */
    function batDauKham(id) {
        const benhNhan = layChiTietBenhNhan(id);

        if (!coTheBatDauKham(benhNhan)) {
            throw new Error("Bệnh nhân không còn ở trạng thái chờ khám.");
        }

        return capNhatBenhNhan(id, {
            trangThai: TRANG_THAI_BENH_NHAN.DANG_KHAM
        });
    }

    /**
     * Đưa bệnh nhân đang khám trở về trạng thái chờ khám.
     *
     * @param {string} id
     * @returns {Object}
     */
    function duaVeChoKham(id) {
        const benhNhan = layChiTietBenhNhan(id);

        if (benhNhan.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM) {
            return benhNhan;
        }

        if (benhNhan.trangThai !== TRANG_THAI_BENH_NHAN.DANG_KHAM) {
            throw new Error("Chỉ bệnh nhân đang khám mới có thể đưa về chờ khám.");
        }

        return capNhatBenhNhan(id, {
            trangThai: TRANG_THAI_BENH_NHAN.CHO_KHAM
        });
    }

    /**
     * Tạo một tập dữ liệu bệnh nhân mẫu, bỏ qua bản ghi đã tồn tại.
     *
     * @returns {Array<Object>} Danh sách bệnh nhân mẫu vừa được thêm
     */
    function taoDuLieuBenhNhanMau() {
        const moc = new Date(layThoiGianHienTai());

        if (Number.isNaN(moc.getTime())) {
            throw new Error("Thời gian tạo dữ liệu mẫu không hợp lệ.");
        }

        const namHienTai = moc.getFullYear();
        const danhSachMau = [
            {
                hoTen: "Nguyễn Văn An",
                ngaySinh: `${namHienTai - 30}-03-15`,
                gioiTinh: "Nam",
                soDienThoai: "0912345678",
                diaChi: "Quận 1, Thành phố Hồ Chí Minh",
                trieuChung: "Đau đầu và sốt nhẹ",
                tienSuBenh: "Không ghi nhận",
                diUngThuoc: "Không ghi nhận"
            },
            {
                hoTen: "Trần Thị Bình",
                ngaySinh: `${namHienTai - 25}-07-20`,
                gioiTinh: "Nữ",
                soDienThoai: "0987654321",
                diaChi: "Thành phố Thủ Đức, Thành phố Hồ Chí Minh",
                trieuChung: "Ho và đau họng",
                tienSuBenh: "Viêm xoang",
                diUngThuoc: "Dị ứng Penicillin"
            },
            {
                hoTen: "Lê Minh Châu",
                ngaySinh: `${namHienTai - 42}-11-05`,
                gioiTinh: "Khác",
                soDienThoai: "0374567890",
                diaChi: "Quận Bình Thạnh, Thành phố Hồ Chí Minh",
                trieuChung: "Đau bụng",
                tienSuBenh: "Đau dạ dày",
                diUngThuoc: "Không ghi nhận"
            }
        ];
        const daThem = [];

        for (const duLieuMau of danhSachMau) {
            const duLieuChuanHoa = chuanHoaBenhNhan(duLieuMau);
            const trung = timBenhNhanTrung(
                benhNhanRepository.layTatCaBenhNhan(),
                duLieuChuanHoa
            );

            if (!trung) {
                daThem.push(themBenhNhan(duLieuChuanHoa));
            }
        }

        return daThem;
    }

    return Object.freeze({
        layDanhSachBenhNhan,
        layChiTietBenhNhan,
        themBenhNhan,
        capNhatBenhNhan,
        xoaBenhNhan,
        timKiemBenhNhan,
        batDauKham,
        duaVeChoKham,
        taoDuLieuBenhNhanMau
    });
}
