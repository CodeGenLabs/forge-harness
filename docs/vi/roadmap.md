# Lộ trình

Xây gì tiếp theo, và — với mức độ chắc chắn cao hơn — **không** xây gì. Mọi mục dưới đây đều
được biện minh dựa trên [hồ sơ bằng chứng](evidence.md) chứ không dựa trên một danh sách
tính năng mong muốn, bởi hồ sơ đó tỏ ra rất khắc nghiệt với đúng những tính năng hiển nhiên
nhất.

---

## Hiện trạng

Sáu đo đạc đã được ghi nhận. Đọc cùng nhau, chúng nói ba điều — và ngụ ý điều thứ tư.

**Claim store đã được đo hai lần và hai lần trả về null.** Q1 và W2 đều chạy sáu agent trên
hai nhánh; mười hai trên mười hai đều tránh được bẫy, và nhánh được chỉ vào store còn tốn
nhiều lời gọi công cụ hơn. Q1b phát hiện 11 trên 13 claim chỉ chép lại thứ mà người đọc
dù sao cũng gặp. **Viết prose cho claim hay hơn không phải là chỗ để cải thiện tiếp.**

**Anchor là cơ chế trụ được sau soi xét.** M1 cho thấy nó hoạt động (0,61% dương tính giả,
đóng về 0,00%); Q1c vẽ ra chính xác điểm mù của nó (7 trên 18 claim vỡ mà anchor không nhúc
nhích, vì một luật cả repo phải tuân thì không có symbol nào để bám vào). Một cơ chế có cả
sức mạnh đo được lẫn giới hạn đo được là cơ chế đáng xây tiếp lên trên.

**Báo cáo drift, ở dạng cũ, là một khoản thuế.** W1 tìm thấy 3 trên 3 sự kiện drift thật đều
được xử lý bằng restamp, không đổi dòng code hay claim nào, không ngăn được regression nào,
và 0 trên 18 claim có thể phân loại chỉ từ metadata của commit. Điều đó sinh ra thay đổi hệ
trọng nhất trong lịch sử dự án: `forge drift` nay **chạy các test `evidence` mà claim trích
dẫn**, và workflow `bugfix` biến một reproduce test đỏ thành `evidence:` của bất kỳ claim
nào con bug sinh ra.

**Và điều ngụ ý — lý do toàn bộ lộ trình này có hình dạng như vậy: mọi đo đạc tới giờ đều
chỉ kiểm tra claim store.** Vòng đời thay đổi — spec, tasks, gate, `verify`, archive — là
phần lớn hơn của codebase và **hoàn toàn chưa có bằng chứng nào**. Chưa ai hỏi liệu viết
spec trước có làm giảm rework hay không.

---

## Giai đoạn 0 — Dùng nó. Ngừng xây.

Mọi thứ bên dưới đều phụ thuộc vào mục này.

Forge đã ở 0.1.0, có tài liệu, có installer và ba host. `corvus-db-studio` đã mang sẵn các
conformance test bàn giao trong W3, nên nó đã đi được nửa đường. Thứ dự án **chưa bao giờ**
có: **một người dùng nó liên tục trên công việc thật của chính mình.** Mọi con số trên trang
bằng chứng đều là n=3 đến n=6, do agent tạo ra trên repository đi mượn, và do chính người
thiết kế bài toán chấm điểm.

**Áp dụng Forge lên một dự án thật, cho mười thay đổi thật.** Không cần đo đạc cầu kỳ. Chỉ
dùng, và ghi lại chỗ nào nó gây vướng — nhật ký ma sát đó là đầu vào cho mọi thứ tiếp theo.

Kiểu hỏng cần canh chính là kiểu mà harness này sinh ra để ngăn, quay ngược lại chính nó:
**nghi thức sinh ra artifact không ai đọc.** Nếu một thay đổi hai dòng mà chạy track C thấy
lố bịch, thì đó là **dữ liệu**, không phải vấn đề kỷ luật.

---

## R1 — `forge stats`

