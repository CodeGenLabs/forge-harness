[ [English](../en/getting-started.md) | 🌐 **Tiếng Việt** | [日本語](../ja/getting-started.md) ]
---

# Bắt đầu với Forge

Tài liệu này hướng dẫn chi tiết cách cài đặt Forge Harness, kiểm tra môi trường và khởi tạo Forge trên dự án của bạn.

---

## Yêu cầu môi trường
* **Python**: Phiên bản >= 3.11 (hoặc cao hơn)
* **Git**: Đã cài đặt và có trong biến môi trường `PATH`
* **Hệ điều hành**: Windows 10/11, macOS, hoặc Linux

---

## Các phương pháp cài đặt

### Cách 1: Cài đặt toàn cục qua `uv tool` hoặc `pipx` (Khuyến nghị)

Chạy kèm `forge install --global` một lần duy nhất để cài toàn bộ 9 kỹ năng vào thư mục người dùng (`~/.gemini/config/skills`, `~/.claude/skills`, `~/.codex/AGENTS.md`), không cần chép file skill vào từng dự án:

```bash
# Cài đặt bằng uv (cực nhanh):
uv tool install git+https://github.com/CodeGenLabs/forge-harness.git
forge install --global

# Hoặc sử dụng pipx:
pipx install git+https://github.com/CodeGenLabs/forge-harness.git
pipx ensurepath
forge install --global
```

### Cách 2: Sử dụng Script cài đặt tự động 1-Click

Tự động cài `forge` CLI, cấu hình `PATH` và chạy `forge install --global`:

=== "Windows (PowerShell)"
    ```powershell
    # Chạy trực tiếp 1 dòng:
    irm https://raw.githubusercontent.com/CodeGenLabs/forge-harness/main/scripts/install.ps1 | iex

    # Hoặc từ thư mục đã clone:
    powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
    ```

=== "Linux / macOS (Bash)"
    ```bash
    # Chạy trực tiếp 1 dòng:
    curl -fsSL https://raw.githubusercontent.com/CodeGenLabs/forge-harness/main/scripts/install.sh | bash

    # Hoặc từ thư mục đã clone:
    bash ./scripts/install.sh
    ```

Script sẽ tự động tạo môi trường ảo riêng biệt tại `~/.forge-harness/venv`, tạo shim vào `~/.local/bin`, đăng ký vĩnh viễn vào **User PATH** và cài đặt toàn bộ 9 skills ở cấp global.

### Cách 3: Cài đặt phát triển (Local Editable)
```bash
git clone https://github.com/CodeGenLabs/forge-harness.git
cd forge-harness
python -m venv .venv
# Kích hoạt:
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Linux / macOS

pip install -e ".[grammars,dev,docs]"
```

---

## Kiểm tra sức khỏe môi trường

Chạy lệnh kiểm tra:
```bash
forge doctor
```
Kết quả hiển thị:
```text
ok python         3.11.9
ok git            2.44.0
ok tree_sitter    0.23.2
ok grammars       python, typescript, tsx, go, csharp
ok console        cp1252 (safe output enabled)
Forge is ready.
```

---

## Khởi tạo trên một Repository bất kỳ

Di chuyển đến repository dự án của bạn và chạy `forge init --no-skills` (hoặc `forge init` nếu muốn chép bản sao `.forge/skills/` vào repo):
```bash
cd /path/to/my-project
forge init --no-skills
```

Thao tác này sẽ thiết lập cấu trúc harness chuẩn:
```text
my-project/
├── .forge/
│   └── config.yaml          # File cấu hình Forge cho dự án
├── docs/
│   └── system/
│       ├── domain.md        # Định nghĩa các mô hình và thực thể nghiệp vụ
│       ├── pitfalls.md      # Hiến pháp cạm bẫy & quy tắc cấm vi phạm
│       ├── decisions/       # Các bản ghi quyết định kiến trúc (ADR)
│       └── derived/         # Dữ liệu tự sinh từ máy (graph phụ thuộc, test map)
```

Kiểm tra tính toàn vẹn hệ thống:
```bash
forge check
```
Nếu toàn bộ định nghĩa hợp lệ, lệnh sẽ kết thúc với mã `0`:
```text
0 error(s), 0 warning(s). Checked: claim store, derived-tier freshness, trace integrity.
```
