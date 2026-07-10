import { describe, expect, it } from "vitest";
import {
    taoMaBenhNhan,
    taoMaDonThuoc
} from "../../src/js/utils/ma.js";

describe("Tiện ích sinh mã", () => {
    it("tạo mã bệnh nhân đúng định dạng", () => {
        // Arrange
        const thoiGian = new Date(2026, 6, 10, 8, 30, 0);

        // Act
        const ketQua = taoMaBenhNhan({
            thoiGian,
            ngauNhien: 27
        });

        // Assert
        expect(ketQua).toBe("BN-20260710-0027");
        expect(ketQua).toMatch(/^BN-\d{8}-\d{4}$/);
    });

    it("tạo mã đơn thuốc đúng định dạng", () => {
        // Arrange
        const thoiGian = new Date(2026, 11, 5, 14, 45, 0);

        // Act
        const ketQua = taoMaDonThuoc({
            thoiGian,
            ngauNhien: 9123
        });

        // Assert
        expect(ketQua).toBe("DT-20261205-9123");
        expect(ketQua).toMatch(/^DT-\d{8}-\d{4}$/);
    });

    it("cùng đầu vào xác định cho cùng kết quả", () => {
        // Arrange
        const tuyChon = {
            thoiGian: new Date(2025, 0, 2, 10, 0, 0),
            ngauNhien: 8
        };

        // Act
        const ketQuaLanMot = taoMaBenhNhan(tuyChon);
        const ketQuaLanHai = taoMaBenhNhan(tuyChon);

        // Assert
        expect(ketQuaLanMot).toBe(ketQuaLanHai);
        expect(ketQuaLanMot).toBe("BN-20250102-0008");
    });

    it("mã bệnh nhân bắt đầu bằng BN", () => {
        // Arrange
        const tuyChon = {
            thoiGian: new Date(2024, 8, 9),
            ngauNhien: 1
        };

        // Act
        const ketQua = taoMaBenhNhan(tuyChon);

        // Assert
        expect(ketQua.startsWith("BN-")).toBe(true);
    });

    it("mã đơn thuốc bắt đầu bằng DT", () => {
        // Arrange
        const tuyChon = {
            thoiGian: new Date(2024, 8, 9),
            ngauNhien: 1
        };

        // Act
        const ketQua = taoMaDonThuoc(tuyChon);

        // Assert
        expect(ketQua.startsWith("DT-")).toBe(true);
    });
});
