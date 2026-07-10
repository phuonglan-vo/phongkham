/**
 * Tạo một storage giả có giao diện tương tự localStorage.
 * Mỗi lần gọi hàm sẽ tạo một vùng dữ liệu độc lập.
 *
 * @param {Record<string, string>} [duLieuBanDau]
 * @returns {{
 *   getItem: (khoa: string) => string|null,
 *   setItem: (khoa: string, giaTri: unknown) => void,
 *   removeItem: (khoa: string) => void,
 *   clear: () => void,
 *   key: (viTri: number) => string|null,
 *   readonly length: number
 * }}
 */
export function taoKhoLuuTruGia(duLieuBanDau = {}) {
    const duLieu = new Map(
        Object.entries(duLieuBanDau).map(([khoa, giaTri]) => [
            String(khoa),
            String(giaTri)
        ])
    );

    return {
        get length() {
            return duLieu.size;
        },

        getItem(khoa) {
            const khoaChuanHoa = String(khoa);
            return duLieu.has(khoaChuanHoa)
                ? duLieu.get(khoaChuanHoa)
                : null;
        },

        setItem(khoa, giaTri) {
            duLieu.set(String(khoa), String(giaTri));
        },

        removeItem(khoa) {
            duLieu.delete(String(khoa));
        },

        clear() {
            duLieu.clear();
        },

        key(viTri) {
            if (!Number.isInteger(viTri) || viTri < 0 || viTri >= duLieu.size) {
                return null;
            }

            return Array.from(duLieu.keys())[viTri] ?? null;
        }
    };
}