Đây chính là **phương án C của Q1 ngay từ phân tích đầu tiên**, khi đó được mô tả là "gần
như miễn phí vì artifact đã có sẵn", và chưa bao giờ được xây. Nó vô giá trị trước Giai đoạn
0 và có giá trị ngay sau đó, nên hai thứ đi cùng nhau.

**Nó phải báo cáo** — tất cả đều suy ra được từ `verification.json`, các thư mục change và
sổ drift:

- tỉ lệ rework — số change bị mở lại hoặc bị thay thế sau khi archive
- số lần verify đỏ trước lần xanh đầu tiên, theo từng change
- thời gian từ `change new` đến `archive`
- các sự kiện drift, và verdict mà mỗi cái nhận được (V1–V4 so với `confirm`)
- claim được thêm, nghỉ hưu và bị thay thế theo từng change
- **tỉ lệ enforcer**: tỉ lệ claim loại pitfall và invariant có nêu một test hoặc một guard

**Nó phải KHÔNG báo cáo**: số lượng claim, "% độ phủ tri thức", hay bất cứ thứ gì tăng lên
khi có người viết thêm một claim. Q1, Q1b và W2 đều chỉ cùng một hướng — thêm prose cho
claim không phải mục tiêu, và một chỉ số thưởng cho việc đó sẽ bị tối ưu theo.

---

## R2 — Đo vòng đời, không đo store nữa

Store đã được đo hai lần và hai lần trả lời null. Đo lần thứ ba không phải bước đi trung
thực; đo phần đa số chưa từng được kiểm tra mới là.

**Câu hỏi**: viết spec trước khi hiện thực có đổi được kết cục không, hay chỉ là chi phí phụ?

**Hình dạng**: một so sánh cặp trên công việc thật từ Giai đoạn 0. Các thay đổi tương đương
nhau, một nửa đi qua track B hoặc C đầy đủ spec và tasks, một nửa đi qua track A. So sánh
tỉ lệ rework, số phát hiện khi review, và thời gian đến xanh.

Kỷ luật như mọi đo đạc trước vẫn áp dụng và không thương lượng: **chốt thang chấm và điều
kiện null bằng một commit trước khi mở change đầu tiên.** Một đo đạc mà tiêu chí được chọn
sau khi đã thấy dữ liệu thì không phải đo đạc.

Hãy lường trước rằng nó khó chạy sạch hơn Q1, vì các thay đổi sẽ không phải cặp tương đồng
và người thực hiện biết mình đang ở nhánh nào. Hãy nói thẳng điều đó trong kế hoạch; một
giới hạn nêu trước có giá trị hơn một con số bào chữa sau.

---

## R3 — Làm claim store thành tùy chọn

Thí nghiệm quyết đoán rẻ nhất còn lại.

Hai thí nghiệm agent đã không cho thấy store giúp được gì. Cái thứ ba cũng sẽ không. Nhưng
**chạy không có store trong mười thay đổi thật rồi xem có thấy thiếu không** trả lời được
câu hỏi theo cách không thí nghiệm agent nào làm được, bởi người thấy thiếu sẽ nói được
chính xác là thiếu để làm gì.

Nó cũng gỡ rào cản áp dụng một cách trung thực. Hiện tại một repository mới phải bootstrap
một store **trước khi** thấy bất kỳ lợi ích nào, mà lợi ích đó lại chính là thứ chưa chứng
minh được. Anchor, vòng đời thay đổi, drift và `verify` không phụ thuộc vào một store đã
được điền; công cụ không nên giả vờ là có.

Nếu hoá ra store bị thấy thiếu, thì đó chính là kết quả dương tính mà hai thí nghiệm đã
không tạo ra được — và nó sẽ đến kèm một lời giải thích cụ thể rằng nó được cần để làm gì.

---

## R4 — Tỉ lệ enforcer là KPI thật của store

