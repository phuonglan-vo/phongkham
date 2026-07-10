import { TRANG_THAI_DON_THUOC } from "../constants/hang-so.js";
import { dinhDangNgayGio } from "../utils/ngay-thang.js";
import {
    hienThiThongBaoCanhBao,
    hienThiThongBaoLoi,
    hienThiThongBaoThanhCong,
    xacNhanThaoTac
} from "./thong-bao-ui.js";

const NHAN_TRANG_THAI = Object.freeze({
    [TRANG_THAI_DON_THUOC.NHAP]: "Nháp",
    [TRANG_THAI_DON_THUOC.DA_HOAN_TAT]: "Đã hoàn tất",
    [TRANG_THAI_DON_THUOC.DA_HUY]: "Đã hủy"
});

/**
 * Tạo module UI lịch sử đơn thuốc.
 *
 * @param {Object} tuyChon
 * @param {Object} tuyChon.donThuocService
 * @param {Object} tuyChon.benhNhanService
 * @param {() => void} [tuyChon.khiDuLieuThayDoi]
 * @returns {Object}
 */
export function khoiTaoDonThuocUI({
    donThuocService,
    benhNhanService,
    khiDuLieuThayDoi = () => {}
}) {
    const thanBang = document.querySelector("#danh-sach-don-thuoc tbody");
    const oTimKiem = document.getElementById("tim-don-thuoc");
    const boLoc = document.getElementById("loc-trang-thai-don");
    const modal = document.getElementById("modal-chi-tiet-don");
    let donThuocDangXem = null;

    if (!thanBang || !oTimKiem || !boLoc || !modal) {
        throw new Error("Không tìm thấy đầy đủ giao diện lịch sử đơn thuốc.");
    }

    function layBenhNhan(benhNhanId) {
        try {
            return benhNhanService.layChiTietBenhNhan(benhNhanId);
        } catch {
            return null;
        }
    }

    function taoO(noiDung, nhan) {
        const o = document.createElement("td");
        o.dataset.label = nhan;
        o.textContent = noiDung ?? "";
        return o;
    }

    function taoBadge(trangThai) {
        const badge = document.createElement("span");
        badge.className = `badge badge-${String(trangThai).replaceAll("_", "-")}`;
        badge.textContent = NHAN_TRANG_THAI[trangThai] ?? trangThai ?? "";
        return badge;
    }

    function taoNut(noiDung, lop, hanhDong, id) {
        const nut = document.createElement("button");
        nut.type = "button";
        nut.className = lop;
        nut.dataset.hanhDong = hanhDong;
        nut.dataset.id = id;
        nut.textContent = noiDung;
        return nut;
    }

    function hienThiDanhSachDonThuoc(danhSach = null) {
        const duLieu = danhSach ?? donThuocService.layDanhSachDonThuoc();
        thanBang.replaceChildren();

        if (duLieu.length === 0) {
            const dong = document.createElement("tr");
            const o = taoO("Chưa có đơn thuốc phù hợp.", "Thông báo");
            o.colSpan = 6;
            o.classList.add("text-center");
            dong.append(o);
            thanBang.append(dong);
            return;
        }

        for (const donThuoc of duLieu) {
            const benhNhan = layBenhNhan(donThuoc.benhNhanId);
            const dong = document.createElement("tr");
            dong.append(
                taoO(donThuoc.maDonThuoc, "Mã đơn"),
                taoO(benhNhan?.hoTen ?? "Không xác định", "Bệnh nhân"),
                taoO(donThuoc.tenBacSi || "Chưa nhập", "Bác sĩ"),
                taoO(dinhDangNgayGio(donThuoc.ngayKeDon), "Ngày kê")
            );

            const oTrangThai = taoO("", "Trạng thái");
            oTrangThai.append(taoBadge(donThuoc.trangThai));
            dong.append(oTrangThai);

            const oThaoTac = taoO("", "Thao tác");
            oThaoTac.classList.add("form-actions");
            oThaoTac.append(taoNut("Xem", "button-kham", "xem", donThuoc.id));
            if (donThuoc.trangThai === TRANG_THAI_DON_THUOC.NHAP) {
                oThaoTac.append(taoNut("Hủy", "button-xoa", "huy", donThuoc.id));
            }
            dong.append(oThaoTac);
            thanBang.append(dong);
        }
    }

    function xuLyTimKiemDonThuoc() {
        hienThiDanhSachDonThuoc(
            donThuocService.timKiemDonThuoc(oTimKiem.value, boLoc.value)
        );
    }

    function ganNoiDung(id, noiDung) {
        document.getElementById(id).textContent = noiDung ?? "";
    }

    function hienThiChiTietDonThuoc(id) {
        try {
            const donThuoc = donThuocService.layDonThuocTheoId(id);
            const benhNhan = layBenhNhan(donThuoc.benhNhanId);
            donThuocDangXem = donThuoc;

            ganNoiDung("modal-ma-don", donThuoc.maDonThuoc);
            ganNoiDung("modal-ngay-ke", dinhDangNgayGio(donThuoc.ngayKeDon));
            ganNoiDung("modal-benh-nhan", benhNhan?.hoTen ?? "Không xác định");
            ganNoiDung("modal-bac-si", donThuoc.tenBacSi || "Chưa nhập");
            ganNoiDung("modal-chuan-doan", donThuoc.chuanDoan || "Chưa nhập");
            ganNoiDung("modal-loi-dan", donThuoc.loiDan || "Không có");

            const thanBangThuoc = document.getElementById("modal-danh-sach-thuoc");
            thanBangThuoc.replaceChildren();
            for (const thuoc of donThuoc.danhSachThuoc ?? []) {
                const dong = document.createElement("tr");
                dong.append(
                    taoO([thuoc.tenThuoc, thuoc.hamLuong].filter(Boolean).join(" "), "Thuốc"),
                    taoO(`${thuoc.soLuongMoiLan} × ${thuoc.soLanMoiNgay} lần/ngày × ${thuoc.soNgayDung} ngày`, "Liều dùng"),
                    taoO(`${thuoc.tongSoLuong} ${thuoc.donVi ?? ""}`.trim(), "Tổng số lượng")
                );
                thanBangThuoc.append(dong);
            }

            const nutIn = document.getElementById("button-in-don");
            nutIn.hidden = donThuoc.trangThai !== TRANG_THAI_DON_THUOC.DA_HOAN_TAT;
            modal.showModal();
        } catch (loi) {
            hienThiThongBaoLoi(loi.message);
        }
    }

    function xuLyHuyDonThuoc(id) {
        if (!xacNhanThaoTac("Bạn có chắc muốn hủy đơn thuốc nháp này?")) {
            return;
        }

        try {
            donThuocService.huyDonThuoc(id);
            hienThiThongBaoCanhBao("Đơn thuốc đã được hủy.");
            xuLyTimKiemDonThuoc();
            khiDuLieuThayDoi();
        } catch (loi) {
            hienThiThongBaoLoi(loi.message);
        }
    }

    function xuLyInDonThuoc() {
        if (!donThuocDangXem) {
            hienThiThongBaoLoi("Chưa chọn đơn thuốc để in.");
            return;
        }

        if (donThuocDangXem.trangThai !== TRANG_THAI_DON_THUOC.DA_HOAN_TAT) {
            hienThiThongBaoLoi("Chỉ đơn thuốc đã hoàn tất mới được in.");
            return;
        }

        globalThis.print();
    }

    function dongChiTietDonThuoc() {
        donThuocDangXem = null;
        if (modal.open) {
            modal.close();
        }
    }

    oTimKiem.addEventListener("input", xuLyTimKiemDonThuoc);
    boLoc.addEventListener("change", xuLyTimKiemDonThuoc);
    thanBang.addEventListener("click", (suKien) => {
        const nut = suKien.target.closest("button[data-hanh-dong]");
        if (!nut) {
            return;
        }
        if (nut.dataset.hanhDong === "xem") {
            hienThiChiTietDonThuoc(nut.dataset.id);
        } else if (nut.dataset.hanhDong === "huy") {
            xuLyHuyDonThuoc(nut.dataset.id);
        }
    });
    document.getElementById("button-dong-modal").addEventListener("click", dongChiTietDonThuoc);
    document.getElementById("button-in-don").addEventListener("click", xuLyInDonThuoc);
    modal.addEventListener("cancel", (suKien) => {
        suKien.preventDefault();
        dongChiTietDonThuoc();
    });

    hienThiDanhSachDonThuoc();

    return Object.freeze({
        hienThiDanhSachDonThuoc,
        hienThiChiTietDonThuoc,
        xuLyTimKiemDonThuoc,
        xuLyHuyDonThuoc,
        xuLyInDonThuoc,
        dongChiTietDonThuoc
    });
}
