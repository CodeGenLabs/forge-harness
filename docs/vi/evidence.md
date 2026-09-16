# Bằng chứng — Forge đã tự đo mình những gì

Một harness bắt người khác "đưa bằng chứng ra" thì phải nợ chính nó điều đó. Trang này là
hồ sơ: đã đo gì, kết quả ra sao, và — với ba kết quả **đi ngược** thiết kế — chúng đã thay
đổi điều gì.

Mọi đo đạc đều chốt kế hoạch và thang chấm bằng một commit **trước khi** chạy, nên kết quả
không thể bị diễn giải lại sau khi đã thấy số. Mã commit được ghi ra để kiểm chứng thứ tự
chứ không phải để tin lời.

!!! note "Báo cáo đầy đủ nằm ở đâu"
    Các báo cáo dài đã được gỡ khỏi cây làm việc khi hệ tài liệu được dựng lại. Chúng vẫn
    còn trong lịch sử git: `git show ef2b051^:docs/measurements/<tên file>`. Trang này giữ
    kết quả, giới hạn, và những thay đổi thiết kế mà chúng gây ra.

---

## Tóm tắt

| # | Câu hỏi | Kết quả | Đã thay đổi điều gì |
|---|---|---|---|
| **M1** | Anchor có sống sót qua refactor thật không? | **Đạt** — 0,61% dương tính giả, 0% âm tính giả; phần dư đóng về 0,00% | Anchor path+symbol có theo dõi rename, tách `shifted`/`stale` |
| **Q1** | Claim store có giúp agent tránh bẫy không? | **Null** — 6/6 đều tránh được, cả hai nhánh | Prose của claim tụt hạng ưu tiên; viết lại hướng dẫn soạn claim |
| **Q1b** | Kiến thức của mỗi claim còn sống ở đâu? | **11/13** có nhà khác mà người đọc gặp sẵn | Thêm dòng `restates:` vào phiếu duyệt bootstrap |
| **Q1c** | Anchor không phủ được gì? | **7/18** claim vỡ mà anchor không nhúc nhích | `evidence:` thành "thứ gì ép luật này"; `forge check` đếm claim không nêu enforcer |
| **W1** | Báo cáo stale có đổi được kết cục không? | **Âm tính mạnh** — 3/3 lần chỉ là restamp, 0 lần sửa thật | `forge drift` nay tự chạy test bằng chứng của claim |
| **W2** | Store có giúp khi kiến thức *chỉ* nằm trong store? | **Null** — lại 6/6 đều tránh được | Xác nhận Q1 chứ không cứu được Q1 |

---

## M1 — Anchor có sống sót qua refactor thật không?

**Cách làm.** Đặt 30 anchor lên các khai báo thật ở thời điểm 200 commit trước, trong ba
repository, rồi tua mainline tiến lên — tổng 600 commit — cộng thêm một thí nghiệm nhiễu
loạn có kiểm soát, vì riêng việc tua lại không thể cho ra tỉ lệ dương tính giả.

**Vì sao phải nhiễu loạn, và bản thân điều đó là một phát hiện.** Trong 600 commit tua lại
có **không một rename thuần tuý nào và không một commit chỉ đổi format nào**. Các dự án này
chạy formatter liên tục, nên hai kiểu hỏng mà thiết kế sợ nhất chưa từng xuất hiện dưới
dạng commit riêng lẻ trong lịch sử gần. Một tổng thể rỗng thì không cho ra tỉ lệ nào, và
báo "0 dương tính giả" từ một tổng thể rỗng là không trung thực.

**Kết quả: đạt.** 0,61% dương tính giả, 0% âm tính giả. Phần dư 0,61% đến từ việc git bỏ
cuộc khi nhận diện rename có độ tương đồng thấp; cơ chế định vị theo nội dung được thêm vào
làm phương án dự phòng và đóng nó về 0,00%.

**Giới hạn đã nêu ngay lúc đó.** Các refactor trung tính về ngữ nghĩa — tách biến, đảo thứ
tự câu lệnh độc lập — không có chuẩn đúng cơ học nên bị loại khỏi tỉ lệ thay vì đoán bừa; do
đó tỉ lệ dương tính giả thật cao hơn con số công bố một khoảng không xác định. Chỉ nhiễu
loạn các khai báo có thân hàm. Ba ngôn ngữ, ba repository, chỉ mainline.

---

## Q1 — Store có giúp không? *(null)*

**Thiết kế.** Một cái bẫy, sáu agent, kế hoạch và thang chấm commit trước. Ba agent được chỉ
vào `docs/system/` — claim store — ba agent còn lại chỉ được chỉ vào code. Không cấm nhóm
sau đọc bất cứ thứ gì. Cái bẫy: một hàm introspection kết thúc bằng `catch { return [] }`,
nên mọi thất bại đều thành danh sách rỗng.

