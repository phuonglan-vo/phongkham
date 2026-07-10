import { describe, expect, it } from "vitest";
import { TRANG_THAI_DON_THUOC } from "../../src/js/constants/hang-so.js";
import {
    coTheSuaDonThuoc,
    kiemTraDonThuocCoTheHoanTat,
    themThuocVaoDanhSach,
    tinhTongSoLuongThuoc,
    xoaThuocKhoiDanhSach
} from "../../src/js/business/don-thuoc-business.js";

function taoThuocHopLe(ghiDe = {}) {
    return {
        id: "thuoc-1",
        tenThuoc: "Thuoc mau A",
        hamLuong: "100 mg",
        donVi: "viên",
        soLuongMoiLan: 1,
        soLanMoiNgay: 2,
        soNgayDung: 3,
        tongSoLuong: 6,
        cachDung: "Dùng theo hướng dẫn đã nhập",
        thoiDiemDung: "Sau ăn",
        ...ghiDe
    };
}

function taoDonThuocHopLe(ghiDe = {}) {
    return {
        id: "don-1",
        maDonThuoc: "DT-20260710-0001",
        benhNhanId: "benh-nhan-1",
        tenBacSi: "Bác sĩ Minh",
        chuanDoan: "Chẩn đoán mẫu",
        loiDan: "Theo dõi tình trạng",
        ngayKeDon: "2026-07-10T08:00:00.000Z",
        danhSachThuoc: [taoThuocHopLe()],
        trangThai: TRANG_THAI_DON_THUOC.NHAP,
        ...ghiDe
    };
}

describe("Tính tổng số lượng thuốc", () => {
    it("tính tổng số lượng thuốc đúng", () => {
        // Arrange
        const soLuongMoiLan = 1.5;
        const soLanMoiNgay = 2;
        const soNgayDung = 4;

        // Act
        const ketQua = tinhTongSoLuongThuoc(
            soLuongMoiLan,
            soLanMoiNgay,
            soNgayDung
        );

        // Assert
        expect(ketQua).toBe(12);
    });

    it("từ chối số lượng mỗi lần bằng 0", () => {
        // Arrange
        const duLieu = [0, 2, 3];

        // Act
        const hanhDong = () => tinhTongSoLuongThuoc(...duLieu);

        // Assert
        expect(hanhDong).toThrowError(
            "Các thông tin liều dùng phải là số lớn hơn 0."
        );
    });

    it("từ chối số lần mỗi ngày âm", () => {
        // Arrange
        const duLieu = [1, -2, 3];

        // Act
        const hanhDong = () => tinhTongSoLuongThuoc(...duLieu);

        // Assert
        expect(hanhDong).toThrow(RangeError);
    });

    it("từ chối số ngày dùng bằng 0", () => {
        // Arrange
        const duLieu = [1, 2, 0];

        // Act
        const hanhDong = () => tinhTongSoLuongThuoc(...duLieu);

        // Assert
        expect(hanhDong).toThrow(RangeError);
    });

    it.each([
        [null, 1, 1],
        [undefined, 1, 1],
        ["", 1, 1],
        [1, "khong-phai-so", 1]
    ])("từ chối dữ liệu không hợp lệ %j, %j, %j", (a, b, c) => {
        // Arrange
        const duLieu = [a, b, c];

        // Act
        const hanhDong = () => tinhTongSoLuongThuoc(...duLieu);

        // Assert
        expect(hanhDong).toThrow(RangeError);
    });
});

