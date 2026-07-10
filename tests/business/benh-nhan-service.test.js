import { beforeEach, describe, expect, it } from "vitest";
import { TRANG_THAI_BENH_NHAN, TRANG_THAI_DON_THUOC } from "../../src/js/constants/hang-so.js";
import { taoKhoLuuTru } from "../../src/js/repositories/kho-luu-tru.js";
import { taoBenhNhanRepository } from "../../src/js/repositories/benh-nhan-repository.js";
import { taoDonThuocRepository } from "../../src/js/repositories/don-thuoc-repository.js";
import { taoBenhNhanService } from "../../src/js/services/benh-nhan-service.js";
import { taoKhoLuuTruGia } from "../helpers/kho-luu-tru-gia.js";

const THOI_GIAN_CO_DINH = new Date("2026-07-10T08:30:00.000Z");

function taoDuLieuBenhNhanHopLe(ghiDe = {}) {
    return {
        hoTen: "Nguyễn Văn An",
        ngaySinh: "1995-03-15",
        gioiTinh: "Nam",
        soDienThoai: "0912345678",
        diaChi: "Quận 1",
        trieuChung: "Đau đầu",
        tienSuBenh: "Không ghi nhận",
        diUngThuoc: "Không ghi nhận",
        ...ghiDe
    };
}

function taoNguCanhKiemThu() {
    const storage = taoKhoLuuTruGia();
    const khoLuuTru = taoKhoLuuTru(storage);
    const benhNhanRepository = taoBenhNhanRepository(khoLuuTru);
    const donThuocRepository = taoDonThuocRepository(khoLuuTru);
    let thuTuId = 0;
    let thuTuMa = 0;

    const service = taoBenhNhanService({
        benhNhanRepository,
        donThuocRepository,
        taoId: () => `benh-nhan-${++thuTuId}`,
        taoMaBenhNhan: () => `BN-20260710-${String(++thuTuMa).padStart(4, "0")}`,
        layThoiGianHienTai: () => new Date(THOI_GIAN_CO_DINH)
    });

    return {
        storage,
        khoLuuTru,
        benhNhanRepository,
        donThuocRepository,
        service
    };
}

