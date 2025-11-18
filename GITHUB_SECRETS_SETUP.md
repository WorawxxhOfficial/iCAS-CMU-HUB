# GitHub Secrets Setup Guide

## ตั้งค่า Secrets สำหรับ CI/CD

เพื่อให้ CI/CD pipeline ทำงานได้ถูกต้อง คุณต้องตั้งค่า GitHub Secrets ดังนี้:

### ขั้นตอนการตั้งค่า

1. ไปที่ GitHub Repository ของคุณ
2. คลิก **Settings** (ตั้งค่า)
3. ในเมนูด้านซ้าย คลิก **Secrets and variables** → **Actions**
4. คลิก **New repository secret** เพื่อเพิ่ม secret แต่ละตัว

### Secrets ที่ต้องตั้งค่า

#### 1. SMTP_PASS
- **Name**: `SMTP_PASS`
- **Value**: `rnrd rhqt bdds tknl`
- **Description**: Gmail App Password สำหรับส่งอีเมล OTP

#### 2. LINE_CHANNEL_ACCESS_TOKEN
- **Name**: `LINE_CHANNEL_ACCESS_TOKEN`
- **Value**: `IgtnK/JcjYMpIzZQSHqbB0kQdLPWdjWj9TEJ050ayFYRDxSL1M6LuLJ28fdry6oABDt9WOeN/VtRYie5dSEgQE0/RQOKTF8X6b9JA0YUwvH/NuiTEu/55r97F7uRWK/gc/bP2dLk4ZUXs1aShLDD6AdB04t89/1O/w1cDnyilFU=`
- **Description**: LINE Bot Channel Access Token สำหรับส่งข้อความแจ้งเตือน

#### 3. LINE_CHANNEL_SECRET
- **Name**: `LINE_CHANNEL_SECRET`
- **Value**: `3110ecd8c8e5394724fab5333dc95ada`
- **Description**: LINE Bot Channel Secret สำหรับ verify webhook signature

#### 4. SMTP_USER (ถ้ายังไม่มี)
- **Name**: `SMTP_USER`
- **Value**: อีเมล Gmail ของคุณ (เช่น `your-email@gmail.com`)
- **Description**: Gmail address สำหรับส่งอีเมล

### ตรวจสอบการตั้งค่า

หลังจากตั้งค่า secrets แล้ว:

1. Push code ไปยัง branch `main` หรือ `develop`
2. ไปที่ **Actions** tab ใน GitHub
3. ตรวจสอบว่า CI/CD pipeline ทำงานได้ถูกต้อง
4. ตรวจสอบว่า tests ผ่านทั้งหมด (เขียวหมด)

### หมายเหตุ

- Secrets จะถูกใช้ใน GitHub Actions workflow เท่านั้น
- Secrets จะไม่ถูกแสดงใน logs หรือ output
- อย่า commit secrets ลงใน code หรือ repository
- ถ้า secrets เปลี่ยน ต้องอัปเดตใน GitHub Settings

### Troubleshooting

ถ้า CI/CD ยัง fail:

1. ตรวจสอบว่า secrets ถูกตั้งค่าถูกต้อง
2. ตรวจสอบว่า secret names ตรงกับที่ใช้ใน `.github/workflows/ci.yml`
3. ตรวจสอบ logs ใน GitHub Actions เพื่อดู error messages

