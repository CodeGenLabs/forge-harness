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

## Bổ sung từ thực tế sử dụng, 17-09-2026

R1 đến R4 được lập luận từ các đo đạc. Bốn mục dưới đây được lập luận từ thứ mà dự án
chưa từng có: **một người dùng nó trên công việc của chính mình và nói ra chỗ nào đau.**
Mục kết của lộ trình này nói rằng nó được sửa bằng đúng thứ đó, nên đây không phải ngoại
lệ với kỷ luật của nó - đây là lần đầu tiên kỷ luật đó vận hành.

Chúng được xếp theo chi phí đối chiếu với khả năng thành công, không theo mức độ đau của
vấn đề. R5 cũng làm dịch chuyển R3, vì lý do nêu trong R5.

## R5 — Tri thức ràng buộc được session sau

**Từ thực tế sử dụng.** Luật đã thống nhất ở session này thì session sau mất sạch; một sửa
đổi tưởng chỉ gói trong một tính năng hoá ra ảnh hưởng các tính năng về sau, và không chỗ
nào ghi lại điều đó.

**Vì sao Q1 và W2 chưa giải quyết câu này.** Cả hai đo cùng một thứ: một con trỏ tới tri
thức đã biên tập có giúp **một** agent tránh bẫy trong một repository vốn đã tự ghi chép tốt
không. Hai lần null. **Không cái nào đo xem một quyết định lấy ở session N có ràng buộc
được session N+1 hay không.** Q1b đã gọi tên chiều đó — **tầm với**, tri thức được ghi ở chỗ
chẳng dính gì tới nơi làm việc — và chưa ai thử. Hơn nữa, một luật thống nhất trong hội
thoại thì **không có tài liệu nào để mà trùng lặp**, khiến nó đúng là loại tri thức duy nhất
mà Q1b kết luận store nên sở hữu.

**Hai cơ chế, cả hai đều dùng lại thứ đã có.**

- **Một bước kết sổ.** Khi một change được archive, hỏi: điều gì đã được thống nhất mà chưa
  chỗ nào ghi? Forge có `archive`; nó không có khoảnh khắc nào đặt câu hỏi này.
- **Heuristic ghi lại là tính được, không phải phán đoán.** `forge impact` vốn đã tách diff
  khỏi blast radius. Một sửa đổi mà **blast radius vượt xa diff của nó**, hoặc chạm tới một
  module dùng chung, là ứng viên claim; một sửa đổi mà bán kính đúng bằng diff của nó thì là
  chuyện cục bộ và không nên ghi. Đó chính là trực giác "xem chỗ sửa ảnh hưởng tới đâu",
  được cơ giới hoá.

**Ràng buộc.** Dùng lại `CON-`, `PIT-` và ADR. **Không thêm loại claim mới** — "thêm loại
claim" nằm trong danh sách cố ý không xây bên dưới, và mục này không được phép là ngoại lệ
đầu tiên.

**Điều gì tính là thất bại, tuyên bố ngay bây giờ.** Nếu qua mười thay đổi thật, các claim
được ghi theo cách này không bao giờ được session sau trích dẫn, hoặc cùng những câu hỏi đã
chốt vẫn bị mang ra cãi lại với tần suất như cũ, thì cơ chế đã thất bại và phản ứng trung
thực là **xoá nó đi**. Chỉ số thay thế đo được: số quyết định bị cãi lại trên mỗi session.

**Ghi chú về thứ tự — mục này làm dịch chuyển R3.** R3 đề xuất chạy không có store để xem có
thấy thiếu không. Nếu thí nghiệm đó chạy **trước** R5, store sẽ không bị thấy thiếu vì một
lý do vô nghĩa: **nó chưa bao giờ được giao việc này.** **R5 phải đi trước**, nếu không kết
quả null của R3 chẳng trả lời được gì.

---

## R6 — Siết chặt khâu tiếp nhận dự án mới

