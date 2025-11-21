# Import Enhancement Summary

## Overview
แก้ไขระบบ Import ให้รองรับการนำเข้าข้อมูลครบถ้วนทั้ง 3 ตาราง: `companies`, `company_registrations`, และ `company_contacts`

## ฟีเจอร์ที่เพิ่มเติม

### 1. รองรับ Header Fields ทั้งหมด

#### Company Table Fields
- `company_nameEn` - ชื่อบริษัทภาษาอังกฤษ (required)
- `company_nameTh` - ชื่อบริษัทภาษาไทย
- `duns_number` - DUNS number
- `address_line_1` - ที่อยู่บรรทัด 1
- `address_line_2` - ที่อยู่บรรทัด 2
- `postal_code` - รหัสไปรษณีย์
- `business_description` - คำอธิบายธุรกิจ
- `established_date` - วันที่ก่อตั้ง
- `employee_count_estimate` - จำนวนพนักงานโดยประมาณ
- `website_url` - เว็บไซต์
- `linkedin_url` - LinkedIn URL
- `facebook_url` - Facebook URL
- `company_email` - อีเมลบริษัท
- `company_phone` - เบอร์โทรบริษัท
- `industry` - อุตสาหกรรม (รองรับทั้ง display name และ ID)
- `region` - ภูมิภาค (รองรับทั้ง display name และ ID)

#### Company Registration Table Fields
- `registration_no` - เลขทะเบียนบริษัท
- `registration_type` - ประเภทการจดทะเบียน (key)
- `authority` - หน่วยงานที่ออกทะเบียน (code)
- `country` - รหัสประเทศ
- `registered_date` - วันที่จดทะเบียน

#### Company Contact Table Fields
- `first_name` - ชื่อ
- `last_name` - นามสกุล
- `title` - ตำแหน่ง
- `department` - แผนก
- `contact_email` - อีเมลติดต่อ
- `contact_phone` - เบอร์โทรติดต่อ

## การทำงาน

### 2. สร้าง Company Registration
- ตรวจสอบว่ามีข้อมูล `registration_no` และ `registration_type` ก่อน
- ถ้าไม่มีข้อมูลที่จำเป็น จะไม่สร้าง registration record
- แปลง `authority` (code) เป็น ID โดยการดึงข้อมูลจาก API
- แปลง `registration_type` (key) เป็น ID โดยการดึงข้อมูลจาก API
- สร้าง registration พร้อมกับตั้ง `isPrimary: true`

### 3. สร้าง Company Contact
- ตรวจสอบว่ามีข้อมูลอย่างน้อย 1 ใน 3 ฟิลด์: `first_name`, `contact_email`, หรือ `contact_phone`
- ถ้าไม่มีข้อมูลที่จำเป็น จะไม่สร้าง contact record
- สร้าง contact พร้อมข้อมูลที่มีอยู่

### 4. ระบบ Lookup และ Validation
ระบบจะดึงข้อมูล reference data มาก่อนการ import:
- Industries - สำหรับแปลงชื่ออุตสาหกรรมเป็น ID
- Regions - สำหรับแปลงชื่อภูมิภาคเป็น ID
- Registration Authorities - สำหรับแปลง code เป็น ID
- Registration Types - สำหรับแปลง key เป็น ID

## ไฟล์ที่แก้ไข

### 1. Frontend Changes

#### `apps/web/app/lookup/page.tsx`
- เพิ่ม header mapping สำหรับ fields ทั้งหมด
- แก้ไข `mapRowObjectToCompany()` ให้แยกข้อมูลเป็น 3 กลุ่ม: `company`, `registration`, `contact`
- แก้ไข `handleUpload()` ให้:
  - Fetch reference data ทั้งหมด (industries, regions, authorities, registration types)
  - สร้าง lookup maps สำหรับแปลง display names/codes เป็น IDs
  - สร้าง companies ก่อน
  - จากนั้นสร้าง registrations และ contacts สำหรับแต่ละบริษัทที่สร้างสำเร็จ
  - จัดการ error handling สำหรับแต่ละขั้นตอน
  - แสดง summary message พร้อมข้อมูล unresolved industries/regions

### 2. Backend Changes

#### `apps/api/src/dtos/enhanced-company.dto.ts`
เพิ่ม fields ใหม่ใน `CreateCompanyDto` และ `UpdateCompanyDto`:
- `dunsNumber` - DUNS number (string, max 50 chars)
- `linkedinUrl` - LinkedIn URL (URL validation)
- `facebookUrl` - Facebook URL (URL validation)
- `establishedDate` - วันที่ก่อตั้ง (DateString validation)

## ตัวอย่างการใช้งาน

