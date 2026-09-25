[ [English](../en/configuration.md) | 🌐 **Tiếng Việt** | [日本語](../ja/configuration.md) ]
---

# Cấu hình `.forge/config.yaml`

Đặc tả đầy đủ của `.forge/config.yaml`. Mọi khóa đều là tùy chọn và có giá trị mặc định; nếu file không tồn tại, Forge sẽ dùng cấu hình mặc định.

---

## Tổng quan cấu hình

```yaml
version: 1

# Phiên bản kernel được ghim (ví dụ: "0.1.0", ">=0.1.0", "~=0.1.0").
# Khi khai báo, `forge check` sẽ kiểm tra độ lệch phiên bản giữa repo và kernel.
kernel_version: "0.1.0"

# Các lệnh được thực thi trong `forge verify` và kiểm tra bởi `forge doctor`.
# Nếu dự án không có bước tương ứng, đặt giá trị thành `none` (hoặc `n/a`, `-`).
commands:
  build: "npm run build"
  typecheck: "mypy src"
  lint: "ruff check ."
  test: "pytest -q"
  ui: "playwright test"
  timeout: 300

# Cấu hình cho tầng dữ liệu dẫn xuất (docs/system/derived/).
derive:
  # Danh sách glob bị loại trừ khỏi toàn bộ quá trình quét, ngoài các thư mục build/vendor mặc định.
  exclude:
    - "vendor/**"
  # Danh sách glob chứa dữ liệu fixture/mock có chuỗi giống ID nhưng không phải khai báo claim thật.
  exclude_id_scan:
    - "tests/fixtures/**"

# Giới hạn dòng và ngữ cảnh.
budgets:
  # Số dòng tối đa cho nhóm tài liệu luôn nạp (OVERVIEW.md + các claim bắt buộc). Mặc định: 400.
  always_loaded_lines: 400

# Ngưỡng phát hiện mồ côi và độ tươi dữ liệu.
thresholds:
  # Số lượng change gần nhất được quét để tìm trích dẫn claim (mặc định: 20).
  orphan_change_window: 20
  # Số commit tối đa tầng derived được phép trễ trước khi cảnh báo (mặc định: 20).
  derived_stale_commits: 20

# Quy tắc nội bộ dự án cho từng phase, hiển thị cho agent qua `forge instructions <phase>`.
rules:
  spec:
    - "tiền tệ luôn dùng đơn vị số nguyên nhỏ nhất (minor units)"
    - "mọi endpoint công khai phải quy định rate limit"
```

---

## Chi tiết các khóa cấu hình

### `kernel_version`
* *(string, tùy chọn)*: Ghim phiên bản Forge kernel cho repository (ví dụ: `"0.1.0"`, `">=0.1.0"`). `forge check` và `forge doctor` sẽ kiểm tra tính tương thích. Có thể viết dạng lồng nhau:
  ```yaml
  kernel:
    version: "0.1.0"
  ```

### `commands`
Các lệnh được chạy trong `forge verify` và kiểm tra bởi `forge doctor`. Nếu dự án không có một bước nào đó, hãy đặt giá trị thành `none` để bỏ qua thay vì bị tính là thiếu sót.
* `build`: Lệnh build dự án.
* `typecheck`: Lệnh kiểm tra kiểu tĩnh.
* `lint`: Lệnh linter kiểm tra chuẩn mã nguồn.
* `test`: Lệnh chạy bộ kiểm thử (test suite).
* `ui`: Lệnh kiểm thử giao diện / e2e / trợ năng (a11y).
* `timeout` *(integer)*: Thời gian chạy tối đa tính bằng giây cho mỗi lệnh (mặc định `300`).

### `derive`
Điều khiển quá trình sinh và lập chỉ mục tầng dữ liệu dẫn xuất (`docs/system/derived/`).
* `exclude` *(danh sách chuỗi)*: Các mẫu glob đường dẫn bị bỏ qua khi quét dẫn xuất.
* `exclude_id_scan` *(danh sách chuỗi)*: Các mẫu glob chứa dữ liệu mẫu/test mang hình thức ID (`REQ-*`, `CMP-*`, ...) nhưng không phải là claim hay bằng chứng thật.

### `budgets`
* `always_loaded_lines` *(integer, mặc định 400)*: Số dòng tối đa cho `OVERVIEW.md` và các file claim cốt lõi. Có thể hạ thấp hơn, nhưng không thể nâng cao hơn.

### `thresholds`
* `orphan_change_window` *(integer, mặc định 20)*: Số lượng change gần nhất được tra cứu khi kiểm tra claim không neo (orphan check).
* `derived_stale_commits` *(integer, mặc định 20)*: Số commit tối đa `docs/system/derived/` có thể đi sau commit `HEAD` trước khi `derived.freshness` cảnh báo.

### `rules`
* `rules.<phase>` *(danh sách chuỗi)*: Quy tắc phong cách và ràng buộc nghiệp vụ cho từng phase, được hiển thị khi chạy lệnh `forge instructions <phase>`. Ví dụ: `rules.spec` chứa các quy tắc dành riêng cho quá trình đặc tả yêu cầu (`specify`).