**Từ thực tế, kèm một chẩn đoán.** `corvus-db-studio` bắt đầu bằng một file manual của
Navicat và yêu cầu "làm một thứ giống Navicat". Thứ trả về không có flow màn hình, có nút
bấm nhưng bấm không làm gì, có dummy data nấp sau một giao diện trông như đang chạy thật, và
các tính năng được hiện thực theo cách hiểu đen đủi nhất — SQL editor là một ô text, không
tô cú pháp, không số dòng, không search/replace, không beautify, trong khi **sản phẩm tham
khảo có đủ và file manual được cung cấp có mô tả**.

Thất bại này có hình dạng chính xác: **agent hiện thực mức tối thiểu thoả mãn câu chữ, không
phải sản phẩm mà câu chữ ngụ ý.** Nó còn tệ hơn khi có sẵn tài liệu tham khảo, vì thông tin
đã nằm đó mà không được dùng.

**Ba bổ sung.**

- **Ý đồ sản phẩm, viết một lần, lúc khai sinh.** `docs/system/product.md`: sản phẩm này tồn
  tại để làm gì, cho ai, tham khảo những sản phẩm nào, và — phần thực sự có tác dụng —
  **non-goals cùng danh sách hoãn**. `OVERVIEW.md` mô tả *hệ thống*; không gì mô tả *ý đồ*,
  và đó là lý do "giống Navicat" chưa bao giờ được chuyển thành một phạm vi.
- **Một artifact flow trước khi có task.** Requirement mang theo scenario; không gì ép mô tả
  **sự di chuyển giữa các màn hình**, mà đó đúng là thứ đã thiếu.
- **Reference parity (đối chiếu sản phẩm tham khảo).** Khi có sản phẩm tham khảo, spec của
  mỗi tính năng phải **liệt kê sản phẩm đó làm được gì**, và từng mục hoặc được xây, hoặc
  **hoãn tường minh kèm lý do**. Với một SQL editor, danh sách đó là: tô cú pháp, số dòng,
  search/replace, beautify, autocomplete. **Im lặng mới là con bug.**

Hai luật nhỏ hơn cũng sinh ra từ cùng sự cố: một control tương tác phải truy vết được về một
requirement hoặc **không được tồn tại**; và giao hàng với dummy data nấp sau giao diện trông
như thật là **một gate trượt**, không phải một ghi chú về phong cách.

**Chốt an toàn, quan trọng hơn cả ba bổ sung.** Đầu ra là **một danh sách hoãn tường minh,
không phải bắt buộc hiện thực**. "Không được im lặng bỏ sót" **không phải** là "phải xây tất
cả". Thiếu chốt này thì mọi dự án mới biến thành nghi thức — đúng kiểu hỏng mà Giai đoạn 0
cảnh báo — và harness bị gỡ sau ba tuần.

**Điều gì tính là thất bại.** Nếu các artifact vẫn được viết ra mà vẫn thiếu đúng những thứ
cũ — một danh sách parity điền đầy mà không mục nào từng được chọn làm, hoặc một danh sách
hoãn mà hoãn tất — thì khâu tiếp nhận chỉ là con dấu. Tín hiệu thứ hai: nếu khâu tiếp nhận
của một dự án mới **lâu hơn bản chạy được đầu tiên** của nó, thì nghi thức đã thắng.

**Chưa làm bây giờ:** sinh BRD, SRS hay FRS thành tài liệu riêng. Mỗi thứ đó đều chép lại
các capability spec, và hai nguồn trôi xa nhau chính là thất bại mà harness này sinh ra để
phát hiện. Nếu sau này cần một SRS cho audit hay cho khách hàng, nó nên được **xuất ra từ
các spec** chứ không viết song song — và chỉ khi có người thật đòi.

---

## R7 — Một điều kiện kiểm tra `ui`

**Từ thực tế.** Vỡ layout, control biến mất ở bề ngang hẹp, chữ trong bảng bị rớt khi thu
nhỏ, màu đặt tuỳ tiện cho text, label và tag. Lý do những lỗi này lọt qua review đã được ghi
nhận: **type-check, lint và build đều xanh trong khi layout vỡ.** Chúng là một lớp khiếm
khuyết riêng và cần một phép kiểm riêng.

**Cơ chế, và nó giữ nguyên kiến trúc.** Thêm `ui` vào `CONDITIONS` và vào `commands:`. Forge
**không render gì cả** và không thêm dependency nào — nó chạy bộ test **của chính dự án**
(Playwright + axe) rồi ghi lại kết quả, y hệt cách nó đã làm với `tests`. **Bằng chứng,
không phải ý kiến.**