### Excel/CSV Template Headers
```
company_nameEn, company_nameTh, duns_number, address_line_1, address_line_2, postal_code, business_description, established_date, employee_count_estimate, website_url, linkedin_url, facebook_url, company_email, company_phone, industry, region, registration_no, registration_type, authority, country, registered_date, first_name, last_name, title, department, contact_email, contact_phone
```

### ตัวอย่างข้อมูล
```csv
"Albaly Digital Co., Ltd.","บริษัท อัลบาลี ดิจิทัล จำกัด","","123 Sukhumvit Rd","Floor 15","10110","Digital transformation company","2020-01-15","50","https://albaly.com","https://linkedin.com/company/albaly","https://facebook.com/albaly","info@albaly.com","+66-2-123-4567","Information Technology","Bangkok","0105562174634","LIMITED","DBD","TH","2020-01-15","John","Doe","CEO","Management","john.doe@albaly.com","+66-81-234-5678"
```

## Validation Rules

### Company (Required)
- `company_nameEn` ต้องมี และยาวอย่างน้อย 2 ตัวอักษร

### Company Registration (Optional, แต่ถ้าจะสร้างต้องมี)
- ต้องมี `registration_no` และ `registration_type`
- `authority` ต้องเป็น code ที่มีอยู่ในระบบ
- `registration_type` ต้องเป็น key ที่มีอยู่ในระบบ

### Company Contact (Optional, แต่ถ้าจะสร้างต้องมี)
- ต้องมีอย่างน้อย 1 ใน 3: `first_name`, `contact_email`, หรือ `contact_phone`

## API Endpoints Used

1. `POST /api/v1/companies/bulk` - สร้าง companies แบบ batch
2. `POST /api/v1/company-registrations` - สร้าง company registration
3. `POST /api/v1/company-contacts` - สร้าง company contact
4. `GET /api/v1/reference-data/industries` - ดึงข้อมูลอุตสาหกรรม
5. `GET /api/v1/reference-data/regions/hierarchical` - ดึงข้อมูลภูมิภาค
6. `GET /api/v1/reference-data/registration-authorities` - ดึงข้อมูล authorities
7. `GET /api/v1/reference-data/registration-types` - ดึงข้อมูล registration types

## Error Handling

- ถ้า company สร้างไม่สำเร็จ จะไม่พยายามสร้าง registration และ contact
- ถ้า registration หรือ contact สร้างไม่สำเร็จ จะ log error แต่ไม่ fail ทั้งหมด
- แสดง alert message ที่ระบุจำนวนบริษัทที่สร้างสำเร็จ
- แสดงรายการ industries/regions ที่ไม่สามารถแปลงเป็น ID ได้

## Testing

### Test Case 1: Complete Data
- Import file ที่มีข้อมูลครบทุก field
- ควรสร้าง company, registration, และ contact สำเร็จ

### Test Case 2: Company Only
- Import file ที่มีเฉพาะข้อมูล company
- ควรสร้างเฉพาะ company สำเร็จ

### Test Case 3: Company + Registration
- Import file ที่มีข้อมูล company และ registration
- ควรสร้าง company และ registration สำเร็จ

### Test Case 4: Company + Contact
- Import file ที่มีข้อมูล company และ contact
- ควรสร้าง company และ contact สำเร็จ

### Test Case 5: Invalid Registration (missing required fields)
- Import file ที่มี registration data แต่ไม่ครบ (ไม่มี registration_no หรือ registration_type)
- ควรสร้างเฉพาะ company สำเร็จ ไม่สร้าง registration

### Test Case 6: Invalid Contact (missing required fields)
- Import file ที่มี contact data แต่ไม่มี first_name, email, phone เลย
- ควรสร้างเฉพาะ company สำเร็จ ไม่สร้าง contact

## Notes

1. **Performance**: การ import จะทำเป็น batch โดยสร้าง companies ก่อนทั้งหมด จากนั้นจึงสร้าง registrations และ contacts แบบ parallel
2. **Data Integrity**: ถ้า company สร้างไม่สำเร็จ จะไม่พยายามสร้าง related records
3. **Flexibility**: Header names รองรับหลายรูปแบบ (เช่น company_nameEn, companynameen, companyName, name)
4. **User Feedback**: แสดง progress และ result ที่ชัดเจนให้ user ทราบว่าข้อมูลไหนสร้างสำเร็จหรือไม่

## Future Enhancements

1. เพิ่ม progress bar สำหรับการ import ข้อมูลจำนวนมาก
2. เพิ่ม validation preview ก่อน import จริง
3. เพิ่ม rollback mechanism ถ้า import ล้มเหลว
4. สนับสนุนการ update ข้อมูลเดิม (ไม่ใช่แค่ create)
5. Export template file พร้อม example data
