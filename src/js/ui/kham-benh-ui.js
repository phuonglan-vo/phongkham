import {
    TRANG_THAI_BENH_NHAN,
    TRANG_THAI_DON_THUOC
} from "../constants/hang-so.js";
import { tinhTongSoLuongThuoc } from "../business/don-thuoc-business.js";
import { dinhDangNgay } from "../utils/ngay-thang.js";
import {
    hienThiLoiForm,
    hienThiThongBaoCanhBao,
    hienThiThongBaoLoi,
    hienThiThongBaoThanhCong,
    xacNhanThaoTac,
    xoaLoiForm
} from "./thong-bao-ui.js";

/**
 * Tạo module UI khám bệnh và kê đơn.
 *
 * @param {Object} tuyChon
 * @param {Object} tuyChon.benhNhanService
 * @param {Object} tuyChon.donThuocService
 * @param {(tenKhuVuc: string) => void} [tuyChon.moKhuVuc]
 * @param {() => void} [tuyChon.khiDuLieuThayDoi]
 * @returns {Object}
 */
export function khoiTaoKhamBenhUI({
    benhNhanService,
    donThuocService,
    moKhuVuc = () => {},
    khiDuLieuThayDoi = () => {}
}) {
    const formKham = document.getElementById("form-kham-benh");
    const formThuoc = document.getElementById("form-thuoc");
    const thanBangThuoc = document.querySelector("#danh-sach-thuoc tbody");
    let benhNhanDangKham = null;
    let donThuocDangSua = null;

    if (!formKham || !formThuoc || !thanBangThuoc) {
        throw new Error("Không tìm thấy đầy đủ giao diện khám bệnh.");
    }

    function ganNoiDung(id, noiDung) {
        const phanTu = document.getElementById(id);
        if (phanTu) {
            phanTu.textContent = noiDung || "-";
        }
    }

    function docThongTinKham() {
        return {
            tenBacSi: document.getElementById("ten-bac-si").value,
            chuanDoan: document.getElementById("chuan-doan").value,
            loiDan: document.getElementById("loi-dan").value
        };
    }

    function docDuLieuThuoc() {
        return {
            tenThuoc: document.getElementById("ten-thuoc").value,
            hamLuong: document.getElementById("ham-luong").value,
            donVi: document.getElementById("don-vi").value,
            soLuongMoiLan: document.getElementById("so-luong-moi-lan").value,
            soLanMoiNgay: document.getElementById("so-lan-moi-ngay").value,
            soNgayDung: document.getElementById("so-ngay-dung").value,
            cachDung: document.getElementById("cach-dung").value,
            thoiDiemDung: document.getElementById("thoi-diem-dung").value
        };
    }

    function dienThongTinKham(donThuoc) {
        document.getElementById("ten-bac-si").value = donThuoc?.tenBacSi ?? "";
        document.getElementById("chuan-doan").value = donThuoc?.chuanDoan ?? "";
        document.getElementById("loi-dan").value = donThuoc?.loiDan ?? "";
    }

    function hienThiBenhNhanDangKham() {
        const benhNhan = benhNhanDangKham;
        ganNoiDung("chi-tiet-ma-benh-nhan", benhNhan?.maBenhNhan);
        ganNoiDung("chi-tiet-ho-ten", benhNhan?.hoTen);
        ganNoiDung("chi-tiet-ngay-sinh", dinhDangNgay(benhNhan?.ngaySinh));
        ganNoiDung("chi-tiet-so-dien-thoai", benhNhan?.soDienThoai);
        ganNoiDung("chi-tiet-trieu-chung", benhNhan?.trieuChung);
        ganNoiDung("chi-tiet-tien-su-benh", benhNhan?.tienSuBenh);
        ganNoiDung("chi-tiet-di-ung-thuoc", benhNhan?.diUngThuoc);
    }

    function taoO(noiDung, nhan) {
        const o = document.createElement("td");
        o.dataset.label = nhan;
        o.textContent = noiDung ?? "";
        return o;
    }

    function hienThiDanhSachThuoc() {
        thanBangThuoc.replaceChildren();
        const danhSach = donThuocDangSua?.danhSachThuoc ?? [];

        if (danhSach.length === 0) {
            const dong = document.createElement("tr");
            const o = taoO("Chưa có thuốc trong đơn.", "Thông báo");
            o.colSpan = 8;
            o.classList.add("text-center");
            dong.append(o);
            thanBangThuoc.append(dong);
            return;
        }

        danhSach.forEach((thuoc, chiSo) => {
            const dong = document.createElement("tr");
            dong.append(
                taoO(String(chiSo + 1), "STT"),
                taoO(thuoc.tenThuoc, "Tên thuốc"),
                taoO(thuoc.hamLuong, "Hàm lượng"),
                taoO(`${thuoc.soLuongMoiLan} × ${thuoc.soLanMoiNgay} lần/ngày`, "Liều dùng"),
                taoO(String(thuoc.soNgayDung), "Số ngày"),
                taoO(`${thuoc.tongSoLuong} ${thuoc.donVi ?? ""}`.trim(), "Tổng số lượng"),
                taoO([thuoc.cachDung, thuoc.thoiDiemDung].filter(Boolean).join(" - "), "Cách dùng")
            );

            const oThaoTac = taoO("", "Thao tác");
            const nutXoa = document.createElement("button");
            nutXoa.type = "button";
            nutXoa.className = "button-xoa";
            nutXoa.dataset.thuocId = thuoc.id;
            nutXoa.textContent = "Xóa";
            oThaoTac.append(nutXoa);
            dong.append(oThaoTac);
            thanBangThuoc.append(dong);
        });
    }

    function capNhatTongSoLuong() {
        const oTong = document.getElementById("tong-so-luong");

        try {
            oTong.value = tinhTongSoLuongThuoc(
                document.getElementById("so-luong-moi-lan").value,
                document.getElementById("so-lan-moi-ngay").value,
                document.getElementById("so-ngay-dung").value
            );
        } catch {
            oTong.value = "";
        }
    }

    function timDonNhapCuaBenhNhan(benhNhanId) {
        return donThuocService.layDanhSachDonThuoc().find(
            (donThuoc) =>
                donThuoc.benhNhanId === benhNhanId &&
                donThuoc.trangThai === TRANG_THAI_DON_THUOC.NHAP
        ) ?? null;
    }

    async function chonBenhNhanDeKham(benhNhan) {
        if (benhNhan.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM) {
            benhNhanDangKham = benhNhanService.batDauKham(benhNhan.id);
        } else {
            benhNhanDangKham = benhNhanService.layChiTietBenhNhan(benhNhan.id);
        }

        donThuocDangSua = timDonNhapCuaBenhNhan(benhNhan.id);

        if (!donThuocDangSua) {
            donThuocDangSua = donThuocService.taoDonThuocNhap(
                benhNhan.id,
                { tenBacSi: "", chuanDoan: "", loiDan: "" }
            );
        }

        hienThiBenhNhanDangKham();
        dienThongTinKham(donThuocDangSua);
        hienThiDanhSachThuoc();
        moKhuVuc("kham-benh");
        hienThiThongBaoThanhCong("Đã mở hồ sơ khám của bệnh nhân.");
    }

    function luuThongTinKham() {
        if (!donThuocDangSua) {
            throw new Error("Chưa chọn bệnh nhân để khám.");
        }

        donThuocDangSua = donThuocService.capNhatThongTinKham(
            donThuocDangSua.id,
            docThongTinKham()
        );
        return donThuocDangSua;
    }

    function xuLyThemThuoc(suKien) {
        suKien.preventDefault();
        xoaLoiForm("#loi-form-thuoc");

        try {
            luuThongTinKham();
            donThuocDangSua = donThuocService.themThuocVaoDon(
                donThuocDangSua.id,
                docDuLieuThuoc()
            );
            formThuoc.reset();
            document.getElementById("tong-so-luong").value = "";
            hienThiDanhSachThuoc();
            hienThiThongBaoThanhCong("Thêm thuốc vào đơn thành công.");
            khiDuLieuThayDoi();
        } catch (loi) {
            hienThiLoiForm("#loi-form-thuoc", loi.message);
            hienThiThongBaoLoi(loi.message);
        }
    }

    function xuLyXoaThuoc(thuocId) {
        try {
            donThuocDangSua = donThuocService.xoaThuocKhoiDon(
                donThuocDangSua.id,
                thuocId
            );
            hienThiDanhSachThuoc();
            hienThiThongBaoThanhCong("Đã xóa thuốc khỏi đơn.");
            khiDuLieuThayDoi();
        } catch (loi) {
            hienThiThongBaoLoi(loi.message);
        }
    }

    function xuLyLuuNhapDonThuoc() {
        try {
            luuThongTinKham();
            donThuocDangSua = donThuocService.luuNhapDonThuoc(donThuocDangSua.id);
            hienThiThongBaoThanhCong("Lưu nháp đơn thuốc thành công.");
            khiDuLieuThayDoi();
        } catch (loi) {
            hienThiLoiForm("#loi-form-kham", loi.message);
            hienThiThongBaoLoi(loi.message);
        }
    }

    function xoaTrangThaiKham() {
        benhNhanDangKham = null;
        donThuocDangSua = null;
        formKham.reset();
        formThuoc.reset();
        xoaLoiForm("#loi-form-kham");
        xoaLoiForm("#loi-form-thuoc");
        hienThiBenhNhanDangKham();
        hienThiDanhSachThuoc();
    }

    function xuLyHoanTatDonThuoc() {
        try {
            luuThongTinKham();
            donThuocService.hoanTatDonThuoc(donThuocDangSua.id);
            hienThiThongBaoThanhCong("Hoàn tất đơn thuốc thành công.");
            xoaTrangThaiKham();
            khiDuLieuThayDoi();
            moKhuVuc("lich-su");
        } catch (loi) {
            hienThiLoiForm("#loi-form-kham", loi.message);
            hienThiThongBaoLoi(loi.message);
        }
    }

    function xuLyHuyKham() {
        if (!donThuocDangSua) {
            moKhuVuc("benh-nhan");
            return;
        }

        if (!xacNhanThaoTac("Hủy thao tác khám và hủy đơn thuốc nháp này?")) {
            return;
        }

        try {
            donThuocService.huyDonThuoc(donThuocDangSua.id);
            hienThiThongBaoCanhBao("Đơn thuốc nháp đã được hủy.");
            xoaTrangThaiKham();
            khiDuLieuThayDoi();
            moKhuVuc("benh-nhan");
        } catch (loi) {
            hienThiThongBaoLoi(loi.message);
        }
    }

    formThuoc.addEventListener("submit", xuLyThemThuoc);
    ["so-luong-moi-lan", "so-lan-moi-ngay", "so-ngay-dung"].forEach((id) => {
        document.getElementById(id).addEventListener("input", capNhatTongSoLuong);
    });
    thanBangThuoc.addEventListener("click", (suKien) => {
        const nut = suKien.target.closest("button[data-thuoc-id]");
        if (nut) {
            xuLyXoaThuoc(nut.dataset.thuocId);
        }
    });
    document.getElementById("button-luu-nhap").addEventListener("click", xuLyLuuNhapDonThuoc);
    document.getElementById("button-hoan-tat-don").addEventListener("click", xuLyHoanTatDonThuoc);
    document.getElementById("button-huy-kham").addEventListener("click", xuLyHuyKham);

    hienThiBenhNhanDangKham();
    hienThiDanhSachThuoc();

    return Object.freeze({
        chonBenhNhanDeKham,
        hienThiBenhNhanDangKham,
        xuLyThemThuoc,
        hienThiDanhSachThuoc,
        xuLyLuuNhapDonThuoc,
        xuLyHoanTatDonThuoc,
        xuLyHuyKham
    });
}