Những gì bộ test đó nên khẳng định, theo thực hành đã công bố:

- không có overflow ngang ở một tập viewport đã khai báo, và chỉ tính là lỗi khi không tổ
  tiên nào có `overflow-x`
- mọi control tương tác đều tiếp cận được ở **mọi** breakpoint
- màu **chỉ lấy từ token** — không hex thô trong component
- tương phản WCAG AA, vốn **tính được** chứ không phải cảm nhận
- vùng chạm 44px, và cắt chữ phải khai báo chứ không phải vô tình

**Một thứ bắt buộc phải là quyết định được ghi lại chứ không phải mặc định.** Không tồn tại
bảng responsive đúng. Bảng dùng để **so sánh** phải giữ hàng và cột, cuộn ngang và ghim cột
đầu; bảng dùng để **liệt kê** thì xếp chồng tốt hơn. Và xếp chồng bằng `display` **phá huỷ
semantics gốc của table mà screen reader dựa vào**. Chọn đằng nào cũng là một sự đánh đổi,
nên lựa chọn đó thuộc về spec, không thuộc về cái mà thư viện component tình cờ để mặc định.

**Điều gì tính là thất bại.** Nếu `ui` báo `unavailable` trên mọi dự án vì chẳng ai dựng bộ
test, thì điều kiện đó là diễn và nên bị gỡ. Tín hiệu thứ hai: nếu sau mười thay đổi thật
trên một dự án **có** bộ test mà điều kiện chưa một lần báo `fail`, thì hoặc các khẳng định
quá yếu, hoặc vấn đề vốn không có ở đó — và cả hai đều đáng biết.

---

## R8 — Cấm cái trung bình, không kê đơn gì cả

**Từ thực tế.** Frontend mang một "cảm giác do AI làm" nhận ra được ngay. Nguyên nhân không
phải model yếu; đó là **trung bình hoá thống kê trên đầu vào không có ràng buộc**. Model dự
đoán thiết kế khả dĩ nhất, và thiết kế khả dĩ nhất là trung bình cộng của mọi thứ nó từng
thấy. Các dấu vết năm 2026 cụ thể đến mức gọi tên được: gradient tím sang xanh, Inter làm
font mặc định, bốn card trong một lưới, và **một border-radius với một padding áp cho mọi
thứ** khiến trang đọc lên phẳng lì.

**Cơ chế: một danh sách phủ định, không phải một phong cách.** Một skill mang theo những
mặc định bị cấm **chính vì chúng là mặc định**, và không kê đơn thứ gì thay thế. Cấm cái
trung bình thì buộc phải chọn, mà đã chọn thì phải có lý do. Đây là dạng duy nhất của luật
này **không giới hạn thứ agent được phép sáng tạo**.

**Chỉ là hướng dẫn, không bao giờ là gate.** Forge đã đo chính các cơ chế của mình và công
bố cả chỗ chúng thất bại; nó **chưa giành được** thẩm quyền về thẩm mỹ, và tự nhận thẩm
quyền đó sẽ mâu thuẫn với trang bằng chứng. R7 gác các kiểu hỏng. R8 chỉ lập luận.

Các design system đáng **đọc** chứ không phải đáng chép, vì đều công bố token, component và
hướng dẫn sử dụng dưới giấy phép mở: **Primer** (GitHub) trước tiên cho bất cứ thứ gì **dày
đặc dữ liệu**, vốn đúng hình dạng của một database client; rồi Carbon, Spectrum, Material 3
và Cloudscape.

**Điều gì tính là thất bại — và đây là cái tinh vi.** Nếu danh sách cấm biến thành một đồng
phục mới — ai cũng tránh màu tím rồi cùng giao màu xanh lá — thì nó đã **thay một cái trung
bình bằng một cái trung bình khác**, và còn tệ hơn vì trông có vẻ có nguyên tắc. Danh sách
phải cấm **loại mặc định**, không phải liệt kê màu bị cấm, và nó phải được đọc lại đối chiếu
với sản phẩm thật chứ không phải được bảo trì bằng cách thêm vào.

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
