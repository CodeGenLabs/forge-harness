[ [English](../en/troubleshooting.md) | 🌐 **Tiếng Việt** | [日本語](../ja/troubleshooting.md) ]
---

# Xử lý sự cố & Câu hỏi thường gặp

---

## 1. Lỗi `forge: command not found`
**Nguyên nhân**: Thư mục cài đặt shim (`~/.local/bin`) chưa được thêm vào biến môi trường `PATH`.
**Cách xử lý**:
* Trên Windows: Chạy `scripts/install.ps1`.
* Trên Linux/macOS: Thêm `export PATH="$HOME/.local/bin:$PATH"` vào `~/.bashrc` hoặc `~/.zshrc`.

## 2. Cảnh báo "Derived tier stale" (`derived.dirty`) trong `forge check`
**Cách xử lý**:
Khi đang code dở trên nhánh feature, dùng `forge check --fast` để bỏ qua tầng derived; khi chuẩn bị merge vào `main`, đồng bộ 1 lần:
```powershell
forge sync derived
git add docs/system/derived
git commit -m "chore: sync derived tier"
```

## 3. Lỗi `store.placeholder` với mẫu route hoặc biến môi trường (`{id}`, `{prefix}`)
Bọc các chuỗi mẫu trong backtick inline (ví dụ: `` `/api/v1/bots/{id}/pause` `` hoặc `` `{prefix}_API_KEY` ``) để phân biệt với placeholder chưa hoàn thiện.

## 4. Giảm độ trễ khi `git commit`
Chuyển sang hook chỉ kiểm tra lúc push/merge lên `main`:
```powershell
forge hooks uninstall
forge hooks install --stage pre-push
```
