import { taoKhoLuuTru } from "./repositories/kho-luu-tru.js";
import { taoBenhNhanRepository } from "./repositories/benh-nhan-repository.js";
import { taoDonThuocRepository } from "./repositories/don-thuoc-repository.js";
import { taoBenhNhanService } from "./services/benh-nhan-service.js";
import { taoDonThuocService } from "./services/don-thuoc-service.js";
import { taoId, taoMaBenhNhan, taoMaDonThuoc } from "./utils/ma.js";
import { layNgayHienTai } from "./utils/ngay-thang.js";
import { khoiTaoBenhNhanUI } from "./ui/benh-nhan-ui.js";
import { khoiTaoKhamBenhUI } from "./ui/kham-benh-ui.js";
import { khoiTaoDonThuocUI } from "./ui/don-thuoc-ui.js";
import {
    hienThiThongBaoCanhBao,
    hienThiThongBaoLoi,
    hienThiThongBaoThanhCong,
    xacNhanThaoTac,
    xoaThongBao
} from "./ui/thong-bao-ui.js";

function khoiDongUngDung() {
    const khoLuuTru = taoKhoLuuTru(globalThis.localStorage);
    const benhNhanRepository = taoBenhNhanRepository(khoLuuTru);
    const donThuocRepository = taoDonThuocRepository(khoLuuTru);
    const benhNhanService = taoBenhNhanService({
        benhNhanRepository,
        donThuocRepository,
        taoId,
        taoMaBenhNhan,
        layThoiGianHienTai: layNgayHienTai
    });
    const donThuocService = taoDonThuocService({
        donThuocRepository,
        benhNhanRepository,
        taoId,
        taoMaDonThuoc,
        layThoiGianHienTai: layNgayHienTai
    });

    const cacKhuVuc = [...document.querySelectorAll(".page-section")];
    const cacNutDieuHuong = [...document.querySelectorAll(".nav-button[data-section]")];

    function moKhuVuc(tenKhuVuc) {
        cacKhuVuc.forEach((khuVuc) => {
            const dangMo = khuVuc.id === `section-${tenKhuVuc}`;
            khuVuc.hidden = !dangMo;
            khuVuc.classList.toggle("active", dangMo);
        });
        cacNutDieuHuong.forEach((nut) => {
            nut.classList.toggle("active", nut.dataset.section === tenKhuVuc);
        });
    }

    let benhNhanUI;
    let khamBenhUI;
    let donThuocUI;

    function renderLaiToanBo() {
        benhNhanUI?.xuLyTimKiemBenhNhan();
        donThuocUI?.xuLyTimKiemDonThuoc();
    }

    khamBenhUI = khoiTaoKhamBenhUI({
        benhNhanService,
        donThuocService,
        moKhuVuc,
        khiDuLieuThayDoi: renderLaiToanBo
    });

    benhNhanUI = khoiTaoBenhNhanUI({
        benhNhanService,
        khiChonKham: khamBenhUI.chonBenhNhanDeKham,
        khiDuLieuThayDoi: renderLaiToanBo
    });

    donThuocUI = khoiTaoDonThuocUI({
        donThuocService,
        benhNhanService,
        khiDuLieuThayDoi: renderLaiToanBo
    });

    cacNutDieuHuong.forEach((nut) => {
        nut.addEventListener("click", () => {
            xoaThongBao();
            moKhuVuc(nut.dataset.section);
            if (nut.dataset.section === "benh-nhan") {
                benhNhanUI.xuLyTimKiemBenhNhan();
            } else if (nut.dataset.section === "lich-su") {
                donThuocUI.xuLyTimKiemDonThuoc();
            }
        });
    });

    document.getElementById("button-tao-du-lieu-mau").addEventListener("click", () => {
        try {
            const benhNhanMoi = benhNhanService.taoDuLieuBenhNhanMau();

            if (benhNhanMoi[0]) {
                const donHoanTat = donThuocService.taoDonThuocNhap(benhNhanMoi[0].id, {
                    tenBacSi: "Bác sĩ mẫu",
                    chuanDoan: "Chẩn đoán mẫu phục vụ học tập",
                    loiDan: "Dữ liệu giả lập, không dùng làm khuyến nghị điều trị."
                });
                donThuocService.themThuocVaoDon(donHoanTat.id, {
                    tenThuoc: "Thuoc mau A",
                    hamLuong: "Mẫu",
                    donVi: "viên",
                    soLuongMoiLan: 1,
                    soLanMoiNgay: 2,
                    soNgayDung: 3,
                    cachDung: "Cách dùng mẫu",
                    thoiDiemDung: "Thời điểm mẫu"
                });
                donThuocService.hoanTatDonThuoc(donHoanTat.id);
            }

            if (benhNhanMoi[1]) {
                const donNhap = donThuocService.taoDonThuocNhap(benhNhanMoi[1].id, {
                    tenBacSi: "Bác sĩ mẫu",
                    chuanDoan: "Chẩn đoán mẫu",
                    loiDan: "Dữ liệu học tập."
                });
                donThuocService.themThuocVaoDon(donNhap.id, {
                    tenThuoc: "Thuoc mau B",
                    hamLuong: "Mẫu",
                    donVi: "viên",
                    soLuongMoiLan: 1,
                    soLanMoiNgay: 1,
                    soNgayDung: 2,
                    cachDung: "Cách dùng mẫu",
                    thoiDiemDung: "Thời điểm mẫu"
                });
                donThuocService.luuNhapDonThuoc(donNhap.id);
            }

            renderLaiToanBo();
            hienThiThongBaoThanhCong(
                benhNhanMoi.length > 0
                    ? "Tạo dữ liệu mẫu thành công. Dữ liệu chỉ dùng cho học tập."
                    : "Dữ liệu mẫu đã tồn tại."
            );
        } catch (loi) {
            hienThiThongBaoLoi(loi.message);
        }
    });

    document.getElementById("button-xoa-du-lieu").addEventListener("click", () => {
        if (!xacNhanThaoTac("Bạn có chắc muốn xóa toàn bộ dữ liệu ứng dụng?")) {
            return;
        }

        khoLuuTru.xoaToanBo();
        benhNhanUI.lamMoiFormBenhNhan();
        renderLaiToanBo();
        moKhuVuc("benh-nhan");
        hienThiThongBaoCanhBao("Đã xóa toàn bộ dữ liệu.");
    });

    globalThis.addEventListener("error", (suKien) => {
        hienThiThongBaoLoi(
            suKien.error?.message ?? "Ứng dụng gặp lỗi không mong muốn."
        );
    });

    globalThis.addEventListener("unhandledrejection", (suKien) => {
        const lyDo = suKien.reason;
        hienThiThongBaoLoi(
            lyDo instanceof Error
                ? lyDo.message
                : "Có thao tác bất đồng bộ bị lỗi."
        );
    });

    moKhuVuc("benh-nhan");
}

try {
    khoiDongUngDung();
} catch (loi) {
    hienThiThongBaoLoi(loi.message ?? "Không thể khởi động ứng dụng.");
    console.error(loi);
}
