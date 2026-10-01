# Sawasdee Dog

เว็บรวมสถานที่ที่ต้อนรับหมา ทีมครูฝึกสาย R+ เก็บและคัดเองทุกรายการ

- ไฟล์งานออกแบบอยู่ใน [`design/`](design/DESIGN-HANDOFF.md) (tokens, ไอคอน, ม็อกอัปทุกหน้า)
- ตัวเว็บใช้ Next.js 16 (App Router) + TypeScript และ CSS ล้วน (`src/app/globals.css`)

## เริ่มใช้งาน

```bash
npm install
npm run dev        # http://localhost:3000
```

คำสั่งอื่น: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`

ค่า environment ดูได้ใน `.env.example` ตอน dev ไม่ต้องตั้งอะไรเลย ปุ่ม LINE จะ login เป็นผู้ทดสอบให้อัตโนมัติ

## โครงสร้าง

| Route                                                                        | ไฟล์                                      | ม็อกอัป                                        |
| ---------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------- |
| `/`                                                                          | `src/app/page.tsx`                        | M-Home, M-Home-Sponsor, D-Home, M-Area         |
| `/[category]`, `/[category]/[province]`, `/[category]/[province]/[district]` | `src/app/[category]/[[...area]]/page.tsx` | M/D-Category, M-Category-Empty, M/D-Trainer    |
| `/farm`, `/farm/[breed]`                                                     | `src/app/farm/`                           | M/D-Farm-Breeds, M-Farm-Empty, M/D-Farm-List   |
| `/place/[slug]`                                                              | `src/app/place/[slug]/page.tsx`           | M/D-Place                                      |
| `/criteria`                                                                  | `src/app/criteria/page.tsx`               | M/D-Criteria                                   |
| `/submit`                                                                    | `src/app/submit/`                         | M-Submit-Login, M/D-Submit-Form, M-Submit-Done |

- ตัวกรองบนหน้ารายการเก็บไว้ใน URL: `?type=cafe&f=large-dog,parking` และ `?style=balance` สำหรับครูฝึก
- ย่านที่ผู้ใช้เลือกล่าสุดเก็บใน cookie `area` หน้าแรกเลยลิงก์ไปย่านนั้นได้ตรง ๆ
- ข้อมูลอยู่ใน `src/data/` ส่วน `src/lib/places.ts` เป็นที่เดียวที่อ่านข้อมูล เวลาย้ายไปฐานข้อมูลหรือ CMS ให้แก้แค่ไฟล์นี้
- ไอคอนสร้างจาก `design/icons` ถ้านักออกแบบแก้ไอคอน ให้รัน `npm run icons`

## สถานะ / สิ่งที่ยังรอ

- **โลโก้: กำลังออกแบบ** ตอนนี้ใช้แนว A เป็นตัวชั่วคราว พอได้โลโก้จริงให้วางทับ `public/logo.svg` และ `src/app/icon.svg` (favicon) ทั้งเว็บจะเปลี่ยนตาม
- ข้อมูลทั้งหมดใน `src/data/` เป็น**ตัวอย่าง** (ชื่อร้าน ย่าน สายพันธุ์)
- ประเภท/ตัวกรองของหมวดอื่นนอกจากคาเฟ่และครูฝึก ร่างไว้จากคำอธิบายบนหน้าแรก ต้องเทียบกับ build-spec
- เกณฑ์รับฟาร์มยังไม่สรุป (build-spec 4.2)
- ฟอร์มเสนอสถานที่ยังไม่ได้ต่อที่เก็บข้อมูล (`src/lib/submissions.ts`) ตอน dev ข้อมูลจะพิมพ์ออกมาใน log ส่วน production จะแสดงว่าส่งไม่สำเร็จ ข้อมูลจะได้ไม่หายเงียบ ๆ
- LINE Login ต้องใส่ `LINE_CHANNEL_ID` / `LINE_CHANNEL_SECRET` จริงก่อน
- "วันนี้ชวนไป" บนหน้าแรกเปลี่ยนหมวดทุกวัน ถ้ามีสปอนเซอร์ใน `src/data/sponsors.ts` ช่องนี้จะเป็นของสปอนเซอร์และติดป้าย สปอนเซอร์
