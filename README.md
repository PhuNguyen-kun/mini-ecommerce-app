# How To Setup

## Backend

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
