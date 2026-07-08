/**
 * Chuyển giá trị bất kỳ thành Date hợp lệ.
 *
 * @param {Date|string|number} giaTri
 * @returns {Date|null}
 */
function taoNgay(giaTri) {

    if (giaTri === null || giaTri === undefined || giaTri === "") {
        return null;
    }

    const ngay =
        giaTri instanceof Date
            ? new Date(giaTri.getTime())
            : new Date(giaTri);

    if (Number.isNaN(ngay.getTime())) {
        return null;
    }

    return ngay;

}

/**
 * Thêm số 0 phía trước.
 *
 * @param {number} so
 * @returns {string}
 */
function themSoKhong(so) {

    return String(so).padStart(2, "0");

}

/**
 * Lấy ngày hiện tại.
 *
 * @returns {Date}
 */
export function layNgayHienTai() {

    return new Date();

}

/**
 * Chuyển sang chuỗi ISO yyyy-MM-dd.
 *
 * @param {Date|string|number} giaTri
 * @returns {string}
 */
export function chuyenNgaySangISO(giaTri) {

    const ngay = taoNgay(giaTri);

    if (!ngay) {
        return "";
    }

    const nam = ngay.getFullYear();

    const thang = themSoKhong(
        ngay.getMonth() + 1
    );

    const ngayTrongThang = themSoKhong(
        ngay.getDate()
    );

    return `${nam}-${thang}-${ngayTrongThang}`;

}

/**
 * Định dạng dd/MM/yyyy.
 *
 * @param {Date|string|number} giaTri
 * @returns {string}
 */
export function dinhDangNgay(giaTri) {

    const ngay = taoNgay(giaTri);

    if (!ngay) {
        return "";
    }

    const ngayTrongThang = themSoKhong(
        ngay.getDate()
    );

    const thang = themSoKhong(
        ngay.getMonth() + 1
    );

    const nam = ngay.getFullYear();

    return `${ngayTrongThang}/${thang}/${nam}`;

}

/**
 * Định dạng dd/MM/yyyy HH:mm.
 *
 * @param {Date|string|number} giaTri
 * @returns {string}
 */
export function dinhDangNgayGio(giaTri) {

    const ngay = taoNgay(giaTri);

    if (!ngay) {
        return "";
    }

    const phanNgay = dinhDangNgay(ngay);

    const gio = themSoKhong(
        ngay.getHours()
    );

    const phut = themSoKhong(
        ngay.getMinutes()
    );

    return `${phanNgay} ${gio}:${phut}`;

}

/**
 * Kiểm tra ngày có nằm trong tương lai hay không.
 *
 * @param {Date|string|number} giaTri
 * @param {Date|string|number} [mocSoSanh]
 * @returns {boolean}
 */
export function laNgayTrongTuongLai(
    giaTri,
    mocSoSanh = layNgayHienTai()
) {

    const ngay = taoNgay(giaTri);

    const moc = taoNgay(mocSoSanh);

    if (!ngay || !moc) {
        return false;
    }

    const giaTriNgay = new Date(
        ngay.getFullYear(),
        ngay.getMonth(),
        ngay.getDate()
    );

    const giaTriMoc = new Date(
        moc.getFullYear(),
        moc.getMonth(),
        moc.getDate()
    );

    return giaTriNgay.getTime() > giaTriMoc.getTime();

}

/**
 * Tính tuổi theo ngày sinh.
 *
 * @param {Date|string|number} ngaySinh
 * @param {Date|string|number} [ngayHienTai]
 * @returns {number|null}
 */
export function tinhTuoi(
    ngaySinh,
    ngayHienTai = layNgayHienTai()
) {

    const sinh = taoNgay(ngaySinh);

    const hienTai = taoNgay(ngayHienTai);

    if (!sinh || !hienTai) {
        return null;
    }

    if (sinh.getTime() > hienTai.getTime()) {
        return null;
    }

    let tuoi =
        hienTai.getFullYear() -
        sinh.getFullYear();

    const chuaDenSinhNhat =
        hienTai.getMonth() < sinh.getMonth() ||
        (
            hienTai.getMonth() === sinh.getMonth() &&
            hienTai.getDate() < sinh.getDate()
        );

    if (chuaDenSinhNhat) {
        tuoi--;
    }

    return tuoi;

}
