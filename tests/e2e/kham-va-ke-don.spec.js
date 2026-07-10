import { expect, test } from '@playwright/test';

async function moUngDungSach(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await expect(page.getByTestId('form-benh-nhan')).toBeVisible();
}

async function themBenhNhan(page, {
  hoTen = 'Nguyễn Văn An',
  ngaySinh = '1990-05-20',
  soDienThoai = '0912345678'
} = {}) {
  await page.getByTestId('input-ho-ten').fill(hoTen);
  await page.getByTestId('input-ngay-sinh').fill(ngaySinh);
  await page.getByTestId('input-so-dien-thoai').fill(soDienThoai);
  await page.getByTestId('button-luu-benh-nhan').click();
  await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Thêm bệnh nhân thành công.');
}

function dongBenhNhanTheoTen(page, hoTen) {
  return page.getByTestId('danh-sach-benh-nhan').locator('tbody tr').filter({ hasText: hoTen });
}

async function batDauKham(page, hoTen = 'Nguyễn Văn An') {
  await dongBenhNhanTheoTen(page, hoTen).getByRole('button', { name: 'Khám' }).click();
  await expect(page.getByTestId('khu-vuc-kham-benh')).toBeVisible();
  await expect(page.locator('#chi-tiet-ho-ten')).toHaveText(hoTen);
}

async function nhapThongTinKham(page, {
  tenBacSi = 'Bác sĩ Minh',
  chuanDoan = 'Chẩn đoán kiểm thử',
  loiDan = 'Theo dõi và tái khám theo lịch.'
} = {}) {
  if (tenBacSi !== null) await page.getByTestId('input-ten-bac-si').fill(tenBacSi);
  if (chuanDoan !== null) await page.getByTestId('input-chuan-doan').fill(chuanDoan);
  if (loiDan !== null) await page.locator('#loi-dan').fill(loiDan);
}

async function nhapThuoc(page, {
  tenThuoc = 'Thuoc mau A',
  hamLuong = '100 mg',
  donVi = 'viên',
  soLuongMoiLan = '2',
  soLanMoiNgay = '3',
  soNgayDung = '5',
  cachDung = 'Dùng theo hướng dẫn kiểm thử',
  thoiDiemDung = 'Sau ăn'
} = {}) {
  await page.getByTestId('input-ten-thuoc').fill(tenThuoc);
  await page.locator('#ham-luong').fill(hamLuong);
  await page.locator('#don-vi').fill(donVi);
  await page.locator('#so-luong-moi-lan').fill(soLuongMoiLan);
  await page.locator('#so-lan-moi-ngay').fill(soLanMoiNgay);
  await page.locator('#so-ngay-dung').fill(soNgayDung);
  await page.locator('#cach-dung').fill(cachDung);
  await page.locator('#thoi-diem-dung').fill(thoiDiemDung);
}

async function themMotThuocHopLe(page, duLieu = {}) {
  await nhapThuoc(page, duLieu);
  await page.getByTestId('button-them-thuoc').click();
  await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Thêm thuốc vào đơn thành công.');
}

