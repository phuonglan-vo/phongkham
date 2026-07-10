import { describe, expect, it } from "vitest";
import {
    chuyenNgaySangISO,
    dinhDangNgay,
    dinhDangNgayGio,
    laNgayTrongTuongLai,
    tinhTuoi
} from "../../src/js/utils/ngay-thang.js";

describe("Tiện ích ngày tháng", () => {
    it("nhận biết ngày trong tương lai", () => {
        // Arrange
        const ngayCanKiemTra = new Date(2026, 6, 11);
        const mocSoSanh = new Date(2026, 6, 10, 23, 59, 59);

        // Act
        const ketQua = laNgayTrongTuongLai(ngayCanKiemTra, mocSoSanh);

        // Assert
        expect(ketQua).toBe(true);
    });

    it("ngày hiện tại không phải ngày tương lai", () => {
        // Arrange
        const ngayCanKiemTra = new Date(2026, 6, 10, 23, 59, 59);
        const mocSoSanh = new Date(2026, 6, 10, 0, 0, 0);

        // Act
        const ketQua = laNgayTrongTuongLai(ngayCanKiemTra, mocSoSanh);

        // Assert
        expect(ketQua).toBe(false);
    });

    it("tính đúng tuổi khi chưa đến sinh nhật", () => {
        // Arrange
        const ngaySinh = new Date(2000, 9, 20);
        const ngayHienTai = new Date(2026, 6, 10);

        // Act
        const ketQua = tinhTuoi(ngaySinh, ngayHienTai);

        // Assert
        expect(ketQua).toBe(25);
    });

    it("tính đúng tuổi khi đã qua sinh nhật", () => {
        // Arrange
        const ngaySinh = new Date(2000, 2, 5);
        const ngayHienTai = new Date(2026, 6, 10);

        // Act
        const ketQua = tinhTuoi(ngaySinh, ngayHienTai);

        // Assert
        expect(ketQua).toBe(26);
    });

    it("xử lý ngày không hợp lệ một cách an toàn", () => {
        // Arrange
        const giaTriKhongHopLe = "khong-phai-ngay";

        // Act
        const ngayDinhDang = dinhDangNgay(giaTriKhongHopLe);
        const ngayGioDinhDang = dinhDangNgayGio(giaTriKhongHopLe);
        const ngayISO = chuyenNgaySangISO(giaTriKhongHopLe);
        const tuoi = tinhTuoi(giaTriKhongHopLe, new Date(2026, 6, 10));
        const laTuongLai = laNgayTrongTuongLai(
            giaTriKhongHopLe,
            new Date(2026, 6, 10)
        );

        // Assert
        expect(ngayDinhDang).toBe("");
        expect(ngayGioDinhDang).toBe("");
        expect(ngayISO).toBe("");
        expect(tuoi).toBeNull();
        expect(laTuongLai).toBe(false);
    });

    it("định dạng ngày đúng", () => {
        // Arrange
        const ngay = new Date(2026, 6, 10, 8, 5, 0);

        // Act
        const ketQuaNgay = dinhDangNgay(ngay);
        const ketQuaNgayGio = dinhDangNgayGio(ngay);
        const ketQuaISO = chuyenNgaySangISO(ngay);

        // Assert
        expect(ketQuaNgay).toBe("10/07/2026");
        expect(ketQuaNgayGio).toBe("10/07/2026 08:05");
        expect(ketQuaISO).toBe("2026-07-10");
    });

    it("trả về null khi ngày sinh nằm sau ngày hiện tại", () => {
        // Arrange
        const ngaySinh = new Date(2026, 6, 11);
        const ngayHienTai = new Date(2026, 6, 10);

        // Act
        const ketQua = tinhTuoi(ngaySinh, ngayHienTai);

        // Assert
        expect(ketQua).toBeNull();
    });
});
