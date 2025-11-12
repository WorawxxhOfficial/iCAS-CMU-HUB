# Integrated Club Administration System (iCAS-CMU HUB)

A comprehensive club management system built with React, TypeScript, and Node.js.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (สำหรับวิธี Docker)
- npm or yarn

---

## 📦 วิธีที่ 1: ใช้ Docker (แนะนำ)

วิธีนี้จะรันทั้ง Database (MySQL) และ Backend ใน Docker โดยอัตโนมัติ

### 1. เริ่มต้นด้วย Docker

```bash
# Start ทั้ง MySQL และ Backend
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps

# ดู logs
docker-compose logs -f

# ดู logs เฉพาะ MySQL
docker-compose logs -f mysql

# ดู logs เฉพาะ Backend
docker-compose logs -f backend
```

### 2. ตรวจสอบการทำงาน

- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`
- **MySQL Port**: `3307` (mapped จาก container port 3306)

### 3. Database Setup

Database จะถูก initialize อัตโนมัติด้วยไฟล์ `icas_cmu_hub.sql` เมื่อ container เริ่มทำงานครั้งแรก

**ข้อมูลการเชื่อมต่อ Database:**
- Host: `localhost` (จาก host machine) หรือ `mysql` (จาก container อื่น)
- Port: `3307` (จาก host machine) หรือ `3306` (จาก container อื่น)
- User: `root`
- Password: `rootpassword`
- Database: `icas_cmu_hub`

**Test Accounts (Password: `password123`):**

**สำหรับทดสอบ Check-In:**
- `leader@cmu.ac.th` - Leader role (ชมรมดนตรีสากล) - ใช้สร้าง QR Code และ Check-In
- `member@cmu.ac.th` - Member role (ชมรมดนตรีสากล) - ใช้ Check-In
- `member2@cmu.ac.th` - Member role (ชมรมดนตรีสากล) - ใช้ Check-In
- `member3@cmu.ac.th` - Member role (ชมรมกีฬา) - ใช้ Check-In

**Accounts อื่นๆ:**
- `admin@cmu.ac.th` - Admin role
- `leader2@cmu.ac.th` - Leader role (ชมรมกีฬา)
- `leader3@cmu.ac.th` - Leader role (ชมรมศิลปะ)
- `member4@cmu.ac.th` - Member role (ชมรมกีฬา)
- `member5@cmu.ac.th` - Member role (ชมรมศิลปะ)

### 4. Frontend Setup

```bash
# จาก project root
npm install
npm run dev
```

Frontend จะรันที่ `http://localhost:3000` พร้อม hot-reload

### 5. คำสั่ง Docker ที่ใช้บ่อย

```bash
# หยุด services
docker-compose stop

# เริ่ม services อีกครั้ง
docker-compose start

# หยุดและลบ containers
docker-compose down

# หยุดและลบ containers + volumes (ลบข้อมูล database)
docker-compose down -v

# Rebuild containers หลังจากแก้ไข Dockerfile
docker-compose up -d --build

# Restart service เฉพาะ
docker-compose restart backend
docker-compose restart mysql
```

### 6. การแก้ปัญหา Port 3306 ถูกใช้งานอยู่

หากพบ error `bind: Only one usage of each socket address (protocol/network address/port) is normally permitted`:

1. **วิธีที่ 1**: ปิด MySQL service ที่รันอยู่บนเครื่อง (เช่น XAMPP, MySQL Service)
2. **วิธีที่ 2**: เปลี่ยน port ใน `docker-compose.yml` จาก `3307:3306` เป็น port อื่น เช่น `3308:3306`

---

## 💻 วิธีที่ 2: ใช้ npm (Development)

วิธีนี้เหมาะสำหรับการพัฒนา โดยรัน Backend และ Frontend ด้วย npm และใช้ Database แบบเดิม (XAMPP/phpMyAdmin)

### 1. Database Setup (XAMPP MySQL)

1. เริ่ม XAMPP และ start MySQL service
2. เปิด phpMyAdmin: `http://localhost/phpmyadmin`
3. สร้าง database: `icas_cmu_hub`
4. Import schema: เปิดไฟล์ `icas_cmu_hub.sql` ใน phpMyAdmin SQL tab และรัน

### 2. Backend Setup

```bash
cd backend
npm install

# สร้างไฟล์ .env (ดู Environment Variables section)
npm run dev
```

Backend จะรันที่ `http://localhost:5000`