**Kết quả: 6/6 đều tránh được.** Nhánh A (store) 3/3 với ~18 lời gọi công cụ; nhánh B (code)
3/3 với ~13. Store tốn thêm 40% công mò mẫm cho cùng một kết luận.

**Vì sao.** Luật đó đã được viết xuống trong repo ấy **bốn lần** — một bảng quy tắc, một
checklist review, và hai spec — và mọi agent nhánh B đều tự tìm ra, trích đúng mục mà claim
được rút ra từ đó. **Một claim rút ra từ tài liệu thì cạnh tranh với chính tài liệu đó, và
người đọc thường tìm thấy tài liệu.**

**Đã thay đổi gì.** Không vá gì để con số đẹp hơn. Thay vào đó là viết lại hướng dẫn soạn
claim: trước khi viết một candidate rút từ tài liệu, phải trả lời *claim này thêm gì mà
nguồn của nó không có?* **Anchor** là câu trả lời thật — prose không biết code bên dưới đã
dời đi. **Tầm với** là câu còn lại — kiến thức được ghi ở chỗ chẳng liên quan gì đến nơi
làm việc. Một bản chép ngắn hơn thì không phải cả hai.

---

## Q1b — Kiến thức còn sống ở đâu? *(kiểm kê)*

Q1 chỉ có một cái bẫy. Phần này hỏi cùng câu hỏi cho **mọi** pitfall trong hai repository đã
bootstrap, bằng cách đọc — nên người đọc có thể phản đối từng dòng thay vì phản đối một con
số.

**Kết quả: 11/13 có nhà khác mà người đọc gặp ngay khi làm việc** — bốn trong tài liệu văn
xuôi, năm trong chính code tại anchor, hai trong một test. Hai cái không có nhà nào.

**Đã thay đổi gì.** `forge bootstrap review` nay in dòng `restates: <tài liệu>` dưới bất kỳ
candidate nào có bằng chứng trỏ vào một tài liệu trong repo, và hỏi thẳng người duyệt: liệu
người đọc có tự tìm ra tài liệu đó không? Cố ý **không** làm thành check: bắn vào mọi bằng
chứng có tài liệu sẽ gắn cờ cả claim tốt, nên đây là chuyện phán đoán, và phán đoán thuộc về
chỗ có con người ngồi trước mặt.

**Một chỗ sai, để lại cho thấy.** Bản đầu của kiểm kê này báo 10/13 và gọi
`PIT-adapter-prefix-is-a-raw-string-prefix` là claim mồ côi sắc nhất — kiến thức không chỗ
nào nói ra. Sai. `tests/test_requests.py:1705-1730` có hai test chuyên biệt thêm vào cho
issue #6935, phủ đúng cái hazard đó. Lỗi đến từ việc đọc một test kế bên rồi dừng lại. Nó
được phát hiện trong W2 và bị gạch ngang tại chỗ.

---

## Q1c — Anchor không phủ được gì

M1 đo anchor có *sống sót* qua refactor không — tỉ lệ dương tính giả. Phần này đo âm tính
giả, thứ nguy hiểm hơn: **một claim không chịu stale khi nó vỡ là một bản ghi trông như đã
được kiểm mà nội dung thì sai.** Một câu hỏi cho mỗi claim: nêu một sửa đổi làm claim này
sai mà không chạm anchor nào.

**Kết quả: 7/18.** Lý do đồng nhất đủ để thành một luật:

> Anchor phủ được claim **đúng khi** claim nói về chính đoạn code ở anchor. Một luật cả repo
> phải tuân thì không có symbol nào như vậy, vì nó vỡ bằng cách code mọc ra ở chỗ trước đó
> không có.

Sáu trong bảy vẫn bị bắt bởi thứ khác — bốn bởi conformance test, một bởi chính
`forge check`, một bởi khoá ngoại lúc chạy. Một cái chỉ được ép theo từng trường hợp một.

**Đã thay đổi gì.** Hai thứ, đều nằm ở khâu soạn chứ không ở cơ chế, vì cơ chế không phải
thứ hỏng:

- `curate-knowledge` nay dặn neo luật-toàn-repo vào **thứ ép nó** — test, lint rule, guard,
  ràng buộc CSDL — chứ không neo vào một ví dụ của nó; và nếu không gì ép thì phải nói ra.
- `forge check --scope store` kết thúc bằng một dòng đếm số claim không nêu enforcer. Một
  **con số**, không phải một issue cho mỗi claim: mười lăm trên mười tám sẽ nổ, và một bức
  tường cảnh báo mỗi lần chạy chính là cách một cảnh báo thôi được đọc.

