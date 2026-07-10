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
  soDienThoai = '0912345678',
  diaChi = 'Hà Nội'
} = {}) {
  await page.getByTestId('input-ho-ten').fill(hoTen);
  await page.getByTestId('input-ngay-sinh').fill(ngaySinh);
  await page.getByTestId('input-so-dien-thoai').fill(soDienThoai);
  await page.locator('#dia-chi').fill(diaChi);
  await page.getByTestId('button-luu-benh-nhan').click();
}

function dongBenhNhanTheoTen(page, hoTen) {
  return page.getByTestId('danh-sach-benh-nhan').locator('tbody tr').filter({ hasText: hoTen });
}

test.describe('Tiếp nhận bệnh nhân', () => {
  test.beforeEach(async ({ page }) => {
    await moUngDungSach(page);
  });

  test('Mở ứng dụng thành công', async ({ page }) => {
    await expect(page.getByTestId('form-benh-nhan')).toBeVisible();
    await expect(page.getByTestId('danh-sach-benh-nhan')).toBeVisible();
  });

  test('Thêm bệnh nhân hợp lệ', async ({ page }) => {
    await themBenhNhan(page);

    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Thêm bệnh nhân thành công.');
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An')).toHaveCount(1);
  });

  test('Hiển thị mã bệnh nhân sau khi thêm', async ({ page }) => {
    await themBenhNhan(page);

    const dong = dongBenhNhanTheoTen(page, 'Nguyễn Văn An');
    await expect(dong.locator('td').first()).toHaveText(/^BN-\d{8}-\d{4}$/);
  });

  test('Hiển thị trạng thái chờ khám', async ({ page }) => {
    await themBenhNhan(page);

    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An').getByText('Chờ khám')).toBeVisible();
  });

  test('Từ chối form thiếu họ tên', async ({ page }) => {
    await page.getByTestId('input-ngay-sinh').fill('1990-05-20');
    await page.getByTestId('input-so-dien-thoai').fill('0912345678');
    await page.getByTestId('button-luu-benh-nhan').click();

    await expect(page.locator('#loi-form-benh-nhan')).toContainText('Họ tên bệnh nhân không được để trống.');
    await expect(page.getByTestId('danh-sach-benh-nhan')).not.toContainText('0912345678');
  });

  test('Từ chối số điện thoại không hợp lệ', async ({ page }) => {
    await themBenhNhan(page, { soDienThoai: '12345' });

    await expect(page.locator('#loi-form-benh-nhan')).toContainText('Số điện thoại không hợp lệ.');
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An')).toHaveCount(0);
  });

  test('Từ chối ngày sinh tương lai', async ({ page }) => {
    const ngayTuongLai = new Date();
    ngayTuongLai.setFullYear(ngayTuongLai.getFullYear() + 1);
    const giaTriNgay = ngayTuongLai.toISOString().slice(0, 10);

    await themBenhNhan(page, { ngaySinh: giaTriNgay });

    await expect(page.locator('#loi-form-benh-nhan')).toContainText('Ngày sinh không được lớn hơn ngày hiện tại.');
  });

  test('Từ chối bệnh nhân trùng', async ({ page }) => {
    await themBenhNhan(page);
    await themBenhNhan(page, { hoTen: 'Nguyễn Văn Bình' });

    await expect(page.locator('#loi-form-benh-nhan')).toContainText('Bệnh nhân đã tồn tại.');
    await expect(page.getByTestId('danh-sach-benh-nhan').locator('tbody tr')).toHaveCount(1);
  });

  test('Sửa thông tin bệnh nhân', async ({ page }) => {
    await themBenhNhan(page);
    const dong = dongBenhNhanTheoTen(page, 'Nguyễn Văn An');

    await dong.getByRole('button', { name: 'Sửa' }).click();
    await page.getByTestId('input-ho-ten').fill('Nguyễn Văn An Cập Nhật');
    await page.getByTestId('button-luu-benh-nhan').click();

    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Cập nhật bệnh nhân thành công.');
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An Cập Nhật')).toHaveCount(1);
  });

  test('Tìm kiếm theo họ tên', async ({ page }) => {
    await themBenhNhan(page, { hoTen: 'Nguyễn Văn An', soDienThoai: '0912345678' });
    await themBenhNhan(page, { hoTen: 'Trần Thị Bình', soDienThoai: '0987654321' });

    await page.getByTestId('input-tim-benh-nhan').fill('trần thị bình');

    await expect(dongBenhNhanTheoTen(page, 'Trần Thị Bình')).toHaveCount(1);
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An')).toHaveCount(0);
  });

  test('Tìm kiếm theo số điện thoại', async ({ page }) => {
    await themBenhNhan(page, { hoTen: 'Nguyễn Văn An', soDienThoai: '0912345678' });
    await themBenhNhan(page, { hoTen: 'Trần Thị Bình', soDienThoai: '0987654321' });

    await page.getByTestId('input-tim-benh-nhan').fill('0987654321');

    await expect(dongBenhNhanTheoTen(page, 'Trần Thị Bình')).toHaveCount(1);
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An')).toHaveCount(0);
  });

  test('Lọc bệnh nhân theo trạng thái', async ({ page }) => {
    await themBenhNhan(page);
    await page.selectOption('#loc-trang-thai-benh-nhan', 'dang_kham');

    await expect(page.getByTestId('danh-sach-benh-nhan')).toContainText('Chưa có bệnh nhân phù hợp.');

    await page.selectOption('#loc-trang-thai-benh-nhan', 'cho_kham');
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An')).toHaveCount(1);
  });

  test('Xóa bệnh nhân', async ({ page }) => {
    await themBenhNhan(page);
    page.once('dialog', (dialog) => dialog.accept());

    await dongBenhNhanTheoTen(page, 'Nguyễn Văn An').getByRole('button', { name: 'Xóa' }).click();

    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Xóa bệnh nhân thành công.');
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An')).toHaveCount(0);
  });

  test('Dữ liệu vẫn tồn tại sau khi reload trang', async ({ page }) => {
    await themBenhNhan(page);
    await page.reload();

    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An')).toHaveCount(1);
    await expect(dongBenhNhanTheoTen(page, 'Nguyễn Văn An')).toContainText('0912345678');
  });
});
