# SawasdeeDog

เว็บรวมสถานที่ที่ต้อนรับหมา ทีมครูฝึกสาย R+ เก็บและคัดเองทุกรายการ

- ไฟล์งานออกแบบอยู่ใน [`design/`](design/DESIGN-HANDOFF.md) (tokens, ไอคอน, ม็อกอัปทุกหน้า)
- ตัวเว็บใช้ Next.js 16 (App Router) + TypeScript และ CSS ล้วน (`src/app/globals.css`)
- โทนสีเปลี่ยนตามโลโก้แล้ว (น้ำเงินเข้ม / ฟ้า / เหลือง) ค่าสีอยู่ที่ `:root` ใน `src/app/globals.css` ส่วน `design/tokens.*` เป็นของชุดเดิมจากนักออกแบบ

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
- ร้าน/สถานที่อยู่ในตาราง `places` ของ Supabase อ่านผ่าน `src/lib/places.ts` ที่เดียว ส่วนหมวด ย่าน สายพันธุ์ และสปอนเซอร์เป็น config ใน `src/data/`
- ไอคอนสร้างจาก `design/icons` ถ้านักออกแบบแก้ไอคอน ให้รัน `npm run icons`

## ระบบเพิ่มข้อมูล

- **คนทั่วไป**: เข้าสู่ระบบด้วย LINE ที่ `/submit` แล้วเสนอสถานที่ใหม่หรือแจ้งข้อมูลผิด แนบรูปได้ ข้อมูลเข้าตาราง `submissions` สถานะ "รอตรวจ"
- **ทีมแอดมิน** (LINE ที่อยู่ใน `ADMIN_LINE_USER_IDS`): ใช้ `/admin`
  - ตรวจข้อมูลที่ส่งมา: กด "สร้างรายการจากข้อมูลนี้" (ข้อมูลกรอกไว้ให้แล้ว) หรือกด "ไม่ผ่านเกณฑ์"
  - แจ้งข้อมูลผิด: แก้ที่รายการนั้นแล้วกด "แก้ข้อมูลแล้ว"
  - รายการบนเว็บ: เพิ่ม แก้ ซ่อน หรือลบ พร้อมอัปโหลดรูป (รูปแรกเป็นรูปปก)
- บันทึกแล้วหน้าเว็บอัปเดตทันที
- **ให้คะแนน**: คนที่ login ด้วย LINE แล้ว ให้ดาว 1–5 ได้ที่หน้ารายละเอียดของแต่ละที่ 1 บัญชีให้ได้ 1 คะแนนต่อ 1 ที่ (กดใหม่ = เปลี่ยนคะแนนเดิม ไม่นับเพิ่ม) คะแนนเฉลี่ยขึ้นเมื่อมีคนให้ครบ 3 คน (`MIN_RATINGS_TO_SHOW` ใน `src/lib/limits.ts`)
- รูปจะถูกย่อในเบราว์เซอร์ (ด้านยาวไม่เกิน 1600px) แล้วอัปโหลดตรงไป Supabase Storage ไม่ผ่านเซิร์ฟเวอร์ เพราะ Vercel รับ request ได้ไม่เกิน 4.5MB

## ตั้งค่าครั้งแรก

### 1. Supabase

1. สร้างโปรเจกต์ที่ https://supabase.com (เลือก region Singapore)
2. เปิด **SQL Editor** แล้วรันไฟล์ใน `supabase/migrations/` ตามลำดับเลข (`0001_init.sql` แล้วตามด้วย `0002_ratings.sql`) ไฟล์นี้สร้างตาราง places, submissions และที่เก็บรูป 2 bucket
3. ไปที่ **Project Settings → API** แล้วคัดลอกค่ามาใส่ env:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (เป็นความลับ ห้ามเปิดเผย)
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

ตารางเปิด RLS ไว้และไม่มี policy คีย์ anon ที่อยู่ในเบราว์เซอร์จึงอ่านหรือเขียนตารางไม่ได้ เว็บอ่านข้อมูลผ่านเซิร์ฟเวอร์ด้วย service_role อย่างเดียว

### 2. LINE Login (Channel ID 2011815341)

ใน [LINE Developers Console](https://developers.line.biz/console/) → channel นี้ → แท็บ **LINE Login**:

1. **Callback URL** ใส่ `https://<โดเมน>/auth/line/callback` (ถ้าจะทดสอบในเครื่องให้ใส่ `http://localhost:3000/auth/line/callback` ด้วย)
2. แท็บ **Basic settings** → คัดลอก **Channel secret** ไปใส่ `LINE_CHANNEL_SECRET` (ใส่ใน Vercel เท่านั้น อย่าส่งในแชตหรือ commit)
3. เปลี่ยนสถานะ channel จาก **Developing** เป็น **Published** ถ้ายังเป็น Developing จะมีแค่บัญชีที่ลงไว้เป็น tester ที่ login ได้

### 3. Vercel

1. Import repo นี้ที่ https://vercel.com/new (ตรวจเจอ Next.js เองอัตโนมัติ)
   - `vercel.json` ตั้งให้ฝั่งเซิร์ฟเวอร์รันที่สิงคโปร์ (`sin1`) ให้อยู่ใกล้ Supabase ถ้าย้าย region ของ Supabase ต้องแก้ค่านี้ตาม
2. **Settings → Environment Variables** ใส่ทุกตัวตาม `.env.example`
   - `SESSION_SECRET` สร้างด้วยคำสั่ง `openssl rand -base64 32`
   - `SITE_URL` คือโดเมนจริง
3. Deploy แล้วเข้า `/admin` ด้วย LINE หน้าจะแสดง LINE user ID ของเรา (ขึ้นต้นด้วย U...) ให้เอาไปใส่ `ADMIN_LINE_USER_IDS` แล้วกด Redeploy

## สถานะ / สิ่งที่ยังรอ

- **โลโก้**: โลโก้ final อยู่ที่ `design/logo/sawasdeedog-logo-final.png` รูปน้องหมาในวงกลมตัดมาใช้ที่ header และ favicon (`public/logo.png`, `src/app/icon.png`, `src/app/apple-icon.png`) ส่วนโลโก้เต็ม (`public/logo-full.jpg`) ใช้ที่หน้าเข้าสู่ระบบ
- ถ้ายังไม่ได้ตั้งค่า Supabase เว็บจะแสดงร้านตัวอย่างจาก `src/data/places.ts` ส่วนรายชื่อย่านและสายพันธุ์ใน `src/data/` ก็ยังเป็นตัวอย่าง ต้องเติมให้ครบ
- ประเภท/ตัวกรองของหมวดอื่นนอกจากคาเฟ่และครูฝึก ร่างไว้จากคำอธิบายบนหน้าแรก ต้องเทียบกับ build-spec
- เกณฑ์รับฟาร์มยังไม่สรุป (build-spec 4.2)
- "วันนี้ชวนไป" บนหน้าแรกเปลี่ยนหมวดทุกวัน ถ้ามีสปอนเซอร์ใน `src/data/sponsors.ts` ช่องนี้จะเป็นของสปอนเซอร์และติดป้าย สปอนเซอร์
