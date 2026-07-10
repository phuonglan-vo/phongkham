import {
    TRANG_THAI_BENH_NHAN,
    TRANG_THAI_DON_THUOC
} from "../constants/hang-so.js";
import {
    coTheHuyDonThuoc,
    coTheSuaDonThuoc,
    kiemTraDonThuocCoTheHoanTat,
    sapXepDonThuocMoiNhat,
    taoDonThuocMoi,
    taoThuocTrongDon,
    themThuocVaoDanhSach,
    timKiemDonThuoc as timKiemDonThuocBusiness,
    xoaThuocKhoiDanhSach
} from "../business/don-thuoc-business.js";
import {
    coTheLapDonThuoc
} from "../business/benh-nhan-business.js";
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
 * Lấy thông báo lỗi đầu tiên theo thứ tự nghiệp vụ dễ hiểu.
 *
 * @param {{hopLe: boolean, loi: Object<string, string>}} ketQua
 * @returns {string}
 */
function layThongBaoLoiDauTien(ketQua) {
    const thuTu = [
        "tenBacSi",
        "chuanDoan",
        "loiDan",
        "danhSachThuoc",
        "tenThuoc",
        "soLuongMoiLan",
        "soLanMoiNgay",
        "soNgayDung",
        "trangThai"
    ];

    for (const tenTruong of thuTu) {
        if (ketQua.loi[tenTruong]) {
            return ketQua.loi[tenTruong];
        }
    }

    return Object.values(ketQua.loi)[0] ?? "Dữ liệu đơn thuốc không hợp lệ.";
}

/**
 * Tạo service quản lý đơn thuốc qua dependency injection.
 * Repository có thể được tạo từ storage giả để phục vụ kiểm thử.
 *
 * @param {Object} phuThuoc
 * @param {Object} phuThuoc.donThuocRepository
 * @param {Object} phuThuoc.benhNhanRepository
 * @param {Function} [phuThuoc.taoId]
 * @param {Function} [phuThuoc.taoMaDonThuoc]
 * @param {Function} [phuThuoc.layThoiGianHienTai]
 * @returns {Object}
 */