describe("Business Test dịch vụ bệnh nhân", () => {
    let nguCanh;

    beforeEach(() => {
        nguCanh = taoNguCanhKiemThu();
    });

    it("thêm bệnh nhân hợp lệ", () => {
        // Arrange
        const duLieu = taoDuLieuBenhNhanHopLe();

        // Act
        const ketQua = nguCanh.service.themBenhNhan(duLieu);

        // Assert
        expect(ketQua.hoTen).toBe("Nguyễn Văn An");
        expect(nguCanh.benhNhanRepository.layTatCaBenhNhan()).toHaveLength(1);
    });

    it("tự sinh id cho bệnh nhân mới", () => {
        // Arrange
        const duLieu = taoDuLieuBenhNhanHopLe();

        // Act
        const ketQua = nguCanh.service.themBenhNhan(duLieu);

        // Assert
        expect(ketQua.id).toBe("benh-nhan-1");
    });

    it("tự sinh mã bệnh nhân", () => {
        // Arrange
        const duLieu = taoDuLieuBenhNhanHopLe();

        // Act
        const ketQua = nguCanh.service.themBenhNhan(duLieu);

        // Assert
        expect(ketQua.maBenhNhan).toBe("BN-20260710-0001");
    });

    it("tự đặt trạng thái chờ khám", () => {
        // Arrange
        const duLieu = taoDuLieuBenhNhanHopLe({
            trangThai: TRANG_THAI_BENH_NHAN.DA_KHAM
        });

        // Act
        const ketQua = nguCanh.service.themBenhNhan(duLieu);

        // Assert
        expect(ketQua.trangThai).toBe(TRANG_THAI_BENH_NHAN.CHO_KHAM);
    });

    it("chuẩn hóa khoảng trắng trong họ tên", () => {
        // Arrange
        const duLieu = taoDuLieuBenhNhanHopLe({
            hoTen: "   Nguyễn    Văn    An   "
        });

        // Act
        const ketQua = nguCanh.service.themBenhNhan(duLieu);

        // Assert
        expect(ketQua.hoTen).toBe("Nguyễn Văn An");
    });

    it("từ chối khi thiếu họ tên", () => {
        // Arrange
        const duLieu = taoDuLieuBenhNhanHopLe({ hoTen: "   " });

        // Act
        const hanhDong = () => nguCanh.service.themBenhNhan(duLieu);

        // Assert
        expect(hanhDong).toThrow("Họ tên bệnh nhân không được để trống.");
        expect(nguCanh.benhNhanRepository.layTatCaBenhNhan()).toHaveLength(0);
    });

    it("từ chối ngày sinh tương lai", () => {
        // Arrange
        const duLieu = taoDuLieuBenhNhanHopLe({ ngaySinh: "2999-01-01" });

        // Act
        const hanhDong = () => nguCanh.service.themBenhNhan(duLieu);

        // Assert
        expect(hanhDong).toThrow("Ngày sinh không được lớn hơn ngày hiện tại.");
    });

    it("từ chối số điện thoại không hợp lệ", () => {
        // Arrange
        const duLieu = taoDuLieuBenhNhanHopLe({ soDienThoai: "123" });

        // Act
        const hanhDong = () => nguCanh.service.themBenhNhan(duLieu);

        // Assert
        expect(hanhDong).toThrow("Số điện thoại không hợp lệ.");
    });

    it("từ chối bệnh nhân trùng số điện thoại và ngày sinh", () => {
        // Arrange
        nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());
        const duLieuTrung = taoDuLieuBenhNhanHopLe({
            hoTen: "Người khác",
            soDienThoai: "+84912345678"
        });

        // Act
        const hanhDong = () => nguCanh.service.themBenhNhan(duLieuTrung);

        // Assert
        expect(hanhDong).toThrow("Bệnh nhân đã tồn tại.");
        expect(nguCanh.benhNhanRepository.layTatCaBenhNhan()).toHaveLength(1);
    });

    it("cập nhật bệnh nhân thành công", () => {
        // Arrange
        const benhNhan = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());

        // Act
        const ketQua = nguCanh.service.capNhatBenhNhan(benhNhan.id, {
            diaChi: "Quận 3",
            trieuChung: "Đã giảm đau"
        });

        // Assert
        expect(ketQua.diaChi).toBe("Quận 3");
        expect(ketQua.trieuChung).toBe("Đã giảm đau");
        expect(ketQua.id).toBe(benhNhan.id);
        expect(ketQua.maBenhNhan).toBe(benhNhan.maBenhNhan);
    });

    it("không cập nhật bệnh nhân không tồn tại", () => {
        // Arrange
        const idKhongTonTai = "khong-ton-tai";

        // Act
        const hanhDong = () => nguCanh.service.capNhatBenhNhan(
            idKhongTonTai,
            { diaChi: "Quận 5" }
        );

        // Assert
        expect(hanhDong).toThrow("Không tìm thấy bệnh nhân.");
    });

    it("tìm kiếm theo mã bệnh nhân", () => {
        // Arrange
        const benhNhan = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());
        nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe({
            hoTen: "Trần Thị Bình",
            ngaySinh: "1998-04-20",
            soDienThoai: "0987654321"
        }));

        // Act
        const ketQua = nguCanh.service.timKiemBenhNhan(benhNhan.maBenhNhan, "");

        // Assert
        expect(ketQua).toHaveLength(1);
        expect(ketQua[0].id).toBe(benhNhan.id);
    });

    it("tìm kiếm theo họ tên không phân biệt hoa thường", () => {
        // Arrange
        const benhNhan = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());

        // Act
        const ketQua = nguCanh.service.timKiemBenhNhan("NGUYỄN VĂN AN", "");

        // Assert
        expect(ketQua).toHaveLength(1);
        expect(ketQua[0].id).toBe(benhNhan.id);
    });

    it("tìm kiếm theo số điện thoại", () => {
        // Arrange
        const benhNhan = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());

        // Act
        const ketQua = nguCanh.service.timKiemBenhNhan("0912345678", "");

        // Assert
        expect(ketQua).toHaveLength(1);
        expect(ketQua[0].id).toBe(benhNhan.id);
    });

    it("lọc bệnh nhân theo trạng thái", () => {
        // Arrange
        const benhNhanChoKham = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());
        const benhNhanDangKham = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe({
            hoTen: "Trần Thị Bình",
            ngaySinh: "1998-04-20",
            soDienThoai: "0987654321"
        }));
        nguCanh.service.batDauKham(benhNhanDangKham.id);

        // Act
        const ketQua = nguCanh.service.timKiemBenhNhan(
            "",
            TRANG_THAI_BENH_NHAN.CHO_KHAM
        );

        // Assert
        expect(ketQua).toHaveLength(1);
        expect(ketQua[0].id).toBe(benhNhanChoKham.id);
    });

    it("bắt đầu khám chuyển trạng thái sang đang khám", () => {
        // Arrange
        const benhNhan = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());

        // Act
        const ketQua = nguCanh.service.batDauKham(benhNhan.id);

        // Assert
        expect(ketQua.trangThai).toBe(TRANG_THAI_BENH_NHAN.DANG_KHAM);
        expect(nguCanh.benhNhanRepository.timBenhNhanTheoId(benhNhan.id).trangThai)
            .toBe(TRANG_THAI_BENH_NHAN.DANG_KHAM);
    });

    it("không bắt đầu khám bệnh nhân đã khám", () => {
        // Arrange
        const benhNhan = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());
        nguCanh.benhNhanRepository.thayDoiTrangThaiBenhNhan(
            benhNhan.id,
            TRANG_THAI_BENH_NHAN.DA_KHAM
        );

        // Act
        const hanhDong = () => nguCanh.service.batDauKham(benhNhan.id);

        // Assert
        expect(hanhDong).toThrow("Bệnh nhân không còn ở trạng thái chờ khám.");
    });

    it("xóa bệnh nhân chưa có đơn thuốc", () => {
        // Arrange
        const benhNhan = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());

        // Act
        const ketQua = nguCanh.service.xoaBenhNhan(benhNhan.id);

        // Assert
        expect(ketQua).toBe(true);
        expect(nguCanh.benhNhanRepository.timBenhNhanTheoId(benhNhan.id)).toBeNull();
    });

    it("không xóa bệnh nhân có đơn thuốc hoàn tất", () => {
        // Arrange
        const benhNhan = nguCanh.service.themBenhNhan(taoDuLieuBenhNhanHopLe());
        nguCanh.donThuocRepository.themDonThuoc({
            id: "don-1",
            maDonThuoc: "DT-20260710-0001",
            benhNhanId: benhNhan.id,
            tenBacSi: "Bác sĩ A",
            chuanDoan: "Chẩn đoán mẫu",
            loiDan: "",
            ngayKeDon: THOI_GIAN_CO_DINH.toISOString(),
            danhSachThuoc: [],
            trangThai: TRANG_THAI_DON_THUOC.DA_HOAN_TAT
        });

        // Act
        const hanhDong = () => nguCanh.service.xoaBenhNhan(benhNhan.id);

        // Assert
        expect(hanhDong).toThrow("Không thể xóa bệnh nhân đã có đơn thuốc hoàn tất.");
        expect(nguCanh.benhNhanRepository.timBenhNhanTheoId(benhNhan.id)).not.toBeNull();
    });
});