**Một check đã thử rồi bỏ, ghi lại để không ai xây lại.** Detector hiển nhiên là theo từ
vựng — gắn cờ pitfall nào có tiêu đề chứa *every*, *never*, *only*. Đối chiếu trên mười tám
claim này thì nó sai cả hai chiều, vì ranh giới nằm ở **phạm vi của chủ ngữ** chứ không ở từ
ngữ.

---

## W1 — Báo cáo stale có đổi được kết cục không? *(âm tính mạnh)*

Điều kiện âm tính được tuyên bố trước khi đo: *nếu mọi sự kiện drift thật tính đến nay đều
được xử lý bằng restamp mà không đổi dòng code hay claim nào, thì cơ chế staleness đã hoạt
động như một khoản thuế hành chính chứ không phải một lan can bảo vệ.*

**Và đó đúng là thứ trả về.**

- **Kiểm kê drift lịch sử (n=3):** 3/3 sự kiện xử lý bằng `confirm` restamp. Code hay claim
  thay đổi: **0 dòng**. Regression thật ngăn được: **0**.
- **Khả năng tự phân loại (18 claim):** **0/18** tự phân loại được chỉ từ metadata của
  commit. 16/18 buộc phải mở ra đọc claim; 2/18 phải audit nhiều file.

**Đã thay đổi gì — thay đổi thiết kế hệ trọng nhất trong danh sách này.** Một báo cáo mà
không ai hành động được nếu không đọc hết mọi thứ là một báo cáo sẽ bị restamp. Nên
`forge drift` nay **tự chạy các test `evidence` mà claim trích dẫn** khi anchor stale, biến
một dịch chuyển AST lành tính và một vi phạm invariant thật thành tín hiệu xanh/đỏ tự động
thay vì một câu hỏi. Hook pre-commit phân loại trên cùng tín hiệu đó
(`forge drift confirm --green`).

Workflow `bugfix` được thêm vào cùng lúc: một thay đổi loại đó phải sinh ra artifact
`reproduce` — một test đỏ — **trước** mọi thứ khác, và chính test đó trở thành `evidence:`
của claim mà con bug sinh ra. Claim sinh từ bug nay ra đời đã có sẵn người ép, tức là lỗ
hổng Q1c được đóng ngay từ cấu trúc chứ không nhờ kỷ luật.

**Giới hạn.** n=3 sự kiện drift thật. Việc lập trình viên có để ý hay bỏ qua báo cáo stale
qua nhiều tuần làm việc nhiều người thì không thể xác định nếu không có một nghiên cứu trên
người thật.

---

## W2 — Thí nghiệm ngược *(null)*

Q1 thấy store không thêm được gì vì cái bẫy đã có nhà viết sẵn ở chỗ khác. W2 là chiều
ngược: một cái bẫy mà bản ghi được tin là **chỉ** tồn tại trong store. Cùng hai nhánh, cùng
dạng thang chấm, commit trước khi điều phối.

**Kết quả: 6/6 đều tránh được.** Nhánh A 3/3 với trung bình 18,7 lời gọi công cụ; nhánh B
3/3 với 22,3.

Hai lý do, và lý do thứ nhất là một chỗ sửa cho chính công việc trước đó của dự án:

1. **Tiền đề sai.** Cái bẫy *không* chỉ được ghi trong store — xem phần sửa ở Q1b bên trên.
2. **Mọi agent nhánh B đều tự tìm ra `docs/system/pitfalls.md`**, lặp lại kết quả của Q1:
   một agent đủ năng lực sẽ tự lục thư mục tài liệu mà không cần ai bảo.

**Giới hạn.** n=6. Chỉ một dòng model rất mạnh; một agent ít chủ động lục lọi hơn có thể phụ
thuộc vào con trỏ nhiều hơn.

---

## Hồ sơ này **không** chứng minh điều gì

Nói thẳng, vì một trang bằng chứng chỉ liệt kê chiến thắng thì là quảng cáo:

- **Không đo đạc nào ở đây cho thấy claim store cải thiện được kết cục.** Hai lần chạy, hai
  lần null. Cơ chế trụ được sau soi xét là **anchor** — thứ duy nhất trong danh sách này mà
  prose, một dòng changelog hay một conformance test không làm được — và giá trị của nó
  được chống đỡ bởi M1 (nó hoạt động) và Q1c (nó có điểm mù xác định), chứ không phải bởi
  một nghiên cứu về kết cục.
- **Cỡ mẫu nhỏ**: n=6, n=6, n=3, 13 và 18 claim. Đây là những giai thoại có thang chấm cố
  định. Chúng cho thấy một cơ chế chạy hay hỏng; chúng không cho ra được một tỉ lệ.
- **Người thiết kế bài toán cũng là người chấm.** Đó là giới hạn thật cho mọi kết quả ở
  trên, kể cả các kết quả âm tính.
