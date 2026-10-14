[ [English](../en/cli-reference.md) | 🌐 **Tiếng Việt** | [日本語](../ja/cli-reference.md) ]
---

# Tra cứu câu lệnh CLI

Danh mục hướng dẫn đầy đủ cho toàn bộ các câu lệnh của Forge CLI.

---

## Bảng tổng hợp câu lệnh

| Lệnh | Ý nghĩa | Tham số chính |
| :--- | :--- | :--- |
| `forge init` | Khởi tạo cấu trúc Forge trong dự án | `--repo <path>`, `--no-skills` |
| `forge install` | Cài đặt bộ 9 kỹ năng cho AI Coding Agent (toàn cục hoặc theo dự án) | `--global`, `--host <claude\|antigravity\|codex\|all>` |
| `forge doctor` | Chẩn đoán môi trường Python, Git, Tree-sitter và lệnh test/build | `--repo <path>` |
| `forge status` | Tóm tắt 1 màn hình: trạng thái kho tri thức, drift và change đang mở | `--repo <path>`, `--json` |
| `forge check` | Kiểm tra toàn diện claim (S1–S18), neo AST, trace và luật skills | `--repo <path>`, `--scope <all\|store\|derived\|trace\|change\|skills\|candidates>` |
| `forge sync` | Đồng bộ tầng dữ liệu máy (derived tier) | `derived`, `--only <file>`, `--amend` |
| `forge bootstrap` | Tiếp quản dự án có sẵn theo quy trình 3 bước | `derive`, `review`, `seal` |
| `forge claim` | Tạo mẫu, xem và đóng dấu commit cho claim | `new <kind>`, `show <id>`, `stamp <id\|--all>` |
| `forge change` | Quản lý vòng đời thay đổi / tính năng | `new`, `list`, `show`, `track` |
| `forge instructions` | Xem quyền đọc ngữ cảnh và tạo file mẫu cho từng giai đoạn | `<artifact>`, `--change <id>`, `--write [name]` |
| `forge spec` | Gập đặc tả delta vào kho đặc tả hệ thống | `fold`, `--change <id>`, `--dry-run` |
| `forge gate` | Đánh giá các cổng kiểm soát chuyển pha | `<point>`, `--change <id>` |
| `forge impact` | Tính toán bán kính ảnh hưởng (blast radius) và tập claim bị chạm | `--change <id>`, `--base <rev>` |
| `forge guard` | Chặn lệnh nguy hiểm trước khi chạy và kiểm tra phạm vi file (`scope`) theo task | `--cmd <cmd>`, `--paths <path>...`, `--change <id>` |
| `forge verify` | Chạy bộ test, UI probe và kiểm tra giải trình claim-touch | `--change <id>`, `--sync`, `--amend`, `--waive <cond>` |
| `forge archive` | Gập spec delta, restamp claim và lưu trữ change hoàn tất | `--change <id>`, `--amend`, `--dry-run` |
| `forge drift` | Phát hiện neo AST lỗi thời và quản lý sổ cái drift | `--store`, `--changed`, `--staged`, `record`, `resolve`, `waive` |
| `forge fingerprint` | In dấu vân tay AST chuẩn hóa của file/symbol | `<path>...` |
| `forge reconcile`| Đối soát các commit ngoài luồng gây trôi lệch và mở mục ledger | `--since <rev>`, `--head <rev>`, `--record` |
| `forge hooks` | Quản lý Git pre-commit hook chặn lỗi store & drift | `status`, `install`, `uninstall` |
| `forge trace` | Truy vết hai chiều cho mã Claim hoặc Requirement | `<id>`, `--json` |
| `forge skill` | Liệt kê, đọc và xuất bộ kỹ năng AI Agent | `list`, `show <name>`, `export [--global] [--host <h>]` |
| `forge report` | Báo cáo lỗi hoặc đề xuất tính năng lên GitHub (ẩn danh dữ liệu) | `--feature`, `--no-browser` |

---

## 🔒 Quyền riêng tư & Báo cáo Lỗi

Forge cam kết **hoàn toàn không thu thập dữ liệu ngầm (Zero Telemetry)**:
* Toàn bộ thao tác chạy 100% offline trên máy của bạn.
* Khi gặp lỗi không lường trước hoặc khi chạy `forge report`, Forge tự động ẩn danh hóa toàn bộ đường dẫn cá nhân (thay thế `C:\Users\<tên>` hoặc `/home/<tên>` thành `~`).
* Người dùng luôn có toàn quyền kiểm tra nội dung trước khi gửi lên GitHub. Chi tiết xem tại [Chính sách Quyền riêng tư (PRIVACY.md)](https://github.com/CodeGenLabs/forge-harness/blob/main/PRIVACY.md).