### 3. Frontend Setup

```bash
# จาก project root
npm install
npm run dev
```

Frontend จะรันที่ `http://localhost:3000` พร้อม hot-reload

---

## 🔧 Environment Variables

### Backend (.env) - สำหรับวิธี npm

สร้างไฟล์ `backend/.env`:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=icas_cmu_hub
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**หมายเหตุ**: 
- สำหรับ Docker: Environment variables ถูกตั้งค่าใน `docker-compose.yml` แล้ว
- สำหรับ npm: ต้องสร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`

### Frontend (.env) - Optional

สร้างไฟล์ `.env` ใน project root (ถ้า API URL แตกต่าง):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📁 Project Structure

```
├── backend/              # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── features/     # Feature modules
│   │   └── types/        # TypeScript types
│   └── Dockerfile        # Docker configuration
├── src/                  # React frontend
│   ├── components/       # React components
│   └── config/           # API configuration
├── docker-compose.yml    # Docker Compose configuration
├── icas_cmu_hub.sql     # Database schema and initial data
└── public/               # Static assets
```

---

## 🧪 Testing Database Connection

### วิธี Docker

```bash
# ตรวจสอบ health endpoint
curl http://localhost:5000/api/health

# หรือเปิดใน browser
# http://localhost:5000/api/health
```

### วิธี npm

```bash
cd backend
npm run dev
# ตรวจสอบ http://localhost:5000/api/health
```

หรือทดสอบโดยตรง:

```bash
cd backend
npx tsx src/scripts/test-connection.ts
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user (protected)

### Health
- `GET /api/health` - Health check and database connection status

---

## 🛠️ Development

### Backend

```bash
cd backend
npm run dev      # Development with hot-reload
npm run build    # Build for production
npm start        # Run production build
npm run type-check  # TypeScript type checking
```

### Frontend

```bash
npm run dev      # Development server
npm run build    # Production build
```

---

## 🐳 Docker Services

### Development Mode (แนะนำ)

**Setup:**
- **MySQL**: รันใน Docker (auto-initialize ด้วย SQL file)
- **Backend**: รันใน Docker (auto-restart)
- **Frontend**: รัน local ด้วย `npm run dev` (สำหรับ hot-reload)

```bash
# Start MySQL และ Backend
docker-compose up -d

# Frontend รันแยก
npm run dev
```

- Frontend: `http://localhost:3000` (local dev server with hot-reload)
- Backend API: `http://localhost:5000` (Docker container)
- MySQL: `localhost:3307` (จาก host machine)

### Production

```bash
docker-compose up -d
```

**หมายเหตุ**: Frontend service ถูก comment ไว้ใน `docker-compose.yml` 
หากต้องการรัน frontend ใน Docker ด้วย ให้ uncomment frontend service

---

## 📝 Notes

- **Docker Method**: Database จะถูก initialize อัตโนมัติด้วย `icas_cmu_hub.sql` เมื่อ container เริ่มทำงานครั้งแรก
- **npm Method**: ต้อง import `icas_cmu_hub.sql` ผ่าน phpMyAdmin หรือ MySQL client
- Frontend ใช้ axios สำหรับ API calls (configured ใน `src/config/api.ts`)
- Backend ใช้ TypeScript กับ Express และ mysql2
- หากมี MySQL รันอยู่บน port 3306 แล้ว Docker จะใช้ port 3307 แทน

---

## 🔍 Troubleshooting

### Port 3306 ถูกใช้งานอยู่

**ปัญหา**: `bind: Only one usage of each socket address (protocol/network address/port) is normally permitted`

**วิธีแก้**:
1. ปิด MySQL service ที่รันอยู่บนเครื่อง (XAMPP, MySQL Service, etc.)
2. หรือเปลี่ยน port ใน `docker-compose.yml` เป็น port อื่น

### Database ไม่ถูก initialize

**ปัญหา**: Database ว่างเปล่า

**วิธีแก้**:
```bash
# ลบ volume และสร้างใหม่
docker-compose down -v
docker-compose up -d
```

### Backend ไม่สามารถเชื่อมต่อ Database

**ปัญหา**: Backend ไม่สามารถเชื่อมต่อ MySQL container

**วิธีแก้**:
1. ตรวจสอบว่า MySQL container รันอยู่: `docker-compose ps`
2. ตรวจสอบ logs: `docker-compose logs mysql`
3. ตรวจสอบ environment variables ใน `docker-compose.yml`