describe("Thao tác danh sách thuốc", () => {
    it("không làm thay đổi object đầu vào khi thêm thuốc", () => {
        // Arrange
        const thuocCu = taoThuocHopLe({ id: "thuoc-cu" });
        const thuocMoi = taoThuocHopLe({ id: "thuoc-moi" });
        const danhSachBanDau = [thuocCu];
        const banSaoDanhSach = structuredClone(danhSachBanDau);
        const banSaoThuocMoi = structuredClone(thuocMoi);

        // Act
        const ketQua = themThuocVaoDanhSach(danhSachBanDau, thuocMoi);
        ketQua[0].tenThuoc = "Đã thay đổi trong kết quả";
        ketQua[1].tenThuoc = "Đã thay đổi thuốc mới trong kết quả";

        // Assert
        expect(danhSachBanDau).toEqual(banSaoDanhSach);
        expect(thuocMoi).toEqual(banSaoThuocMoi);
        expect(ketQua).not.toBe(danhSachBanDau);
        expect(ketQua[0]).not.toBe(thuocCu);
        expect(ketQua[1]).not.toBe(thuocMoi);
    });

    it("thêm thuốc vào danh sách", () => {
        // Arrange
        const danhSachBanDau = [taoThuocHopLe({ id: "thuoc-1" })];
        const thuocMoi = taoThuocHopLe({ id: "thuoc-2" });

        // Act
        const ketQua = themThuocVaoDanhSach(danhSachBanDau, thuocMoi);

        // Assert
        expect(ketQua).toHaveLength(2);
        expect(ketQua.map((thuoc) => thuoc.id)).toEqual([
            "thuoc-1",
            "thuoc-2"
        ]);
        expect(danhSachBanDau).toHaveLength(1);
    });

    it("xóa thuốc khỏi danh sách", () => {
        // Arrange
        const danhSachBanDau = [
            taoThuocHopLe({ id: "thuoc-1" }),
            taoThuocHopLe({ id: "thuoc-2", tenThuoc: "Thuoc mau B" })
        ];

        // Act
        const ketQua = xoaThuocKhoiDanhSach(danhSachBanDau, "thuoc-1");

        // Assert
        expect(ketQua).toHaveLength(1);
        expect(ketQua[0].id).toBe("thuoc-2");
        expect(danhSachBanDau).toHaveLength(2);
        expect(ketQua[0]).not.toBe(danhSachBanDau[1]);
    });

    it("xóa với id không tồn tại trả về bản sao tương đương", () => {
        // Arrange
        const danhSachBanDau = [taoThuocHopLe()];

        // Act
        const ketQua = xoaThuocKhoiDanhSach(
            danhSachBanDau,
            "khong-ton-tai"
        );

        // Assert
        expect(ketQua).toEqual(danhSachBanDau);
        expect(ketQua).not.toBe(danhSachBanDau);
        expect(ketQua[0]).not.toBe(danhSachBanDau[0]);
    });
});

describe("Kiểm tra khả năng hoàn tất đơn thuốc", () => {
    it("đơn không có thuốc không thể hoàn tất", () => {
        // Arrange
        const donThuoc = taoDonThuocHopLe({ danhSachThuoc: [] });

        // Act
        const ketQua = kiemTraDonThuocCoTheHoanTat(donThuoc);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.danhSachThuoc).toBe(
            "Đơn thuốc phải có ít nhất một loại thuốc."
        );
    });

    it("đơn thiếu bác sĩ không thể hoàn tất", () => {
        // Arrange
        const donThuoc = taoDonThuocHopLe({ tenBacSi: "   " });

        // Act
        const ketQua = kiemTraDonThuocCoTheHoanTat(donThuoc);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.tenBacSi).toBe("Tên bác sĩ là bắt buộc.");
    });

    it("đơn thiếu chẩn đoán không thể hoàn tất", () => {
        // Arrange
        const donThuoc = taoDonThuocHopLe({ chuanDoan: undefined });

        // Act
        const ketQua = kiemTraDonThuocCoTheHoanTat(donThuoc);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.chuanDoan).toBe("Chẩn đoán là bắt buộc.");
    });

    it("đơn hợp lệ có thể hoàn tất", () => {
        // Arrange
        const donThuoc = taoDonThuocHopLe();

        // Act
        const ketQua = kiemTraDonThuocCoTheHoanTat(donThuoc);

        // Assert
        expect(ketQua).toEqual({
            hopLe: true,
            loi: {}
        });
    });

    it("từ chối đơn có tổng số lượng không khớp liều dùng", () => {
        // Arrange
        const donThuoc = taoDonThuocHopLe({
            danhSachThuoc: [taoThuocHopLe({ tongSoLuong: 999 })]
        });

        // Act
        const ketQua = kiemTraDonThuocCoTheHoanTat(donThuoc);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi["danhSachThuoc.0.tongSoLuong"]).toBe(
            "Tổng số lượng thuốc không đúng với liều dùng."
        );
    });
});

describe("Kiểm tra khả năng sửa đơn thuốc", () => {
    it("đơn đã hoàn tất không thể sửa", () => {
        // Arrange
        const donThuoc = taoDonThuocHopLe({
            trangThai: TRANG_THAI_DON_THUOC.DA_HOAN_TAT
        });

        // Act
        const ketQua = coTheSuaDonThuoc(donThuoc);

        // Assert
        expect(ketQua).toBe(false);
    });

    it("đơn đã hủy không thể sửa", () => {
        // Arrange
        const donThuoc = taoDonThuocHopLe({
            trangThai: TRANG_THAI_DON_THUOC.DA_HUY
        });

        // Act
        const ketQua = coTheSuaDonThuoc(donThuoc);

        // Assert
        expect(ketQua).toBe(false);
    });

    it("đơn nháp có thể sửa", () => {
        // Arrange
        const donThuoc = taoDonThuocHopLe();

        // Act
        const ketQua = coTheSuaDonThuoc(donThuoc);

        // Assert
        expect(ketQua).toBe(true);
    });

    it("dữ liệu null không thể sửa", () => {
        // Arrange
        const donThuoc = null;

        // Act
        const ketQua = coTheSuaDonThuoc(donThuoc);

        // Assert
        expect(ketQua).toBe(false);
    });
});
