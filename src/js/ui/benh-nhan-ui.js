import { TRANG_THAI_BENH_NHAN } from "../constants/hang-so.js";
import { dinhDangNgay } from "../utils/ngay-thang.js";
import {
    hienThiLoiForm,
    hienThiThongBaoLoi,
    hienThiThongBaoThanhCong,
    xacNhanThaoTac,
    xoaLoiForm
} from "./thong-bao-ui.js";

const NHAN_TRANG_THAI = Object.freeze({
    [TRANG_THAI_BENH_NHAN.CHO_KHAM]: "Chờ khám",
    [TRANG_THAI_BENH_NHAN.DANG_KHAM]: "Đang khám",
    [TRANG_THAI_BENH_NHAN.DA_KHAM]: "Đã khám"
});

/**
 * Tạo module UI tiếp nhận bệnh nhân.
 *
 * @param {Object} tuyChon
 * @param {Object} tuyChon.benhNhanService
 * @param {(benhNhan: Object) => void|Promise<void>} [tuyChon.khiChonKham]
 * @param {() => void} [tuyChon.khiDuLieuThayDoi]
 * @returns {Object}
 */
export function khoiTaoBenhNhanUI({
    benhNhanService,
    khiChonKham = () => { },
    khiDuLieuThayDoi = () => { }
}) {
    const form = document.getElementById("form-benh-nhan");
    const thanBang = document.querySelector("#danh-sach-benh-nhan tbody");
    const oTimKiem = document.getElementById("tim-benh-nhan");
    const boLocTrangThai = document.getElementById("loc-trang-thai-benh-nhan");
    const oId = document.getElementById("benh-nhan-id");

    if (!form || !thanBang || !oTimKiem || !boLocTrangThai || !oId) {
        throw new Error("Không tìm thấy đầy đủ giao diện tiếp nhận bệnh nhân.");
    }

    function docDuLieuForm() {
        return {
            hoTen: document.getElementById("ho-ten").value,
            ngaySinh: document.getElementById("ngay-sinh").value,
            gioiTinh: document.getElementById("gioi-tinh").value,
            soDienThoai: document.getElementById("so-dien-thoai").value,
            diaChi: document.getElementById("dia-chi").value,
            trieuChung: document.getElementById("trieu-chung").value,
            tienSuBenh: document.getElementById("tien-su-benh").value,
            diUngThuoc: document.getElementById("di-ung-thuoc").value
        };
    }

    function datLaiTrangThaiFormBenhNhan() {
        oId.value = "";
        xoaLoiForm("#loi-form-benh-nhan");
        document.getElementById("button-luu-benh-nhan").textContent = "Lưu";
    }

    function lamMoiFormBenhNhan() {
        form.reset();
        datLaiTrangThaiFormBenhNhan();
    }

    function dienDuLieuBenhNhanVaoForm(benhNhan) {
        oId.value = benhNhan.id;
        document.getElementById("ho-ten").value = benhNhan.hoTen ?? "";
        document.getElementById("ngay-sinh").value = benhNhan.ngaySinh ?? "";
        document.getElementById("gioi-tinh").value = benhNhan.gioiTinh ?? "";
        document.getElementById("so-dien-thoai").value = benhNhan.soDienThoai ?? "";
        document.getElementById("dia-chi").value = benhNhan.diaChi ?? "";
        document.getElementById("trieu-chung").value = benhNhan.trieuChung ?? "";
        document.getElementById("tien-su-benh").value = benhNhan.tienSuBenh ?? "";
        document.getElementById("di-ung-thuoc").value = benhNhan.diUngThuoc ?? "";
        document.getElementById("button-luu-benh-nhan").textContent = "Cập nhật";
        form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function taoO(noiDung, nhan) {
        const o = document.createElement("td");
        o.dataset.label = nhan;
        o.textContent = noiDung ?? "";
        return o;
    }

    function taoBadgeTrangThai(trangThai) {
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

    function hienThiDanhSachBenhNhan(danhSach = null) {
        const duLieu = danhSach ?? benhNhanService.layDanhSachBenhNhan();
        thanBang.replaceChildren();

        if (duLieu.length === 0) {
            const dong = document.createElement("tr");
            const o = taoO("Chưa có bệnh nhân phù hợp.", "Thông báo");
            o.colSpan = 5;
            o.classList.add("text-center");
            dong.append(o);
            thanBang.append(dong);
            return;
        }

        for (const benhNhan of duLieu) {
            const dong = document.createElement("tr");
            dong.append(
                taoO(benhNhan.maBenhNhan, "Mã"),
                taoO(benhNhan.hoTen, "Họ tên"),
                taoO(benhNhan.soDienThoai, "Điện thoại")
            );

            const oTrangThai = taoO("", "Trạng thái");
            oTrangThai.append(taoBadgeTrangThai(benhNhan.trangThai));
            dong.append(oTrangThai);

            const oThaoTac = taoO("", "Thao tác");
            oThaoTac.classList.add("form-actions");
            oThaoTac.append(
                taoNut("Sửa", "button-sua", "sua", benhNhan.id),
                taoNut("Xóa", "button-xoa", "xoa", benhNhan.id)
            );

            if (
                benhNhan.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM ||
                benhNhan.trangThai === TRANG_THAI_BENH_NHAN.DANG_KHAM
            ) {
                oThaoTac.append(
                    taoNut(
                        benhNhan.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM
                            ? "Khám"
                            : "Tiếp tục khám",
                        "button-kham",
                        "kham",
                        benhNhan.id
                    )
                );
            }

            dong.append(oThaoTac);
            thanBang.append(dong);
        }
    }

    function xuLyTimKiemBenhNhan() {
        const ketQua = benhNhanService.timKiemBenhNhan(
            oTimKiem.value,
            boLocTrangThai.value
        );
        hienThiDanhSachBenhNhan(ketQua);
    }

    async function xuLyLuuBenhNhan(suKien) {
        suKien.preventDefault();
        xoaLoiForm("#loi-form-benh-nhan");

        try {
            if (oId.value) {
                benhNhanService.capNhatBenhNhan(oId.value, docDuLieuForm());
                hienThiThongBaoThanhCong("Cập nhật bệnh nhân thành công.");
            } else {
                benhNhanService.themBenhNhan(docDuLieuForm());
                hienThiThongBaoThanhCong("Thêm bệnh nhân thành công.");
            }

            lamMoiFormBenhNhan();
            xuLyTimKiemBenhNhan();
            khiDuLieuThayDoi();
        } catch (loi) {
            hienThiLoiForm("#loi-form-benh-nhan", loi.message);
            hienThiThongBaoLoi(loi.message);
        }
    }

    function xuLySuaBenhNhan(id) {
        try {
            dienDuLieuBenhNhanVaoForm(benhNhanService.layChiTietBenhNhan(id));
        } catch (loi) {
            hienThiThongBaoLoi(loi.message);
        }
    }

    function xuLyXoaBenhNhan(id) {
        if (!xacNhanThaoTac("Bạn có chắc muốn xóa bệnh nhân này?")) {
            return;
        }

        try {
            benhNhanService.xoaBenhNhan(id);
            hienThiThongBaoThanhCong("Xóa bệnh nhân thành công.");
            lamMoiFormBenhNhan();
            xuLyTimKiemBenhNhan();
            khiDuLieuThayDoi();
        } catch (loi) {
            hienThiThongBaoLoi(loi.message);
        }
    }

    async function xuLyChonKham(id) {
        try {
            const benhNhan = benhNhanService.layChiTietBenhNhan(id);
            await khiChonKham(benhNhan);
            xuLyTimKiemBenhNhan();
            khiDuLieuThayDoi();
        } catch (loi) {
            hienThiThongBaoLoi(loi.message);
        }
    }

    form.addEventListener("submit", xuLyLuuBenhNhan);
    form.addEventListener("reset", () => {
        queueMicrotask(datLaiTrangThaiFormBenhNhan);
    });
    oTimKiem.addEventListener("input", xuLyTimKiemBenhNhan);
    boLocTrangThai.addEventListener("change", xuLyTimKiemBenhNhan);
    thanBang.addEventListener("click", (suKien) => {
        const nut = suKien.target.closest("button[data-hanh-dong]");

        if (!nut) {
            return;
        }

        if (nut.dataset.hanhDong === "sua") {
            xuLySuaBenhNhan(nut.dataset.id);
        } else if (nut.dataset.hanhDong === "xoa") {
            xuLyXoaBenhNhan(nut.dataset.id);
        } else if (nut.dataset.hanhDong === "kham") {
            xuLyChonKham(nut.dataset.id);
        }
    });

    hienThiDanhSachBenhNhan();

    return Object.freeze({
        xuLyLuuBenhNhan,
        xuLySuaBenhNhan,
        xuLyXoaBenhNhan,
        xuLyTimKiemBenhNhan,
        hienThiDanhSachBenhNhan,
        dienDuLieuBenhNhanVaoForm,
        lamMoiFormBenhNhan
    });
}
