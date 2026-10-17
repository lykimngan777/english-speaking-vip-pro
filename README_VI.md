# English Speaking VIP Pro v2 — hướng dẫn triển khai

Gói này là starter có:
- Website bài học, lịch ôn D+1/D+3/D+7/D+14/D+30 và sổ lỗi (giữ dữ liệu local trong trình duyệt).
- Nút AI gia sư gọi Netlify Function `/.netlify/functions/tutor` để sửa câu qua OpenAI Responses API.
- Đăng nhập bằng email và đồng bộ một bản tiến độ JSON lên Supabase sau khi bạn cấu hình Supabase.
- SQL có bật Row Level Security để mỗi tài khoản chỉ truy cập dữ liệu của chính mình.

## A. Tạo repository GitHub
1. Giải nén gói này.
2. GitHub → New repository → đặt tên `english-speaking-vip-pro` → Private hoặc Public tùy bạn (khuyến nghị Private khi phát triển).
3. Upload toàn bộ nội dung bên trong thư mục, không upload thư mục bọc ngoài. Giữ nguyên `index.html`, `config.js`, `netlify.toml`, `package.json`, thư mục `netlify/`, `supabase/`.
4. Commit changes.

## B. Triển khai lên Netlify
1. Đăng nhập https://app.netlify.com/ → Add new project / Import an existing project.
2. Chọn GitHub và cấp quyền cho repository `english-speaking-vip-pro`.
3. Build command để trống; publish directory là `.` (hoặc giữ cấu hình từ `netlify.toml`). Deploy.
4. Mở Site configuration → Environment variables và thêm:
   - `OPENAI_API_KEY` = API key tạo trong OpenAI Platform. Giữ bí mật, không gửi cho ChatGPT trong tin nhắn, không commit vào GitHub.
   - `OPENAI_MODEL` = `gpt-6-luna` (đổi nếu model này chưa được cấp quyền trong tài khoản API của bạn).
5. Redeploy sau khi thêm biến môi trường. Từ website, vào Buổi học hôm nay, nhập câu rồi bấm “Sửa câu bằng AI”.

Lưu ý: ChatGPT Plus/Pro không đồng nghĩa có sẵn tín dụng OpenAI API; API billing có thể tính phí riêng.

## C. Tạo Supabase để đồng bộ
1. Tạo project tại https://supabase.com/dashboard.
2. Mở SQL Editor → New query → dán toàn bộ `supabase/schema.sql` → Run.
3. Vào Project Settings → API (hoặc Connect) và lấy Project URL cùng publishable/anon key.
4. Sửa `config.js`:
   - `SUPABASE_URL`: Project URL.
   - `SUPABASE_ANON_KEY`: publishable/anon key.
   Các giá trị này dùng ở trình duyệt; tuyệt đối không dùng service_role key ở đây.
5. Commit và push `config.js` lên GitHub, chờ Netlify deploy lại.
6. Supabase → Authentication → URL Configuration: đặt Site URL bằng URL Netlify của bạn; thêm URL đó vào Redirect URLs nếu cần.
7. Vào website → Dữ liệu & cài đặt → nhập email → Gửi link đăng nhập → mở email và xác thực.
8. Lưu một câu luyện tập, sau đó kiểm tra `user_progress` trong Supabase Table Editor. Mở website trên thiết bị khác, đăng nhập cùng email để tải tiến độ.

## D. Kiểm tra an toàn trước khi dùng thường xuyên
- Không commit `OPENAI_API_KEY`, mật khẩu, service_role key hoặc token vào repository.
- Giữ RLS bật; không cho `anon` đọc/ghi bảng `user_progress`.
- Đây là starter cá nhân, chưa có quota/rate limiting chống lạm dụng API. Đừng chia sẻ link công khai cho nhiều người trước khi bổ sung giới hạn yêu cầu.
- Đồng bộ hiện lưu toàn bộ tiến độ dưới dạng một JSON cho mỗi tài khoản; nếu mở nhiều tab/thiết bị và sửa cùng lúc, bản lưu sau có thể ghi đè bản trước. Nên dùng một thiết bị khi đang học trong giai đoạn đầu.
- AI chỉ đánh giá văn bản; không thể xác nhận phát âm thực tế nếu chưa gửi âm thanh.
- Nếu đổi email hoặc gặp lỗi redirect, kiểm tra Auth URL Configuration của Supabase.

## E. Cách hoạt động
- Frontend: `index.html`.
- Cấu hình public Supabase: `config.js`.
- Backend AI: `netlify/functions/tutor.mjs`.
- Biến bí mật: Netlify → Environment variables.
- Database/RLS: `supabase/schema.sql`.

Tham khảo tài liệu chính thức:
- OpenAI API quickstart: https://developers.openai.com/api/docs/quickstart
- Netlify Functions environment variables: https://docs.netlify.com/build/functions/environment-variables/
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
