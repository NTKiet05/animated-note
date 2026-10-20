# 📝 Mẩu Ghi Chú (Animated Note)

> **Một góc nhỏ ấm áp, phong cách vẽ tay hoạt họa để lưu giữ mọi suy nghĩ, kế hoạch và ý tưởng thường ngày.**

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.12.0-brightgreen.svg?style=flat-square&logo=node.js)](https://nodejs.org)
[![Netlify Status](https://img.shields.io/badge/deploy-Netlify-00C7B7.svg?style=flat-square&logo=netlify)](https://www.netlify.com)
[![Platform](https://img.shields.io/badge/storage-Netlify%20Blobs-00C7B7.svg?style=flat-square)](https://docs.netlify.com/blobs/overview/)
[![JavaScript](https://img.shields.io/badge/frontend-Vanilla%20JS%20(ESM)-F7DF1E.svg?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-8%20passed-success.svg?style=flat-square)](tests/)

---

## 📖 Giới thiệu

**Mẩu Ghi Chú** là ứng dụng ghi chú cá nhân trực tuyến được thiết kế theo phong cách vẽ tay thủ công (hand-drawn skeuomorphic / doodle note). Ứng dụng mang lại cảm giác hoài niệm và thân thuộc như đang viết trên những mẩu giấy nhớ thật, đồng thời tích hợp đầy đủ các tiện ích hiện đại như phân loại nhóm, danh sách việc cần làm (to-do checklist), chú thích nội dòng dạng comment Word, gắn thẻ hashtag, xem theo lịch, mã hóa phiên bản và chia sẻ công khai qua liên kết bảo mật.

Ứng dụng vận hành với kiến trúc **Serverless hiện đại**: Giao diện tĩnh phân phối qua Netlify CDN, Backend xử lý bằng Netlify Functions, và cơ sở dữ liệu lưu trữ bền vững với Netlify Blobs (Key-Value Store với độ nhất quán cao). Không phụ thuộc vào các framework frontend cồng kềnh, toàn bộ mã nguồn sử dụng Vanilla JavaScript (ES Modules) thuần túy giúp tốc độ tải tức thì và tối ưu tài nguyên tối đa.

---

## ✨ Tính năng nổi bật

### 🎨 1. Trải nghiệm thị giác vẽ tay & Tùy biến trang giấy
- **5 gam màu giấy pastel cổ điển**: Vàng kem, Hồng phấn, Xanh matcha, Xanh mây, Tím oải hương.
- **4 họa tiết vân giấy (Paper Patterns)**: Giấy trơn (*blank*), Kẻ ngang (*lined*), Ô kẻ caro (*grid*), Chấm bi (*dot*).
- **Trang trí sinh động**: Hiệu ứng băng dính washi tape nhiều vị trí, ghim giấy, góc giấy gập nhẹ chân thực.
- **Phông chữ viết tay Việt hóa**: Nhúng sẵn phông **Mali** và **Nunito** định dạng WOFF2, hiển thị mượt mà đầy đủ dấu tiếng Việt trên mọi thiết bị.
- **Nhiều chế độ hiển thị**:
  - **Lưới (Grid)**: Bố cục gọn gàng, trực quan.
  - **Bảng ghim nghiêng (Corkboard)**: Hiệu ứng các mẩu giấy được ghim nghiêng tự nhiên như bảng ghi nhớ trên tường.
  - **Lịch tháng (Calendar)**: Xem và theo dõi các ghi chú gắn theo từng ngày trong tháng.

### ✍️ 2. Trình soạn thảo thông minh & Chế độ tập trung (Zen Mode)
- **Soạn thảo nhanh**: Mở và sửa ghi chú trực tiếp trong khung giấy nhỏ.
- **Chế độ phóng to toàn màn hình (Focus / Zen Reader & Editor)**:
  - Cột công cụ trực quan bên trái, khung nhập liệu rộng rãi chiếm trọn chiều cao bên phải.
  - Thống kê thời gian thực: Đếm từ, đếm ký tự và thời gian đọc dự tính.
- **Định dạng văn bản phong phú (Rich Text)**:
  - In đậm, đổi màu chữ, đổi cỡ chữ.
  - Gạch chân thông minh (tự động bỏ qua khoảng trắng).
  - Bút highlight đánh dấu nhiều sắc màu tùy chọn.
  - Nút tẩy nhanh xóa định dạng trên đoạn văn bản đã chọn.
- **Hệ thống chú thích (Annotations / Comments)**: Bôi đen một đoạn chữ để để lại lời bình/chú thích bên lề tương tự tính năng bình luận trong Word, có thể bấm để đóng/mở tiện lợi.

### 📋 3. Tiện ích ghi chú đa năng
- **To-Do Checklist**: Tích hợp danh sách việc cần làm có checkbox tương tác và hiệu ứng gạch ngang khi hoàn thành.
- **Gắn nhãn `#tag`**: Gắn thẻ tùy biến và lọc nhanh các ghi chú cùng chủ đề qua đám mây thẻ tag (Tags Cloud).
- **Phân loại nhóm (Categories)**: Tạo mới, đổi tên, xóa nhóm và quản lý danh mục ghi chú khoa học.
- **Ghim lên đầu (Pin)**: Ghim những mẩu giấy quan trọng lên vị trí đầu tiên.
- **Tìm kiếm tức thì**: Tìm kiếm nhanh theo tiêu đề, nội dung ghi chú hoặc danh mục nhóm.

### 🌐 4. Quản lý trạng thái & Chia sẻ công khai
- **Lưu trữ (Archive)**: Ẩn các ghi chú đã xong khỏi màn hình chính mà không làm mất dữ liệu.
- **Thùng rác an toàn (Trash & Restore)**: Xóa mềm vào thùng rác, cho phép khôi phục khi cần hoặc dọn sạch vĩnh viễn.
- **Chia sẻ công khai (Public Share)**: Tạo liên kết bí mật qua token ngẫu nhiên để chia sẻ ghi chú cho người khác đọc trực tuyến mà không cần đăng nhập.
- **Sao lưu dữ liệu (Backup JSON)**: Xuất toàn bộ dữ liệu ghi chú và danh mục về máy chỉ với một thao tác.

### 🔒 5. Bảo mật tài khoản vững chắc
- **Đăng ký / Đăng nhập không cần email**: Chỉ cần chọn một tên tài khoản và mật khẩu.
- **Mã hóa chuẩn công nghiệp**: Mật khẩu được băm bằng thuật toán `scrypt` với muối ngẫu nhiên (salt) chống tấn công Rainbow Table.
- **Bảo mật phiên (Session Security)**: Token phiên được lưu trữ trong Cookie với cờ `HttpOnly`, `SameSite=Strict` và thời hạn 30 ngày.
- **Mã khôi phục tài khoản (Recovery Key)**: Cung cấp mã bí mật khi tạo tài khoản để đặt lại mật khẩu trong trường hợp quên mật khẩu.
- **Cô lập dữ liệu tuyệt đối**: Mỗi tài khoản chỉ đọc và ghi dữ liệu trong không gian lưu trữ riêng biệt (`users/<user-id>/`).

### 📱 6. Hoạt động như ứng dụng cài đặt (PWA)
- Tương thích tốt trên cả máy tính, máy tính bảng và điện thoại thông minh.
- Khai báo Web App Manifest (`manifest.webmanifest`) và Service Worker (`sw.js`) cho phép "Thêm vào màn hình chính" (Add to Home Screen) trên iOS và Android.

---

## 🏗️ Kiến trúc & Công nghệ

```
┌─────────────────────────────────────────────────────────┐
│                   Trình duyệt người dùng                │
│       Vanilla JS (ESM) + CSS3 Skeuomorphic + PWA        │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS Fetch
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Netlify CDN / Edge                   │
│         Phân phối Static Assets (HTML, CSS, Fonts)      │
└───────────────────────────┬─────────────────────────────┘
                            │ API Routes (/api/*)
                            ▼
┌─────────────────────────────────────────────────────────┐
│             Netlify Functions (Node.js 22+)             │
│        ├── /api/auth       (Đăng ký, Đăng nhập, Token)  │
│        ├── /api/notes      (CRUD Note, Checklist, Tags) │
│        ├── /api/categories (Quản lý nhóm danh mục)      │
│        ├── /api/trash      (Thùng rác, Khôi phục)       │
│        ├── /api/share      (Chia sẻ công khai)          │
│        └── /api/backup     (Xuất dữ liệu dự phòng)      │
└───────────────────────────┬─────────────────────────────┘
                            │ Read / Write
                            ▼
┌─────────────────────────────────────────────────────────┐
│               Netlify Blobs (Store Key-Value)           │
│     ├── auth/users/               (Tài khoản & Hash)    │
│     ├── auth/sessions/            (Phiên làm việc)      │
│     ├── users/{user_id}/notes/    (Dữ liệu ghi chú)     │
│     ├── users/{user_id}/categories(Danh mục cá nhân)    │
│     └── public/shares/            (Ghi chú chia sẻ)     │
└─────────────────────────────────────────────────────────┘
```

- **Frontend**: HTML5 Semantic, CSS3 Hiện đại (Custom Properties, Grid, Keyframes Animation), Vanilla JavaScript thuần túy không dùng framework bên thứ ba.
- **Backend**: Netlify Functions (Serverless Node.js 22+).
- **Lưu trữ**: `@netlify/blobs` (Strong consistency key-value storage).
- **Môi trường cục bộ**: Tích hợp sẵn `scripts/dev-server.mjs` mô phỏng Netlify Functions và Netlify Blobs trên bộ nhớ cục bộ mà không cần cài đặt thêm phần mềm ngoài.
- **Kiểm thử**: Node.js Test Runner tích hợp sẵn (`node --test`).

---

## 📁 Cấu trúc thư mục dự án

```text
animated-note/
├── netlify/
│   └── functions/
│       ├── auth-core.mjs        # Logic mã hóa scrypt, quản lý session & xác thực
│       ├── auth.mjs             # Router API xác thực (/api/auth/...)
│       └── notes.mjs            # Router API ghi chú, nhóm, thùng rác, chia sẻ
├── scripts/
│   ├── check-project.mjs       # Script kiểm tra tính toàn vẹn cấu trúc dự án
│   └── dev-server.mjs          # Máy chủ chạy cục bộ giả lập Netlify Blobs
├── static/
│   ├── assets/
│   │   └── fonts/              # Các font Mali & Nunito WOFF2 tự host kèm license
│   ├── app.js                  # Toàn bộ logic giao diện, xử lý state và sự kiện
│   ├── styles.css              # Bảng định dạng giao diện giấy vẽ tay & responsive
│   ├── favicon.png             # Biểu tượng ứng dụng
│   ├── index.html              # Bộ khung giao diện ứng dụng
│   ├── manifest.webmanifest    # Tệp khai báo PWA cho thiết bị di động
│   └── sw.js                   # Service Worker hỗ trợ PWA
├── tests/
│   ├── auth.test.mjs           # Bộ test kiểm tra hệ thống xác thực và mật khẩu
│   └── notes.test.mjs          # Bộ test kiểm tra toàn bộ tính năng ghi chú và API
├── .gitignore                  # Bỏ qua node_modules, .local-data, .netlify...
├── LICENSE                     # Giấy phép nguồn mở MIT
├── netlify.toml                # Cấu hình chuyển hướng và build trên Netlify
├── package.json                # Khai báo thông tin dự án và scripts
└── README.md                   # Tài liệu hướng dẫn sử dụng dự án
```

---

## 🚀 Hướng dẫn cài đặt & Chạy trên máy cục bộ

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản `>= 22.12.0` (khuyên dùng bản LTS mới nhất).
- **npm**: Đi kèm với Node.js.

### 2. Cài đặt các gói phụ thuộc
Clone mã nguồn về máy và cài đặt thư viện:

```bash
git clone https://github.com/NTKiet05/animated-note.git
cd animated-note
npm install
```

### 3. Khởi chạy máy chủ phát triển (Dev Server)
Khởi động máy chủ cục bộ tích hợp sẵn (tự động mô phỏng cơ chế Blobs vào thư mục `.local-data/`):

```bash
npm run dev
```

Mở trình duyệt và truy cập vào: **`http://localhost:8888`**

### 4. Chạy kiểm thử tự động (Unit Tests)
Chạy bộ kiểm thử toàn diện với test runner chuẩn của Node.js:

```bash
npm test
```

Kiểm tra tính nhất quán tài nguyên và các liên kết DOM trong dự án:

```bash
npm run check
```

---

## ☁️ Triển khai lên Netlify

### Cách 1: Kết nối trực tiếp với GitHub (Khuyên dùng)
1. Đăng nhập vào [Netlify](https://app.netlify.com/).
2. Chọn **"Add new site"** → **"Import an existing project"**.
3. Chọn nhà cung cấp **GitHub** và chọn kho lưu trữ `animated-note`.
4. Điền cấu hình cơ bản (Netlify sẽ tự động nhận diện tệp `netlify.toml`):
   - **Build command**: để trống (hoặc `npm run check`)
   - **Publish directory**: `static`
   - **Functions directory**: `netlify/functions`
5. Nhấn **Deploy** để hoàn tất.

### Cách 2: Triển khai qua Netlify CLI
Cài đặt công cụ dòng lệnh của Netlify và phát hành:

```bash
npx netlify login
npx netlify deploy --build --prod
```

### Cách 3: Kéo thả file ZIP (Netlify Drop)
1. Nén các tệp/thư mục sau vào tệp `mau_ghi_chu.zip` (đảm bảo nằm ngay gốc file nén):
   - `static/`
   - `netlify/`
   - `package.json`
   - `netlify.toml`
2. Mở [Netlify Drop](https://app.netlify.com/drop) và kéo thả tệp zip vào để triển khai ngay lập tức.

### ⏰ Duy trì Supabase (Keep-Alive Cron)
Để ngăn chặn dự án Supabase gói Free bị tạm ngưng (pause) sau 7 ngày không có tương tác, dự án tích hợp sẵn **Netlify Scheduled Function** (`netlify/functions/supabase-keep-alive.mjs`) tự động gửi request kích hoạt mỗi ngày (`@daily` lúc 00:00 UTC):

1. **Cấu hình biến môi trường trên Netlify:**
   - Truy cập **Site configuration** > **Environment variables** > **Add a variable**.
   - Thêm các biến sau:
     - `SUPABASE_URL`: Đường dẫn URL dự án Supabase của bạn (ví dụ: `https://abcdefghijkl.supabase.co`).
     - `SUPABASE_ANON_KEY`: Khóa API `anon` công khai (lấy tại *Supabase Dashboard > Project Settings > API*).
     - *(Tùy chọn)* `SUPABASE_TABLE`: Tên bảng cần truy vấn kích hoạt dữ liệu (ví dụ: `notes`).
2. **Kiểm tra trạng thái:**
   - Trên Netlify: Vào **Functions** > chọn `supabase-keep-alive` > bấm **"Run now"** để gửi ping thử nghiệm ngay lập tức.
   - Khi chạy cục bộ: Truy cập `http://localhost:3000/api/supabase-keep-alive` để xem phản hồi JSON.
   - Kèm theo workflow **GitHub Actions** (`.github/workflows/supabase-keep-alive.yml`) chạy dự phòng song song hoàn toàn tự động.

---

## 🔌 Danh mục API Endpoints

### 🔐 Xác thực & Người dùng (`/api/auth`)
| Phương thức | Đường dẫn | Chức năng |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Đăng ký tài khoản mới (cung cấp mã khôi phục) |
| `POST` | `/api/auth/login` | Đăng nhập và thiết lập cookie phiên `auth_token` |
| `POST` | `/api/auth/logout` | Đăng xuất và vô hiệu hóa phiên |
| `GET` | `/api/auth/me` | Lấy thông tin tài khoản hiện tại |
| `POST` | `/api/auth/change-password` | Thay đổi mật khẩu tài khoản |
| `POST` | `/api/auth/recover` | Đặt lại mật khẩu mới bằng mã dự phòng |

### 📝 Ghi chú & Tiện ích (`/api/notes`)
| Phương thức | Đường dẫn | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/api/notes` | Danh sách ghi chú của người dùng (hỗ trợ lọc theo danh mục) |
| `POST` | `/api/notes` | Tạo mới một mẩu ghi chú |
| `GET` | `/api/notes/:id` | Lấy chi tiết một ghi chú theo ID |
| `PUT` | `/api/notes/:id` | Cập nhật nội dung, màu sắc, vân giấy, nhãn của ghi chú |
| `DELETE` | `/api/notes/:id` | Xóa hoàn toàn ghi chú khỏi cơ sở dữ liệu |
| `POST` | `/api/notes/:id/archive` | Chuyển ghi chú vào mục lưu trữ |
| `POST` | `/api/notes/:id/unarchive` | Đưa ghi chú ra khỏi mục lưu trữ |
| `POST` | `/api/notes/:id/trash` | Chuyển ghi chú vào thùng rác (xóa mềm) |
| `POST` | `/api/notes/:id/restore` | Khôi phục ghi chú từ thùng rác |
| `POST` | `/api/notes/:id/share` | Tạo liên kết chia sẻ công khai kèm token bí mật |
| `GET` | `/api/share/:token` | Xem ghi chú công khai theo token (không cần đăng nhập) |

### 🗂️ Danh mục, Thùng rác & Sao lưu
| Phương thức | Đường dẫn | Chức năng |
| :--- | :--- | :--- |
| `GET` | `/api/categories` | Lấy danh sách các nhóm ghi chú |
| `POST` | `/api/categories` | Tạo nhóm ghi chú mới |
| `PUT` | `/api/categories/:id` | Đổi tên nhóm ghi chú |
| `DELETE` | `/api/categories/:id` | Xóa nhóm ghi chú |
| `GET` | `/api/trash` | Xem danh sách các ghi chú đang nằm trong thùng rác |
| `DELETE` | `/api/trash` | Xóa sạch vĩnh viễn toàn bộ ghi chú trong thùng rác |
| `GET` | `/api/backup` | Tải về bản sao lưu toàn bộ dữ liệu dưới dạng JSON |

---

## 🛡️ An toàn & Bảo mật

- **Không lưu mật khẩu dạng thô**: Toàn bộ mật khẩu được băm an toàn thông qua hàm dẫn xuất khóa `crypto.scrypt` với muối ngẫu nhiên có độ dài tiêu chuẩn 16 bytes.
- **Bảo vệ chống giả mạo phiên**: Cookie lưu session token luôn đi kèm thuộc tính `HttpOnly` (ngăn mã độc JavaScript đọc cookie) và `SameSite=Strict` (phòng chống tấn công CSRF).
- **Phân tách dữ liệu đa người dùng**: Mọi thao tác truy vấn dữ liệu đều yêu cầu xác thực phiên hợp lệ và giới hạn khóa đọc/ghi chặt chẽ trong vùng `users/<user-id>/` trên Netlify Blobs.

---

## 📄 Giấy phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Xem chi tiết tại tệp [LICENSE](LICENSE).

---

## 👤 Tác giả

Phát triển bởi **[Nguyen Tuan Kiet](https://github.com/NTKiet05)**.  
Nếu bạn yêu thích dự án, hãy tặng một ⭐️ **Star** trên GitHub để ủng hộ nhé!
