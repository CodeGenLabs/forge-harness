[ [English](../en/guides.md) | 🌐 **Tiếng Việt** | [日本語](../ja/guides.md) ]
---

# Hướng dẫn & Tích hợp

Hướng dẫn tích hợp Forge vào quy trình phát triển thực tế, CI/CD và AI Agent.

---

## 1. Tích hợp AI Coding Agent

Forge tích hợp sẵn bộ 9 kỹ năng Agent Skill tại `src/forge/_skills/`. Bạn chỉ cần chạy `forge install --global` **1 lần duy nhất** (cài vào `~/.gemini/config/skills`, `~/.claude/skills`, `~/.codex/AGENTS.md`) để sử dụng cho mọi dự án mà không cần chép file skill vào từng thư mục:
* `forge`: Điều phối toàn bộ quy trình thay đổi và định tuyến Track.
* `investigate`: Khảo sát codebase và đề xuất candidate claims trước khi sửa code.
* `specify`: Định nghĩa yêu cầu delta, kịch bản kiểm thử và thiết kế/ADR (Track C).
* `plan-tasks`: Lập kế hoạch công việc theo từng bước kiểm thử được gắn mã `REQ-`.
* `implement`: Triển khai code theo TDD và đúng phạm vi quy định (`forge guard`).
* `curate-knowledge`: Giải trình claim-touch, phê chuẩn candidate và bảo trì tri thức.
* `bootstrap`: Tiếp quản codebase có sẵn qua quy trình 3 bước.
* `interface`: Ràng buộc hợp đồng giao diện (`commands.ui`), 6 trục Theme động, đa ngôn ngữ `i18n` không hardcode và 3 trụ cột tối ưu Mobile (`320px-375px`).
* `ui-ux`: Quy trình thiết kế & kiểm định UI/UX (`design-system`, `wireframe`, `mockup`, `refine-block`, `critique`, `polish`, `document`) kèm kho tri thức 10 nguồn và `scripts/probe.mjs`.

---

## 2. Cấu hình CI/CD trên GitHub Actions

Tạo file `.github/workflows/forge.yml`:
```yaml
name: Forge Verification

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  forge-check:
    name: Check Invariants & Claims
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v7
        with:
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v7
        with:
          python-version: '3.11'

      - name: Install Forge
        run: pip install git+https://github.com/CodeGenLabs/forge-harness.git

      - name: Doctor Check
        run: forge doctor

      - name: Run Forge Check
        run: forge check
```
