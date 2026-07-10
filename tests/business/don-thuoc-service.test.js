import { beforeEach, describe, expect, it } from "vitest";
import { TRANG_THAI_BENH_NHAN, TRANG_THAI_DON_THUOC } from "../../src/js/constants/hang-so.js";
import { taoKhoLuuTru } from "../../src/js/repositories/kho-luu-tru.js";
import { taoBenhNhanRepository } from "../../src/js/repositories/benh-nhan-repository.js";
import { taoDonThuocRepository } from "../../src/js/repositories/don-thuoc-repository.js";
import { taoDonThuocService } from "../../src/js/services/don-thuoc-service.js";
import { taoKhoLuuTruGia } from "../helpers/kho-luu-tru-gia.js";

const THOI_GIAN_CO_DINH = new Date("2026-07-10T09:00:00.000Z");

function taoBenhNhanMau(ghiDe = {}) {
    return {
        id: "benh-nhan-1",
        maBenhNhan: "BN-20260710-0001",
        hoTen: "Nguyễn Văn An",
        ngaySinh: "1995-03-15",
        gioiTinh: "Nam",
        soDienThoai: "0912345678",
        diaChi: "Quận 1",
        trieuChung: "Đau đầu",
        tienSuBenh: "Không ghi nhận",
        diUngThuoc: "Không ghi nhận",
        trangThai: TRANG_THAI_BENH_NHAN.CHO_KHAM,
        ngayTiepNhan: THOI_GIAN_CO_DINH.toISOString(),
        ngayCapNhat: THOI_GIAN_CO_DINH.toISOString(),
        ...ghiDe
    };
}

