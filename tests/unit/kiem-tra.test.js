import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi
} from "vitest";
import {
    kiemTraBenhNhan,
    kiemTraThongTinKham,
    kiemTraThuocTrongDon,
    laChuoiRong
} from "../../src/js/utils/kiem-tra.js";

describe("Kiểm tra dữ liệu bệnh nhân", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 6, 10, 12, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("phát hiện họ tên rỗng", () => {
        // Arrange
        const benhNhan = {
            hoTen: "",
            ngaySinh: "2000-01-01",
            soDienThoai: "0912345678"
        };

        // Act
        const ketQua = kiemTraBenhNhan(benhNhan);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.hoTen).toBe("Họ tên bệnh nhân là bắt buộc.");
    });

    it("phát hiện họ tên chỉ có khoảng trắng", () => {
        // Arrange
        const benhNhan = {
            hoTen: "   \t  ",
            ngaySinh: "2000-01-01",
            soDienThoai: "0912345678"
        };

        // Act
        const ketQua = kiemTraBenhNhan(benhNhan);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.hoTen).toBe("Họ tên bệnh nhân là bắt buộc.");
        expect(laChuoiRong(benhNhan.hoTen)).toBe(true);
    });

    it("phát hiện ngày sinh ở tương lai", () => {
        // Arrange
        const benhNhan = {
            hoTen: "Nguyễn Văn An",
            ngaySinh: "2026-07-11",
            soDienThoai: "0912345678"
        };

        // Act
        const ketQua = kiemTraBenhNhan(benhNhan);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.ngaySinh).toBe(
            "Ngày sinh không được lớn hơn ngày hiện tại."
        );
    });

    it("phát hiện số điện thoại không hợp lệ", () => {
        // Arrange
        const benhNhan = {
            hoTen: "Nguyễn Văn An",
            ngaySinh: "2000-01-01",
            soDienThoai: "0123"
        };

        // Act
        const ketQua = kiemTraBenhNhan(benhNhan);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.soDienThoai).toBe("Số điện thoại không hợp lệ.");
    });

    it("chấp nhận bệnh nhân hợp lệ", () => {
        // Arrange
        const benhNhan = {
            hoTen: "  Nguyễn   Văn   An  ",
            ngaySinh: "2000-01-01",
            soDienThoai: "0912 345 678",
            diaChi: "Hà Nội",
            trieuChung: "Đau đầu",
            tienSuBenh: "",
            diUngThuoc: null
        };

        // Act
        const ketQua = kiemTraBenhNhan(benhNhan);

        // Assert
        expect(ketQua).toEqual({
            hopLe: true,
            loi: {}
        });
    });

    it("xử lý dữ liệu bệnh nhân undefined an toàn", () => {
        // Arrange
        const benhNhan = undefined;

        // Act
        const ketQua = kiemTraBenhNhan(benhNhan);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi).toMatchObject({
            hoTen: "Họ tên bệnh nhân là bắt buộc.",
            ngaySinh: "Ngày sinh là bắt buộc.",
            soDienThoai: "Số điện thoại là bắt buộc."
        });
    });
});

describe("Kiểm tra thông tin khám", () => {
    it("phát hiện tên bác sĩ rỗng", () => {
        // Arrange
        const thongTinKham = {
            tenBacSi: "",
            chuanDoan: "Cảm nhẹ"
        };

        // Act
        const ketQua = kiemTraThongTinKham(thongTinKham);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.tenBacSi).toBe("Tên bác sĩ là bắt buộc.");
    });

    it("phát hiện chẩn đoán rỗng", () => {
        // Arrange
        const thongTinKham = {
            tenBacSi: "Bác sĩ Minh",
            chuanDoan: "   "
        };

        // Act
        const ketQua = kiemTraThongTinKham(thongTinKham);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.chuanDoan).toBe("Chẩn đoán là bắt buộc.");
    });
});

describe("Kiểm tra thuốc trong đơn", () => {
    it("phát hiện tên thuốc rỗng", () => {
        // Arrange
        const thuoc = {
            tenThuoc: null,
            soLuongMoiLan: 1,
            soLanMoiNgay: 2,
            soNgayDung: 3
        };

        // Act
        const ketQua = kiemTraThuocTrongDon(thuoc);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.tenThuoc).toBe("Tên thuốc là bắt buộc.");
    });

    it("từ chối số lượng mỗi lần bằng 0", () => {
        // Arrange
        const thuoc = {
            tenThuoc: "Thuoc mau A",
            soLuongMoiLan: 0,
            soLanMoiNgay: 2,
            soNgayDung: 3
        };

        // Act
        const ketQua = kiemTraThuocTrongDon(thuoc);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.soLuongMoiLan).toBe(
            "Số lượng mỗi lần phải lớn hơn 0."
        );
    });

    it("từ chối số lần mỗi ngày âm", () => {
        // Arrange
        const thuoc = {
            tenThuoc: "Thuoc mau A",
            soLuongMoiLan: 1,
            soLanMoiNgay: -1,
            soNgayDung: 3
        };

        // Act
        const ketQua = kiemTraThuocTrongDon(thuoc);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.soLanMoiNgay).toBe(
            "Số lần mỗi ngày phải lớn hơn 0."
        );
    });

    it("từ chối số ngày dùng không phải số", () => {
        // Arrange
        const thuoc = {
            tenThuoc: "Thuoc mau A",
            soLuongMoiLan: 1,
            soLanMoiNgay: 2,
            soNgayDung: "abc"
        };

        // Act
        const ketQua = kiemTraThuocTrongDon(thuoc);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.soNgayDung).toBe("Số ngày dùng phải lớn hơn 0.");
    });

    it("chấp nhận thuốc hợp lệ ở biên nhỏ nhất lớn hơn 0", () => {
        // Arrange
        const thuoc = {
            tenThuoc: "Thuoc mau A",
            soLuongMoiLan: 0.5,
            soLanMoiNgay: 1,
            soNgayDung: 1
        };

        // Act
        const ketQua = kiemTraThuocTrongDon(thuoc);

        // Assert
        expect(ketQua).toEqual({
            hopLe: true,
            loi: {}
        });
    });

    it("từ chối chuỗi rỗng ở trường số", () => {
        // Arrange
        const thuoc = {
            tenThuoc: "Thuoc mau A",
            soLuongMoiLan: "",
            soLanMoiNgay: 1,
            soNgayDung: 1
        };

        // Act
        const ketQua = kiemTraThuocTrongDon(thuoc);

        // Assert
        expect(ketQua.hopLe).toBe(false);
        expect(ketQua.loi.soLuongMoiLan).toBeDefined();
    });
});
