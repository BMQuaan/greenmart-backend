# 🟢 Backend - Website Siêu thị trực tuyến GreenMart

**GreenMart Backend** là hệ thống API phục vụ cho **Website Siêu thị trực tuyến GreenMart** — một nền tảng thương mại điện tử chuyên về bán lẻ. Dự án được xây dựng bằng **Node.js** và **TypeScript**, cung cấp các tính năng.

---

## ⚙️ Công nghệ

### Ngôn ngữ & Môi trường

* **TypeScript** + Node.js (Express)
* **ES Modules**, hỗ trợ phát triển với `ts-node` và `nodemon`

### Cơ sở dữ liệu

* MongoDB với **Mongoose ORM**
* Slug hóa bằng `mongoose-slug-updater`

### Xác thực & Bảo mật

* **JWT (jsonwebtoken)** cho xác thực token
* **bcrypt** để mã hóa mật khẩu
* **cookie-parser** để đọc cookies
* **dotenv** để quản lý biến môi trường

### Middleware & Tiện ích

* **CORS**, **body-parser**, **multer** (upload file)
* **Zod** để validate dữ liệu đầu vào

### Email & Cloud

* **nodemailer** (gửi mail)
* **cloudinary** (upload ảnh)

### Khác

* Google OAuth (`google-auth-library`)
* **Slugify**, **md5** hỗ trợ xử lý chuỗi


---

## 💪 Cài đặt

```bash
git clone https://github.com/BMQuaan/greenmart-backend.git
cd greenmart-backend
npm install
```

Tạo file `.env`:

```env
PORT=3000
MONGO_URL=mongodb+srv://greenmart:Greenmart123@greenmart.wnccwvo.mongodb.net/GreenMart?retryWrites=true&w=majority&appName=GreenMart

JWT_SECRET=182865cbe7b41daf860ce70519348a829091e65ede99cc11e07975fc219ff642
JWT_REFRESH_SECRET=05ff799218f7e768826c84a85acbbab1ec1334bc3e67cfb7a49965d133c5df77
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=daphfcudn
CLOUDINARY_API_KEY=612411374265656
CLOUDINARY_API_SECRET=h5Qc9CYvlJf-5GTje6IGiQ24zNA

EMAIL_USER=greenmart.project@gmail.com
EMAIL_PASS=pxsf uqzy hvzh outu

GOOGLE_CLIENT_ID=1054005180024-cv0rvp5sv4ohjqfk5o85au4j129hmsuc.apps.googleusercontent.com
```

Khởi chạy dự án:

```bash
npm start       # Production
```

---

## 📂 Cấu trúc thư mục

```
greebnart-backend/
├── api/v1/
│   ├── controllers/      # Xử lý nghiệp vụ API
│   ├── middlewares/      # Xác thực, kiểm lỗi, logger
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Định nghĩa route
│   ├── validations/      # Kiểm tra dữ liệu đầu vào
│
├── config/               # Cấu hình kết nối (DB, env...)
├── dist/                 # Thư mục build sau khi biên dịch
├── helper/               # Hàm tiện ích dùng chung
├── node_modules/         # Thư viện phụ thuộc
│
├── .env                  # Biến môi trường
├── .gitignore
├── index.ts              # Điểm khởi chạy chính
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json         # Cấu hình TypeScript
```

---

## 👥 Nhóm Thực Hiện
- Nguyễn Ngọc Long - N22DCCN149
- Bùi Kinh Luân - N22DCCN151
- Bùi Minh Quân - N22DCCN163

## 📄 License
Dự án được thực hiện với mục đích học tập
