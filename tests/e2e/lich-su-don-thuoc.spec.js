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
}

function dongBenhNhanTheoTen(page, hoTen) {
  return page.getByTestId('danh-sach-benh-nhan').locator('tbody tr').filter({ hasText: hoTen });
}

async function moHoSoKham(page, hoTen) {
  await dongBenhNhanTheoTen(page, hoTen).getByRole('button', { name: /Khám|Tiếp tục khám/ }).click();
  await expect(page.getByTestId('khu-vuc-kham-benh')).toBeVisible();
}

async function themThuoc(page, tenThuoc = 'Thuoc mau A') {
  await page.getByTestId('input-ten-thuoc').fill(tenThuoc);
  await page.locator('#ham-luong').fill('100 mg');
  await page.locator('#don-vi').fill('viên');
  await page.locator('#so-luong-moi-lan').fill('1');
  await page.locator('#so-lan-moi-ngay').fill('2');
  await page.locator('#so-ngay-dung').fill('3');
  await page.locator('#cach-dung').fill('Cách dùng kiểm thử');
  await page.locator('#thoi-diem-dung').fill('Sau ăn');
  await page.getByTestId('button-them-thuoc').click();
}

async function taoDonHoanTat(page, {
  hoTen = 'Nguyễn Văn An',
  soDienThoai = '0912345678',
  tenBacSi = 'Bác sĩ Minh',
  chuanDoan = 'Chẩn đoán kiểm thử',
  tenThuoc = 'Thuoc mau A'
} = {}) {
  await themBenhNhan(page, { hoTen, soDienThoai });
  await moHoSoKham(page, hoTen);
  await page.getByTestId('input-ten-bac-si').fill(tenBacSi);
  await page.getByTestId('input-chuan-doan').fill(chuanDoan);
  await page.locator('#loi-dan').fill('Lời dặn kiểm thử');
  await themThuoc(page, tenThuoc);
  await page.getByTestId('button-hoan-tat-don').click();
  await expect(page.locator('.nav-button.active')).toHaveText('Lịch sử đơn thuốc');
}

async function taoDonNhap(page, {
  hoTen = 'Trần Thị Bình',
  soDienThoai = '0987654321',
  tenBacSi = 'Bác sĩ Lan'
} = {}) {
  await page.getByRole('button', { name: 'Tiếp nhận bệnh nhân' }).click();
  await themBenhNhan(page, { hoTen, soDienThoai });
  await moHoSoKham(page, hoTen);
  await page.getByTestId('input-ten-bac-si').fill(tenBacSi);
  await page.getByTestId('input-chuan-doan').fill('Chẩn đoán nháp');
  await page.getByRole('button', { name: 'Lưu nháp' }).click();
  await page.getByRole('button', { name: 'Lịch sử đơn thuốc' }).click();
}

function dongDonTheoBenhNhan(page, hoTen) {
  return page.getByTestId('danh-sach-don-thuoc').locator('tbody tr').filter({ hasText: hoTen });
}

test.describe('Lịch sử đơn thuốc', () => {
  test.beforeEach(async ({ page }) => {
    await moUngDungSach(page);
  });

  test('Hiển thị và xem chi tiết đơn thuốc đã hoàn tất', async ({ page }) => {
    await taoDonHoanTat(page);

    const dongDon = dongDonTheoBenhNhan(page, 'Nguyễn Văn An');
    await expect(dongDon.locator('td').first()).toHaveText(/^DT-\d{8}-\d{4}$/);
    await expect(dongDon).toContainText('Nguyễn Văn An');
    await expect(dongDon).toContainText('Bác sĩ Minh');

    await dongDon.getByRole('button', { name: 'Xem' }).click();

    const modal = page.locator('#modal-chi-tiet-don');
    await expect(modal).toBeVisible();
    await expect(page.locator('#modal-chuan-doan')).toHaveText('Chẩn đoán kiểm thử');
    await expect(page.locator('#modal-danh-sach-thuoc')).toContainText('Thuoc mau A');

    await page.getByRole('button', { name: 'Đóng' }).click();
    await expect(modal).not.toBeVisible();
  });

  test('Tìm kiếm theo tên bệnh nhân', async ({ page }) => {
    await taoDonHoanTat(page);
    await taoDonNhap(page);

    await page.locator('#tim-don-thuoc').fill('Nguyễn Văn An');

    await expect(dongDonTheoBenhNhan(page, 'Nguyễn Văn An')).toHaveCount(1);
    await expect(dongDonTheoBenhNhan(page, 'Trần Thị Bình')).toHaveCount(0);
  });

  test('Tìm kiếm theo tên bác sĩ', async ({ page }) => {
    await taoDonHoanTat(page);
    await taoDonNhap(page);

    await page.locator('#tim-don-thuoc').fill('Bác sĩ Lan');

    await expect(dongDonTheoBenhNhan(page, 'Trần Thị Bình')).toHaveCount(1);
    await expect(dongDonTheoBenhNhan(page, 'Nguyễn Văn An')).toHaveCount(0);
  });

  test('Lọc đơn đã hoàn tất', async ({ page }) => {
    await taoDonHoanTat(page);
    await taoDonNhap(page);

    await page.selectOption('#loc-trang-thai-don', 'da_hoan_tat');

    await expect(dongDonTheoBenhNhan(page, 'Nguyễn Văn An')).toHaveCount(1);
    await expect(dongDonTheoBenhNhan(page, 'Trần Thị Bình')).toHaveCount(0);
  });

  test('Đơn đã hoàn tất không có nút hủy', async ({ page }) => {
    await taoDonHoanTat(page);

    await expect(dongDonTheoBenhNhan(page, 'Nguyễn Văn An').getByRole('button', { name: 'Hủy' })).toHaveCount(0);
  });

  test('Đơn nháp có thể hủy', async ({ page }) => {
    await taoDonNhap(page);
    page.once('dialog', (dialog) => dialog.accept());

    const dongDon = dongDonTheoBenhNhan(page, 'Trần Thị Bình');
    await dongDon.getByRole('button', { name: 'Hủy' }).click();

    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Đơn thuốc đã được hủy.');
    await expect(dongDonTheoBenhNhan(page, 'Trần Thị Bình')).toContainText('Đã hủy');
    await expect(dongDonTheoBenhNhan(page, 'Trần Thị Bình').getByRole('button', { name: 'Hủy' })).toHaveCount(0);
  });

  test('Gọi window.print khi bấm nút in', async ({ page }) => {
    await taoDonHoanTat(page);
    await dongDonTheoBenhNhan(page, 'Nguyễn Văn An').getByRole('button', { name: 'Xem' }).click();

    await page.evaluate(() => {
      window.__daGoiPrint = false;
      window.print = () => {
        window.__daGoiPrint = true;
      };
    });

    await page.getByRole('button', { name: 'In' }).click();

    await expect.poll(() => page.evaluate(() => window.__daGoiPrint)).toBe(true);
  });
});