Kết luận của Q1c là `evidence:` — thứ ép buộc claim — mới là phần có giá trị, không phải
prose. Workflow `bugfix` đã ép điều đó **bằng cấu trúc**: một con bug sinh ra một reproduce
test đỏ, và test đó trở thành evidence của claim.

Nên câu hỏi đo được qua Giai đoạn 0 rất đơn giản: **tỉ lệ enforcer có tăng không?** Lần đầu
đo trên chính repository này, `forge check` báo 4 trên 5 claim không nêu enforcer nào. Nếu
mười thay đổi thật đẩy store về phía một danh mục những gì thực sự được ép buộc, thì store
đã tìm được việc mà prose không làm nổi. Nếu tỉ lệ không nhúc nhích, câu trả lời của R3 trở
nên dễ hơn nhiều.

---

## Rủi ro đang mang

Nêu ra vì chúng đã biết, không phải vì chúng cấp bách.

**Hook pre-commit nay chạy các test evidence.** `forge drift --staged --test` thực thi các
test mà claim trích dẫn, với timeout 30 giây mỗi mục tiêu và **không cache**. Trên một
repository lớn, một staged change chạm vào vài claim có thể làm mỗi lần commit chậm tới mức
người ta với tay sang `--no-verify` — và đó là cách một hook ngừng tồn tại. Cách giảm nhẹ,
theo thứ tự chi phí: cache kết quả theo commit SHA, chỉ chạy những claim có anchor thật sự
stale, và áp một ngân sách tổng thay vì ngân sách cho từng mục tiêu.

**Bộ test mất khoảng 12–15 phút trên Windows.** Chi phí nằm ở việc gọi git subprocess trong
các test lifecycle — 2 đến 4,5 giây mỗi test, nặng nhất là `test_the_acceptance_case` và các
test archive. Nó **không** do phần evidence execution mới gây ra, vốn chỉ tốn khoảng 0,4
giây mỗi test; điều này từng được giả định rồi đem đo, và giả định đã sai. Đây là ma sát cho
người đóng góp chứ không phải một khiếm khuyết, và nếu có đáng sửa thì cách sửa là dùng một
fixture repository dùng chung thay vì một cái cho mỗi test.

**Một người dùng, một hệ điều hành, một ngôn ngữ thật sự được vận hành.** C# nay đã có
grammar và bảng khai báo, nhưng **chưa repository C# nào được bootstrap**. Tính năng chưa
đối mặt thực tế, và dự án C# thật đầu tiên sẽ tìm ra vài thứ.

---

## Cố ý không xây

Mỗi mục dưới đây là một ý tưởng nghe rất hợp lý mà bằng chứng lại phản đối.

**Thêm host, trước khi có người dùng thứ hai.** Ba host đã vượt nhu cầu chứng minh được.
Thêm một host chỉ là một dòng trong bảng; chi phí nằm ở việc giữ cho mọi dòng đều trung
thực.

**Một store tri thức xuyên repository.** Vốn đã được hoãn ở mức P2 trong danh sách câu hỏi
mở, và chưa có gì kể từ đó làm lập luận mạnh lên. Tri thức trong phạm vi một repository còn
chưa chứng minh được là có ích; tri thức dùng chung chỉ là phiên bản lớn hơn của một canh
bạc chưa được chứng minh.

**Thêm loại claim, hoặc prose phong phú hơn.** Q1, Q1b và W2 đều chỉ ngược hướng này. Vấn đề
của store không phải là nó không diễn đạt được đủ.

**Bất kỳ chỉ số nào tăng lên khi có người viết thêm một claim.** Nêu hai lần là có chủ đích.

---

## Lộ trình này được sửa như thế nào

Bằng nhật ký ma sát từ Giai đoạn 0, và bằng `forge stats` khi nó đã có dữ liệu — chứ không
phải bằng việc suy luận xem một harness *nên* có gì. Ba trong sáu đo đạc trên trang bằng
chứng đều đi ngược thiết kế, và cả ba đều đã thay đổi được nó. Đó là cơ chế duy nhất của dự
án này đã thật sự hiệu quả một cách đáng tin cậy.
