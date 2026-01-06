# How To Setup

## 🐳 Quick Start with Docker (Recommended)

### Prerequisites
- Docker và Docker Compose đã được cài đặt

### Steps

1. **Vào thư mục backend:**
   ```bash
   cd backend
   ```

2. **Tạo file .env** với các biến môi trường cần thiết:
   ```env
   # Database Configuration
   DB_ROOT_PASSWORD=123456
   DB_NAME=mini_ecommerce
   DB_USER=appuser
   DB_PASSWORD=123456

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # Cloudinary Configuration (nếu có)
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret

   # VNPay Configuration (nếu có)
   VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNPAY_TMN_CODE=your-vnpay-code
   VNPAY_HASH_SECRET=your-vnpay-secret
   VNPAY_RETURN_URL=http://localhost:3000/api/payment/vnpay-return
   ```

   **Quan trọng**: Tạo JWT_SECRET mạnh:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Start containers:**
   ```bash
   docker-compose up -d --build
   ```

   Lệnh này sẽ:
   - Build Docker image cho backend
   - Tạo MySQL container
   - Chạy migrations tự động
   - Start backend server

4. **Seed database (tùy chọn):**
   ```bash
   docker-compose exec backend npx sequelize-cli db:seed:all
   ```

5. **Kiểm tra:**
   - Backend API: http://localhost:3000
   - Health check: http://localhost:3000/health

### Các lệnh hữu ích

```bash
# Xem logs
docker-compose logs -f

# Xem logs chỉ backend
docker-compose logs -f backend

# Stop containers
docker-compose down

# Stop và xóa database
docker-compose down -v

# Restart backend
docker-compose restart backend

# Rebuild và restart
docker-compose up -d --build

# Chạy migrations thủ công
docker-compose exec backend npx sequelize-cli db:migrate

# Chạy seeders
docker-compose exec backend npx sequelize-cli db:seed:all
```

---

## Backend (Manual Setup)

### Technologies

- **Express.js** - Web framework
- **Sequelize** - ORM
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Project Structure

```
backend/
├── src/
│   ├── config/         # Database configuration
│   ├── constants/      # Application-wide fixed values
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Custom middlewares
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── validators/     # Request validation schemas
├── migrations/         # Database migrations
├── seeders/            # Database seeders
└── server.js           # Entry point
```

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mini-ecommerce-app/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then update `.env` with **your own database credentials and JWT secret**:

```env
# JWT Configuration
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d

# Database Configuration (MySQL)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=mini_ecommerce_local
DB_USER=your_mysql_username      # ← Change this
DB_PASSWORD=your_mysql_password  # ← Change this
```

> **Use this command in Terminal to generate JWT_SECRET**:
>
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Create MySQL Database

```bash
mysql -u your_username -p
CREATE DATABASE mini_ecommerce_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

Or create it via **MySQL Workbench/Navicat** with:

- Character Set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

### 5. Run Migrations & Seed Database

```bash
# Fresh setup (khuyên dùng cho lần đầu)
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

**Hoặc** nếu đã có migrations rồi:

```bash
# Chỉ seed data (cẩn thận: có thể conflict nếu data cũ còn tồn tại)
npx sequelize-cli db:seed:all
```

### 6. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

> **⚠️ Lưu ý**: Nếu gặp lỗi foreign key khi seed, chạy lại từ đầu:
> ```bash
## 📝 Available Scripts

- `npm start` - Run in production mode
- `npm run dev` - Run in development mode with auto-reload

### Database Commands

- `npx sequelize-cli db:migrate` - Run all migrations
- `npx sequelize-cli db:migrate:undo:all` - Undo all migrations (⚠️ xóa tất cả tables)
- `npx sequelize-cli db:seed:all` - Run all seeders
- `npx sequelize-cli db:seed:undo:all` - Undo all seeders (⚠️ chỉ xóa data, không xóa tables)

- `npm start` - Run in production mode
- `npm run dev` - Run in development mode with auto-reload
- `npx sequelize-cli db:migrate` - Run migrations
- `npx sequelize-cli db:seed:all` - Run all seeders
- `npx sequelize-cli db:migrate:undo` - Undo last migration
- `npx sequelize-cli db:seed:undo:all` - Undo all seeders
