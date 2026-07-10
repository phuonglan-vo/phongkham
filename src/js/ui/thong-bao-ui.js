/**
 * Lấy phần tử từ HTMLElement hoặc selector/id.
 *
 * @param {HTMLElement|string|null|undefined} dich
 * @returns {HTMLElement|null}
 */
function layPhanTu(dich) {
    if (!dich) {
        return null;
    }

    if (typeof dich === "string") {
        return document.querySelector(dich) ?? document.getElementById(dich);
    }

    return dich;
}

/**
 * Hiển thị thông báo hệ thống theo loại.
 *
 * @param {string} noiDung
 * @param {string} tenLop
 * @param {HTMLElement|string} [dich]
 * @returns {void}
 */
function hienThiThongBao(noiDung, tenLop, dich = "#thong-bao-he-thong") {
    const phanTu = layPhanTu(dich);

    if (!phanTu) {
        return;
    }

    phanTu.classList.remove(
        "thong-bao-thanh-cong",
        "thong-bao-loi",
        "thong-bao-canh-bao"
    );
    phanTu.classList.add(tenLop);
    phanTu.textContent = String(noiDung ?? "");
}

/**
 * Hiển thị thông báo thành công.
 *
 * @param {string} noiDung
 * @param {HTMLElement|string} [dich]
 * @returns {void}
 */
export function hienThiThongBaoThanhCong(noiDung, dich) {
    hienThiThongBao(noiDung, "thong-bao-thanh-cong", dich);
}

/**
 * Hiển thị thông báo lỗi.
 *
 * @param {string} noiDung
 * @param {HTMLElement|string} [dich]
 * @returns {void}
 */
export function hienThiThongBaoLoi(noiDung, dich) {
    hienThiThongBao(noiDung, "thong-bao-loi", dich);
}

/**
 * Hiển thị thông báo cảnh báo.
 *
 * @param {string} noiDung
 * @param {HTMLElement|string} [dich]
 * @returns {void}
 */
export function hienThiThongBaoCanhBao(noiDung, dich) {
    hienThiThongBao(noiDung, "thong-bao-canh-bao", dich);
}

/**
 * Xóa thông báo hệ thống.
 *
 * @param {HTMLElement|string} [dich]
 * @returns {void}
 */
export function xoaThongBao(dich = "#thong-bao-he-thong") {
    const phanTu = layPhanTu(dich);

    if (!phanTu) {
        return;
    }

    phanTu.textContent = "";
    phanTu.classList.remove(
        "thong-bao-thanh-cong",
        "thong-bao-loi",
        "thong-bao-canh-bao"
    );
}

/**
 * Hiển thị lỗi tại vùng lỗi của form.
 *
 * @param {HTMLElement|string} dich
 * @param {string|Object<string, string>} loi
 * @returns {void}
 */
export function hienThiLoiForm(dich, loi) {
    const phanTu = layPhanTu(dich);

    if (!phanTu) {
        return;
    }

    if (typeof loi === "string") {
        phanTu.textContent = loi;
        return;
    }

    const danhSachLoi = Object.values(loi ?? {}).filter(Boolean);
    phanTu.textContent = danhSachLoi.join(" ");
}

/**
 * Xóa nội dung lỗi form.
 *
 * @param {HTMLElement|string} dich
 * @returns {void}
 */
export function xoaLoiForm(dich) {
    const phanTu = layPhanTu(dich);

    if (phanTu) {
        phanTu.textContent = "";
    }
}

/**
 * Hiển thị hộp xác nhận của trình duyệt.
 *
 * @param {string} noiDung
 * @param {(noiDung: string) => boolean} [hamXacNhan]
 * @returns {boolean}
 */
export function xacNhanThaoTac(
    noiDung,
    hamXacNhan = globalThis.confirm?.bind(globalThis)
) {
    if (typeof hamXacNhan !== "function") {
        return false;
    }

    return Boolean(hamXacNhan(noiDung));
}