export function taoDonThuocService({
    donThuocRepository,
    benhNhanRepository,
    taoId = taoIdMacDinh,
    taoMaDonThuoc = taoMaDonThuocMacDinh,
    layThoiGianHienTai = () => new Date()
} = {}) {
    kiemTraDependency(
        donThuocRepository,
        "donThuocRepository",
        [
            "layTatCaDonThuoc",
            "timDonThuocTheoId",
            "timDonThuocTheoBenhNhan",
            "themDonThuoc",
            "capNhatDonThuoc",
            "xoaDonThuoc"
        ]
    );
    kiemTraDependency(
        benhNhanRepository,
        "benhNhanRepository",
        [
            "layTatCaBenhNhan",
            "timBenhNhanTheoId",
            "capNhatBenhNhan",
            "thayDoiTrangThaiBenhNhan"
        ]
    );

    if (typeof taoId !== "function") {
        throw new TypeError("taoId phải là một hàm.");
    }
    if (typeof taoMaDonThuoc !== "function") {
        throw new TypeError("taoMaDonThuoc phải là một hàm.");
    }
    if (typeof layThoiGianHienTai !== "function") {
        throw new TypeError("layThoiGianHienTai phải là một hàm.");
    }

    /**
     * Lấy bệnh nhân hoặc ném lỗi nghiệp vụ.
     *
     * @param {string} id
     * @returns {Object}
     */
    function layBenhNhanBatBuoc(id) {
        const benhNhan = benhNhanRepository.timBenhNhanTheoId(id);

        if (!benhNhan) {
            throw new Error("Không tìm thấy bệnh nhân.");
        }

        return benhNhan;
    }

    /**
     * Lấy đơn thuốc hoặc ném lỗi nghiệp vụ.
     *
     * @param {string} id
     * @returns {Object}
     */
    function layDonThuocBatBuoc(id) {
        const donThuoc = donThuocRepository.timDonThuocTheoId(id);

        if (!donThuoc) {
            throw new Error("Không tìm thấy đơn thuốc.");
        }

        return donThuoc;
    }

    /**
     * Đảm bảo đơn thuốc còn được chỉnh sửa.
     *
     * @param {Object} donThuoc
     * @returns {void}
     */
    function damBaoCoTheSua(donThuoc) {
        if (coTheSuaDonThuoc(donThuoc)) {
            return;
        }

        if (donThuoc.trangThai === TRANG_THAI_DON_THUOC.DA_HOAN_TAT) {
            throw new Error("Không thể sửa đơn thuốc đã hoàn tất.");
        }

        throw new Error("Không thể sửa đơn thuốc đã hủy.");
    }

    /**
     * Cập nhật bệnh nhân và kiểm tra kết quả.
     *
     * @param {Object} benhNhan
     * @param {string} trangThai
     * @returns {Object}
     */
    function capNhatTrangThaiBenhNhan(benhNhan, trangThai) {
        const thoiGian = new Date(layThoiGianHienTai());

        if (Number.isNaN(thoiGian.getTime())) {
            throw new Error("Thời gian cập nhật bệnh nhân không hợp lệ.");
        }

        const benhNhanCapNhat = {
            ...benhNhan,
            trangThai,
            ngayCapNhat: thoiGian.toISOString()
        };
        const ketQua = benhNhanRepository.capNhatBenhNhan(benhNhanCapNhat);

        if (!ketQua) {
            throw new Error("Không thể cập nhật trạng thái bệnh nhân.");
        }

        return ketQua;
    }

    /**
     * Tạo đơn thuốc nháp cho bệnh nhân hợp lệ.
     *
     * @param {string} benhNhanId
     * @param {Object} [thongTinKham]
     * @returns {Object}
     */
    function taoDonThuocNhap(benhNhanId, thongTinKham = {}) {
        const benhNhan = layBenhNhanBatBuoc(benhNhanId);

        if (!coTheLapDonThuoc(benhNhan)) {
            throw new Error("Bệnh nhân không ở trạng thái có thể lập đơn thuốc.");
        }

        const donNhapHienTai = donThuocRepository
            .timDonThuocTheoBenhNhan(benhNhanId)
            .find((donThuoc) => donThuoc.trangThai === TRANG_THAI_DON_THUOC.NHAP);

        if (donNhapHienTai) {
            throw new Error("Bệnh nhân đã có một đơn thuốc nháp.");
        }

        const donThuocMoi = taoDonThuocMoi(
            benhNhanId,
            thongTinKham,
            {
                taoId,
                taoMaDonThuoc,
                layThoiGianHienTai
            }
        );
        const donDaThem = donThuocRepository.themDonThuoc(donThuocMoi);

        if (!donDaThem) {
            throw new Error("Không thể tạo đơn thuốc nháp.");
        }

        if (benhNhan.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM) {
            capNhatTrangThaiBenhNhan(
                benhNhan,
                TRANG_THAI_BENH_NHAN.DANG_KHAM
            );
        }

        return donDaThem;
    }

    /**
     * Lấy đơn thuốc theo ID.
     *
     * @param {string} id
     * @returns {Object}
     */
    function layDonThuocTheoId(id) {
        return layDonThuocBatBuoc(id);
    }

    /**
     * Lấy danh sách đơn thuốc mới nhất trước.
     *
     * @returns {Array<Object>}
     */
    function layDanhSachDonThuoc() {
        return sapXepDonThuocMoiNhat(
            donThuocRepository.layTatCaDonThuoc()
        );
    }

    /**
     * Thêm một thuốc hợp lệ vào đơn nháp.
     *
     * @param {string} donThuocId
     * @param {Object} duLieuThuoc
     * @returns {Object}
     */
    function themThuocVaoDon(donThuocId, duLieuThuoc = {}) {
        const donThuoc = layDonThuocBatBuoc(donThuocId);
        damBaoCoTheSua(donThuoc);

        const ketQuaKiemTra = kiemTraThuocTrongDon(duLieuThuoc);

        if (!ketQuaKiemTra.hopLe) {
            throw new Error(layThongBaoLoiDauTien(ketQuaKiemTra));
        }

        let thuocMoi;

        try {
            thuocMoi = taoThuocTrongDon(
                duLieuThuoc,
                { taoId }
            );
        } catch (error) {
            throw new Error(error.message);
        }

        const donThuocCapNhat = {
            ...donThuoc,
            danhSachThuoc: themThuocVaoDanhSach(
                donThuoc.danhSachThuoc,
                thuocMoi
            )
        };
        const ketQua = donThuocRepository.capNhatDonThuoc(donThuocCapNhat);

        if (!ketQua) {
            throw new Error("Không thể thêm thuốc vào đơn.");
        }

        return ketQua;
    }

    /**
     * Xóa thuốc khỏi đơn nháp.
     *
     * @param {string} donThuocId
     * @param {string} thuocId
     * @returns {Object}
     */
    function xoaThuocKhoiDon(donThuocId, thuocId) {
        const donThuoc = layDonThuocBatBuoc(donThuocId);
        damBaoCoTheSua(donThuoc);

        const danhSachHienTai = Array.isArray(donThuoc.danhSachThuoc)
            ? donThuoc.danhSachThuoc
            : [];
        const tonTai = danhSachHienTai.some((thuoc) => thuoc.id === thuocId);

        if (!tonTai) {
            throw new Error("Không tìm thấy thuốc trong đơn.");
        }

        const donThuocCapNhat = {
            ...donThuoc,
            danhSachThuoc: xoaThuocKhoiDanhSach(
                danhSachHienTai,
                thuocId
            )
        };
        const ketQua = donThuocRepository.capNhatDonThuoc(donThuocCapNhat);

        if (!ketQua) {
            throw new Error("Không thể xóa thuốc khỏi đơn.");
        }

        return ketQua;
    }

    /**
     * Cập nhật tên bác sĩ, chẩn đoán và lời dặn của đơn nháp.
     * Thông tin có thể chưa đầy đủ khi đang lưu nháp.
     *
     * @param {string} donThuocId
     * @param {Object} thongTinKham
     * @returns {Object}
     */
    function capNhatThongTinKham(donThuocId, thongTinKham = {}) {
        const donThuoc = layDonThuocBatBuoc(donThuocId);
        damBaoCoTheSua(donThuoc);

        const donThuocCapNhat = {
            ...donThuoc,
            tenBacSi: chuanHoaChuoi(thongTinKham.tenBacSi),
            chuanDoan: chuanHoaChuoi(thongTinKham.chuanDoan),
            loiDan: chuanHoaChuoi(thongTinKham.loiDan)
        };
        const ketQua = donThuocRepository.capNhatDonThuoc(donThuocCapNhat);

        if (!ketQua) {
            throw new Error("Không thể cập nhật thông tin khám.");
        }

        return ketQua;
    }

    /**
     * Lưu lại đơn thuốc ở trạng thái nháp.
     *
     * @param {string} donThuocId
     * @returns {Object}
     */
    function luuNhapDonThuoc(donThuocId) {
        const donThuoc = layDonThuocBatBuoc(donThuocId);
        damBaoCoTheSua(donThuoc);

        const donThuocCapNhat = {
            ...donThuoc,
            trangThai: TRANG_THAI_DON_THUOC.NHAP
        };
        const ketQua = donThuocRepository.capNhatDonThuoc(donThuocCapNhat);

        if (!ketQua) {
            throw new Error("Không thể lưu nháp đơn thuốc.");
        }

        return ketQua;
    }

    /**
     * Hoàn tất đơn thuốc hợp lệ và chuyển bệnh nhân sang đã khám.
     *
     * @param {string} donThuocId
     * @returns {Object}
     */
    function hoanTatDonThuoc(donThuocId) {
        const donThuoc = layDonThuocBatBuoc(donThuocId);
        damBaoCoTheSua(donThuoc);

        const ketQuaKiemTra = kiemTraDonThuocCoTheHoanTat(donThuoc);

        if (!ketQuaKiemTra.hopLe) {
            throw new Error(layThongBaoLoiDauTien(ketQuaKiemTra));
        }

        const benhNhan = layBenhNhanBatBuoc(donThuoc.benhNhanId);

        if (!coTheLapDonThuoc(benhNhan)) {
            throw new Error("Bệnh nhân không ở trạng thái có thể hoàn tất đơn thuốc.");
        }

        const donThuocHoanTat = {
            ...donThuoc,
            trangThai: TRANG_THAI_DON_THUOC.DA_HOAN_TAT
        };
        const ketQua = donThuocRepository.capNhatDonThuoc(donThuocHoanTat);

        if (!ketQua) {
            throw new Error("Không thể hoàn tất đơn thuốc.");
        }

        capNhatTrangThaiBenhNhan(
            benhNhan,
            TRANG_THAI_BENH_NHAN.DA_KHAM
        );

        return ketQua;
    }

    /**
     * Hủy đơn thuốc nháp và đưa bệnh nhân trở về chờ khám.
     *
     * @param {string} donThuocId
     * @returns {Object}
     */
    function huyDonThuoc(donThuocId) {
        const donThuoc = layDonThuocBatBuoc(donThuocId);

        if (!coTheHuyDonThuoc(donThuoc)) {
            if (donThuoc.trangThai === TRANG_THAI_DON_THUOC.DA_HOAN_TAT) {
                throw new Error("Không thể hủy đơn thuốc đã hoàn tất.");
            }

            throw new Error("Đơn thuốc đã được hủy trước đó.");
        }

        const donThuocDaHuy = {
            ...donThuoc,
            trangThai: TRANG_THAI_DON_THUOC.DA_HUY
        };
        const ketQua = donThuocRepository.capNhatDonThuoc(donThuocDaHuy);

        if (!ketQua) {
            throw new Error("Không thể hủy đơn thuốc.");
        }

        const benhNhan = layBenhNhanBatBuoc(donThuoc.benhNhanId);

        if (benhNhan.trangThai === TRANG_THAI_BENH_NHAN.DANG_KHAM) {
            capNhatTrangThaiBenhNhan(
                benhNhan,
                TRANG_THAI_BENH_NHAN.CHO_KHAM
            );
        }

        return ketQua;
    }

    /**
     * Tìm đơn thuốc theo mã đơn, tên bệnh nhân, bác sĩ và trạng thái.
     *
     * @param {string} tuKhoa
     * @param {string} trangThai
     * @returns {Array<Object>}
     */
    function timKiemDonThuoc(tuKhoa = "", trangThai = "") {
        const ketQua = timKiemDonThuocBusiness(
            donThuocRepository.layTatCaDonThuoc(),
            tuKhoa,
            trangThai,
            benhNhanRepository.layTatCaBenhNhan()
        );

        return sapXepDonThuocMoiNhat(ketQua);
    }

    return Object.freeze({
        taoDonThuocNhap,
        layDonThuocTheoId,
        layDanhSachDonThuoc,
        themThuocVaoDon,
        xoaThuocKhoiDon,
        capNhatThongTinKham,
        luuNhapDonThuoc,
        hoanTatDonThuoc,
        huyDonThuoc,
        timKiemDonThuoc
    });
}