function taoThuocHopLe(ghiDe = {}) {
    return {
        tenThuoc: "Thuoc mau A",
        hamLuong: "100 mg",
        donVi: "Viên",
        soLuongMoiLan: 2,
        soLanMoiNgay: 3,
        soNgayDung: 5,
        cachDung: "Dùng theo hướng dẫn",
        thoiDiemDung: "Sau ăn",
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

    const service = taoDonThuocService({
        donThuocRepository,
        benhNhanRepository,
        taoId: () => `id-${++thuTuId}`,
        taoMaDonThuoc: () => `DT-20260710-${String(++thuTuMa).padStart(4, "0")}`,
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

function themBenhNhanChoKham(nguCanh, ghiDe = {}) {
    return nguCanh.benhNhanRepository.themBenhNhan(
        taoBenhNhanMau(ghiDe)
    );
}

function taoDonNhapCoThuocHopLe(nguCanh, thongTinKham = {}) {
    const benhNhan = themBenhNhanChoKham(nguCanh);
    let donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {
        tenBacSi: "Bác sĩ A",
        chuanDoan: "Chẩn đoán mẫu",
        loiDan: "Theo dõi thêm",
        ...thongTinKham
    });
    donThuoc = nguCanh.service.themThuocVaoDon(
        donThuoc.id,
        taoThuocHopLe()
    );

    return { benhNhan, donThuoc };
}

describe("Business Test dịch vụ đơn thuốc", () => {
    let nguCanh;

    beforeEach(() => {
        nguCanh = taoNguCanhKiemThu();
    });

    it("tạo đơn nháp cho bệnh nhân chờ khám", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);

        // Act
        const ketQua = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Assert
        expect(ketQua.trangThai).toBe(TRANG_THAI_DON_THUOC.NHAP);
        expect(ketQua.benhNhanId).toBe(benhNhan.id);
        expect(nguCanh.donThuocRepository.layTatCaDonThuoc()).toHaveLength(1);
    });

    it("chuyển bệnh nhân sang đang khám khi tạo đơn nháp", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);

        // Act
        nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Assert
        expect(nguCanh.benhNhanRepository.timBenhNhanTheoId(benhNhan.id).trangThai)
            .toBe(TRANG_THAI_BENH_NHAN.DANG_KHAM);
    });

    it("không tạo đơn cho bệnh nhân không tồn tại", () => {
        // Arrange
        const benhNhanId = "khong-ton-tai";

        // Act
        const hanhDong = () => nguCanh.service.taoDonThuocNhap(benhNhanId, {});

        // Assert
        expect(hanhDong).toThrow("Không tìm thấy bệnh nhân.");
    });

    it("không tạo đơn cho bệnh nhân đã khám", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh, {
            trangThai: TRANG_THAI_BENH_NHAN.DA_KHAM
        });

        // Act
        const hanhDong = () => nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Assert
        expect(hanhDong).toThrow("Bệnh nhân không ở trạng thái có thể lập đơn thuốc.");
    });

    it("thêm thuốc hợp lệ", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const ketQua = nguCanh.service.themThuocVaoDon(
            donThuoc.id,
            taoThuocHopLe()
        );

        // Assert
        expect(ketQua.danhSachThuoc).toHaveLength(1);
        expect(ketQua.danhSachThuoc[0].tenThuoc).toBe("Thuoc mau A");
    });

    it("từ chối thuốc thiếu tên", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const hanhDong = () => nguCanh.service.themThuocVaoDon(
            donThuoc.id,
            taoThuocHopLe({ tenThuoc: "" })
        );

        // Assert
        expect(hanhDong).toThrow("Tên thuốc là bắt buộc.");
    });

    it("từ chối số lượng thuốc không hợp lệ", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const hanhDong = () => nguCanh.service.themThuocVaoDon(
            donThuoc.id,
            taoThuocHopLe({ soLuongMoiLan: 0 })
        );

        // Assert
        expect(hanhDong).toThrow("Số lượng mỗi lần phải lớn hơn 0.");
    });

    it("tính đúng tổng số lượng thuốc", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const ketQua = nguCanh.service.themThuocVaoDon(
            donThuoc.id,
            taoThuocHopLe({
                soLuongMoiLan: 2,
                soLanMoiNgay: 3,
                soNgayDung: 5
            })
        );

        // Assert
        expect(ketQua.danhSachThuoc[0].tongSoLuong).toBe(30);
    });

    it("xóa thuốc khỏi đơn nháp", () => {
        // Arrange
        const { donThuoc } = taoDonNhapCoThuocHopLe(nguCanh);
        const thuocId = donThuoc.danhSachThuoc[0].id;

        // Act
        const ketQua = nguCanh.service.xoaThuocKhoiDon(donThuoc.id, thuocId);

        // Assert
        expect(ketQua.danhSachThuoc).toHaveLength(0);
    });

    it("cập nhật tên bác sĩ", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const ketQua = nguCanh.service.capNhatThongTinKham(donThuoc.id, {
            tenBacSi: "  Bác sĩ Nguyễn Văn B  ",
            chuanDoan: "",
            loiDan: ""
        });

        // Assert
        expect(ketQua.tenBacSi).toBe("Bác sĩ Nguyễn Văn B");
    });

    it("cập nhật chẩn đoán", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const ketQua = nguCanh.service.capNhatThongTinKham(donThuoc.id, {
            tenBacSi: "Bác sĩ A",
            chuanDoan: "  Chẩn đoán đã cập nhật  ",
            loiDan: ""
        });

        // Assert
        expect(ketQua.chuanDoan).toBe("Chẩn đoán đã cập nhật");
    });

    it("lưu đơn nháp", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const ketQua = nguCanh.service.luuNhapDonThuoc(donThuoc.id);

        // Assert
        expect(ketQua.trangThai).toBe(TRANG_THAI_DON_THUOC.NHAP);
        expect(nguCanh.donThuocRepository.timDonThuocTheoId(donThuoc.id).trangThai)
            .toBe(TRANG_THAI_DON_THUOC.NHAP);
    });

    it("không hoàn tất đơn không có thuốc", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {
            tenBacSi: "Bác sĩ A",
            chuanDoan: "Chẩn đoán mẫu"
        });

        // Act
        const hanhDong = () => nguCanh.service.hoanTatDonThuoc(donThuoc.id);

        // Assert
        expect(hanhDong).toThrow("Đơn thuốc phải có ít nhất một loại thuốc.");
    });

    it("không hoàn tất đơn thiếu bác sĩ", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        let donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {
            tenBacSi: "",
            chuanDoan: "Chẩn đoán mẫu"
        });
        donThuoc = nguCanh.service.themThuocVaoDon(donThuoc.id, taoThuocHopLe());

        // Act
        const hanhDong = () => nguCanh.service.hoanTatDonThuoc(donThuoc.id);

        // Assert
        expect(hanhDong).toThrow("Tên bác sĩ là bắt buộc.");
    });

    it("không hoàn tất đơn thiếu chẩn đoán", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        let donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {
            tenBacSi: "Bác sĩ A",
            chuanDoan: ""
        });
        donThuoc = nguCanh.service.themThuocVaoDon(donThuoc.id, taoThuocHopLe());

        // Act
        const hanhDong = () => nguCanh.service.hoanTatDonThuoc(donThuoc.id);

        // Assert
        expect(hanhDong).toThrow("Chẩn đoán là bắt buộc.");
    });

    it("hoàn tất đơn hợp lệ", () => {
        // Arrange
        const { donThuoc } = taoDonNhapCoThuocHopLe(nguCanh);

        // Act
        const ketQua = nguCanh.service.hoanTatDonThuoc(donThuoc.id);

        // Assert
        expect(ketQua.trangThai).toBe(TRANG_THAI_DON_THUOC.DA_HOAN_TAT);
        expect(nguCanh.donThuocRepository.timDonThuocTheoId(donThuoc.id).trangThai)
            .toBe(TRANG_THAI_DON_THUOC.DA_HOAN_TAT);
    });

    it("chuyển bệnh nhân sang đã khám khi hoàn tất đơn", () => {
        // Arrange
        const { benhNhan, donThuoc } = taoDonNhapCoThuocHopLe(nguCanh);

        // Act
        nguCanh.service.hoanTatDonThuoc(donThuoc.id);

        // Assert
        expect(nguCanh.benhNhanRepository.timBenhNhanTheoId(benhNhan.id).trangThai)
            .toBe(TRANG_THAI_BENH_NHAN.DA_KHAM);
    });

    it("không sửa đơn đã hoàn tất", () => {
        // Arrange
        const { donThuoc } = taoDonNhapCoThuocHopLe(nguCanh);
        nguCanh.service.hoanTatDonThuoc(donThuoc.id);

        // Act
        const hanhDong = () => nguCanh.service.capNhatThongTinKham(donThuoc.id, {
            tenBacSi: "Bác sĩ khác",
            chuanDoan: "Chẩn đoán khác"
        });

        // Assert
        expect(hanhDong).toThrow("Không thể sửa đơn thuốc đã hoàn tất.");
    });

    it("không hủy đơn đã hoàn tất", () => {
        // Arrange
        const { donThuoc } = taoDonNhapCoThuocHopLe(nguCanh);
        nguCanh.service.hoanTatDonThuoc(donThuoc.id);

        // Act
        const hanhDong = () => nguCanh.service.huyDonThuoc(donThuoc.id);

        // Assert
        expect(hanhDong).toThrow("Không thể hủy đơn thuốc đã hoàn tất.");
    });

    it("hủy đơn nháp", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const ketQua = nguCanh.service.huyDonThuoc(donThuoc.id);

        // Assert
        expect(ketQua.trangThai).toBe(TRANG_THAI_DON_THUOC.DA_HUY);
    });

    it("đưa bệnh nhân trở về chờ khám khi hủy đơn nháp", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        nguCanh.service.huyDonThuoc(donThuoc.id);

        // Assert
        expect(nguCanh.benhNhanRepository.timBenhNhanTheoId(benhNhan.id).trangThai)
            .toBe(TRANG_THAI_BENH_NHAN.CHO_KHAM);
    });

    it("tìm kiếm theo mã đơn", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const ketQua = nguCanh.service.timKiemDonThuoc(donThuoc.maDonThuoc, "");

        // Assert
        expect(ketQua).toHaveLength(1);
        expect(ketQua[0].id).toBe(donThuoc.id);
    });

    it("tìm kiếm theo tên bệnh nhân", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {});

        // Act
        const ketQua = nguCanh.service.timKiemDonThuoc("NGUYEN VAN AN", "");

        // Assert
        expect(ketQua).toHaveLength(1);
        expect(ketQua[0].id).toBe(donThuoc.id);
    });

    it("tìm kiếm theo tên bác sĩ", () => {
        // Arrange
        const benhNhan = themBenhNhanChoKham(nguCanh);
        const donThuoc = nguCanh.service.taoDonThuocNhap(benhNhan.id, {
            tenBacSi: "Bác sĩ Trần Minh",
            chuanDoan: "Chẩn đoán mẫu"
        });

        // Act
        const ketQua = nguCanh.service.timKiemDonThuoc("tran minh", "");

        // Assert
        expect(ketQua).toHaveLength(1);
        expect(ketQua[0].id).toBe(donThuoc.id);
    });

    it("lọc theo trạng thái đơn", () => {
        // Arrange
        const benhNhanMot = themBenhNhanChoKham(nguCanh);
        const donNhap = nguCanh.service.taoDonThuocNhap(benhNhanMot.id, {});

        const benhNhanHai = taoBenhNhanMau({
            id: "benh-nhan-2",
            maBenhNhan: "BN-20260710-0002",
            hoTen: "Trần Thị Bình",
            ngaySinh: "1998-04-20",
            soDienThoai: "0987654321"
        });
        nguCanh.benhNhanRepository.themBenhNhan(benhNhanHai);
        const donHuy = nguCanh.service.taoDonThuocNhap(benhNhanHai.id, {});
        nguCanh.service.huyDonThuoc(donHuy.id);

        // Act
        const ketQua = nguCanh.service.timKiemDonThuoc(
            "",
            TRANG_THAI_DON_THUOC.NHAP
        );

        // Assert
        expect(ketQua).toHaveLength(1);
        expect(ketQua[0].id).toBe(donNhap.id);
    });
});