test.describe('Khám và kê đơn', () => {
  test.beforeEach(async ({ page }) => {
    await moUngDungSach(page);
  });

  test('Thực hiện đầy đủ luồng khám và kê đơn', async ({ page }) => {
    await themBenhNhan(page);
    await batDauKham(page);

    await expect(page.locator('.nav-button.active')).toHaveText('Khám và kê đơn');
    await nhapThongTinKham(page);

    await nhapThuoc(page, {
      tenThuoc: 'Thuoc mau A',
      soLuongMoiLan: '2',
      soLanMoiNgay: '3',
      soNgayDung: '5'
    });
    await expect(page.locator('#tong-so-luong')).toHaveValue('30');
    await page.getByTestId('button-them-thuoc').click();

    await themMotThuocHopLe(page, {
      tenThuoc: 'Thuoc mau B',
      soLuongMoiLan: '1',
      soLanMoiNgay: '2',
      soNgayDung: '4'
    });

    const cacDongThuoc = page.getByTestId('danh-sach-thuoc').locator('tbody tr');
    await expect(cacDongThuoc).toHaveCount(2);
    await expect(page.getByTestId('danh-sach-thuoc')).toContainText('Thuoc mau A');
    await expect(page.getByTestId('danh-sach-thuoc')).toContainText('Thuoc mau B');

    await cacDongThuoc.filter({ hasText: 'Thuoc mau B' }).getByRole('button', { name: 'Xóa' }).click();
    await expect(cacDongThuoc).toHaveCount(1);

    await page.getByRole('button', { name: 'Lưu nháp' }).click();
    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Lưu nháp đơn thuốc thành công.');

    await page.reload();
    await expect(page.getByTestId('form-benh-nhan')).toBeVisible();
    await dongBenhNhanTheoTen(page, 'Nguyễn Văn An').getByRole('button', { name: 'Tiếp tục khám' }).click();

    await expect(page.getByTestId('khu-vuc-kham-benh')).toBeVisible();
    await expect(page.getByTestId('danh-sach-thuoc')).toContainText('Thuoc mau A');
    await expect(page.getByTestId('input-ten-bac-si')).toHaveValue('Bác sĩ Minh');
    await expect(page.getByTestId('input-chuan-doan')).toHaveValue('Chẩn đoán kiểm thử');

    await page.getByTestId('button-hoan-tat-don').click();
    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Hoàn tất đơn thuốc thành công.');
    await expect(page.locator('.nav-button.active')).toHaveText('Lịch sử đơn thuốc');

    await page.getByRole('button', { name: 'Tiếp nhận bệnh nhân' }).click();
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An')).toContainText('Đã khám');
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An').getByRole('button', { name: /Khám/ })).toHaveCount(0);

    await page.getByRole('button', { name: 'Lịch sử đơn thuốc' }).click();
    const dongDon = page.getByTestId('danh-sach-don-thuoc').locator('tbody tr').filter({ hasText: 'Nguyễn Văn An' });
    await expect(dongDon).toContainText('Đã hoàn tất');
    await expect(dongDon.getByRole('button', { name: 'Hủy' })).toHaveCount(0);
  });

  test('Không hoàn tất khi chưa nhập bác sĩ', async ({ page }) => {
    await themBenhNhan(page);
    await batDauKham(page);
    await nhapThongTinKham(page, { tenBacSi: '', chuanDoan: 'Chẩn đoán kiểm thử' });
    await themMotThuocHopLe(page);

    await page.getByTestId('button-hoan-tat-don').click();

    await expect(page.locator('#loi-form-kham')).toContainText('Tên bác sĩ là bắt buộc.');
  });

  test('Không hoàn tất khi chưa nhập chẩn đoán', async ({ page }) => {
    await themBenhNhan(page);
    await batDauKham(page);
    await nhapThongTinKham(page, { tenBacSi: 'Bác sĩ Minh', chuanDoan: '' });
    await themMotThuocHopLe(page);

    await page.getByTestId('button-hoan-tat-don').click();

    await expect(page.locator('#loi-form-kham')).toContainText('Chẩn đoán là bắt buộc.');
  });

  test('Không hoàn tất khi chưa có thuốc', async ({ page }) => {
    await themBenhNhan(page);
    await batDauKham(page);
    await nhapThongTinKham(page);

    await page.getByTestId('button-hoan-tat-don').click();

    await expect(page.locator('#loi-form-kham')).toContainText('Đơn thuốc phải có ít nhất một loại thuốc.');
  });

  test('Không thêm thuốc khi số lượng mỗi lần bằng 0', async ({ page }) => {
    await themBenhNhan(page);
    await batDauKham(page);
    await nhapThuoc(page, { soLuongMoiLan: '0' });

    await page.getByTestId('button-them-thuoc').click();

    await expect(page.locator('#loi-form-thuoc')).toContainText('Số lượng mỗi lần phải lớn hơn 0.');
    await expect(page.getByTestId('danh-sach-thuoc')).toContainText('Chưa có thuốc trong đơn.');
  });

  test('Không thêm thuốc khi số ngày dùng âm', async ({ page }) => {
    await themBenhNhan(page);
    await batDauKham(page);
    await nhapThuoc(page, { soNgayDung: '-1' });

    await page.getByTestId('button-them-thuoc').click();

    await expect(page.locator('#loi-form-thuoc')).toContainText('Số ngày dùng phải lớn hơn 0.');
    await expect(page.getByTestId('danh-sach-thuoc')).toContainText('Chưa có thuốc trong đơn.');
  });
});
