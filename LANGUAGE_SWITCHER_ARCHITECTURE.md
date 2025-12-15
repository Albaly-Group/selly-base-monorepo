# Language Switcher Architecture & Implementation Guide

## 📋 สารบัญ (Table of Contents)

1. [ภาพรวม (Overview)](#ภาพรวม-overview)
2. [สถาปัตยกรรมระบบ (Architecture)](#สถาปัตยกรรมระบบ-architecture)
3. [เทคโนโลยีและ Libraries ที่ใช้](#เทคโนโลยีและ-libraries-ที่ใช้)
4. [โครงสร้างโฟลเดอร์และไฟล์](#โครงสร้างโฟลเดอร์และไฟล์)
5. [การทำงานของแต่ละส่วน](#การทำงานของแต่ละส่วน)
6. [วิธีการใช้งาน](#วิธีการใช้งาน)
7. [การนำไปใช้กับโปรเจคอื่น](#การนำไปใช้กับโปรเจคอื่น)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🌍 ภาพรวม (Overview)

### ระบบ Internationalization (i18n) คืออะไร?

ระบบ i18n (Internationalization) เป็นกระบวนการออกแบบและพัฒนาแอปพลิเคชันให้รองรับหลายภาษาโดยไม่ต้องเปลี่ยนแปลงโค้ดหลัก ทำให้สามารถเปลี่ยนภาษาได้ง่ายตามความต้องการของผู้ใช้

### ภาษาที่รองรับในระบบ Albaly OS

- **English (en)** - ภาษาเริ่มต้น (Default)
- **Thai (th)** - ภาษาไทยพร้อมการแปลงปี พ.ศ. อัตโนมัติ

### คุณสมบัติหลัก

- ✅ รองรับ Server-Side Rendering (SSR) และ Client-Side Rendering (CSR)
- ✅ การสลับภาษาแบบเรียลไม์โดยไม่ต้อง Reload หน้า
- ✅ URL Routing แบบ Locale-aware (`/en/dashboard`, `/th/dashboard`)
- ✅ การแปลงวันที่และตัวเลขตามภาษา
- ✅ Buddhist Era (พ.ศ.) สำหรับภาษาไทย
- ✅ SEO-friendly URLs
- ✅ Type-safe translations with TypeScript

---

## 🏗️ สถาปัตยกรรมระบบ (Architecture)

### แผนภาพสถาปัตยกรรม

```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  URL: /th/companies                               │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js Middleware Layer                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │  middleware.ts                                    │  │
│  │  - Detect locale from URL or Accept-Language      │  │
│  │  - Redirect to appropriate locale path            │  │
│  │  - Set locale cookie                              │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│            Next.js App Router [locale]                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  app/[locale]/layout.tsx                          │  │
│  │  - Load translation messages                      │  │
│  │  - Setup NextIntlClientProvider                   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  app/[locale]/(dashboard)/companies/page.tsx      │  │
│  │  - Use translations via useTranslations()         │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│            Translation Messages                         │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │  messages/en.json    │  │  messages/th.json    │    │
│  │  {                   │  │  {                   │    │
│  │   "navigation": {    │  │   "navigation": {    │    │
│  │     "companies":     │  │     "companies":     │    │
│  │       "Companies"    │  │       "บริษัท"       │    │
│  │   }                  │  │   }                  │    │
│  │  }                   │  │  }                   │    │
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### กระบวนการทำงาน (Flow)

1. **User Request** → ผู้ใช้เข้าถึง URL (เช่น `/th/companies`)
2. **Middleware Detection** → Middleware ตรวจสอบ locale จาก URL
3. **Locale Validation** → ตรวจสอบว่า locale ที่ระบุมีอยู่ในระบบหรือไม่
4. **Layout Rendering** → โหลดไฟล์ translation ตาม locale
5. **Component Translation** → Components ใช้ `useTranslations()` เพื่อแสดงข้อความ
6. **Language Switch** → เมื่อผู้ใช้สลับภาษา → เปลี่ยน URL และ Re-render

---

## 📦 เทคโนโลยีและ Libraries ที่ใช้

### 1. **next-intl** (Primary i18n Library)

```bash
npm install next-intl
# หรือ
pnpm add next-intl
# หรือ
yarn add next-intl
```

**เหตุผลที่เลือกใช้:**
- ✅ รองรับ Next.js 15 App Router อย่างเต็มรูปแบบ
- ✅ Server Components Support
- ✅ Type-safe translations
- ✅ Automatic route localization
- ✅ Built-in date, time, and number formatting
- ✅ SEO optimization

**เวอร์ชันที่ใช้:** `^4.5.5`

**เอกสารอ้างอิง:** https://next-intl-docs.vercel.app/

### 2. **date-fns** (Date Formatting)

```bash
npm install date-fns
```

**เหตุผลที่เลือกใช้:**
- ✅ รองรับหลายภาษาผ่าน locale modules
- ✅ Tree-shakable (ขนาดเล็ก)
- ✅ Immutable & Pure functions
- ✅ TypeScript support
- ✅ Buddhist Era conversion สำหรับภาษาไทย

**เวอร์ชันที่ใช้:** `4.1.0`

### 3. **Next.js 15** (Framework)

- App Router architecture
- Dynamic routing with `[locale]` segment
- Middleware support
- Server Components

---

## 📁 โครงสร้างโฟลเดอร์และไฟล์

### โครงสร้างหลัก

```
apps/web/
├── app/
│   ├── layout.tsx                           # Root layout (pass-through)
│   └── [locale]/                            # Dynamic locale routing
│       ├── layout.tsx                       # Main locale layout
│       ├── page.tsx                         # Home page
│       ├── not-found.tsx                    # 404 page with i18n
│       ├── (auth)/                          # Auth route group
│       │   └── login/
│       │       └── page.tsx
│       └── (dashboard)/                     # Dashboard route group
│           ├── layout.tsx                   # Dashboard layout
│           ├── companies/
│           │   ├── page.tsx
│           │   ├── [id]/
│           │   │   └── page.tsx
│           │   └── new/
│           │       └── page.tsx
│           ├── projects/
│           └── ...
│
├── src/
│   ├── i18n.ts                              # i18n configuration
│   ├── messages/                            # Translation files
│   │   ├── en.json                          # English translations (2097 keys)
│   │   └── th.json                          # Thai translations (2093 keys)
│   ├── components/
│   │   ├── language-switcher.tsx            # Language switcher UI
│   │   └── locale-link.tsx                  # Locale-aware Link component
│   ├── lib/
│   │   ├── date-utils.ts                    # Date formatting utilities
│   │   └── utils.ts
│   └── hooks/
│       └── use-date-formatter.ts            # Date formatting hook
│
├── middleware.ts                            # Next.js middleware for locale routing
├── next.config.mjs                          # Next.js config with next-intl plugin
└── package.json
```

### ไฟล์สำคัญและหน้าที่

| ไฟล์ | หน้าที่ | ความสำคัญ |
|------|---------|-----------|
| `middleware.ts` | ตรวจจับและจัดการ locale จาก URL | ⭐⭐⭐⭐⭐ |
| `src/i18n.ts` | กำหนดค่า locales และโหลด translation files | ⭐⭐⭐⭐⭐ |
| `app/[locale]/layout.tsx` | Setup NextIntlClientProvider | ⭐⭐⭐⭐⭐ |
| `src/messages/*.json` | ไฟล์แปลภาษา | ⭐⭐⭐⭐⭐ |
| `src/components/language-switcher.tsx` | UI สำหรับสลับภาษา | ⭐⭐⭐⭐ |
| `next.config.mjs` | Next.js config + next-intl plugin | ⭐⭐⭐⭐ |
| `src/lib/date-utils.ts` | Utilities สำหรับ format วันที่ | ⭐⭐⭐ |

---

## ⚙️ การทำงานของแต่ละส่วน

### 1. Middleware Configuration (`middleware.ts`)

**วัตถุประสงค์:** ตรวจจับและจัดการ locale routing ก่อนที่ request จะไปถึง page

```typescript
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './src/i18n';

export default createMiddleware({
  // รายการภาษาที่รองรับ
  locales,

  // ภาษาเริ่มต้นเมื่อไม่มี locale ใน URL
  defaultLocale,

  // แสดง locale prefix ใน URL เสมอ (แนะนำ)
  localePrefix: 'always',
  
  // เปิดใช้งานการตรวจจับภาษาจาก Accept-Language header
  localeDetection: true
});

export const config = {
  // กำหนด path ที่ middleware จะทำงาน
  matcher: [
    // ยกเว้น: api routes, _next static files, favicon, health check
    '/((?!api|_next|favicon.ico|health).*)',
  ]
};
```

**กลไกการทำงาน:**

1. **Locale Detection:**
   - ตรวจสอบ locale จาก URL path (`/th/companies` → locale = `th`)
   - ถ้าไม่มี locale ใน URL → ตรวจสอบจาก cookie `NEXT_LOCALE`
   - ถ้าไม่มี cookie → ตรวจสอบจาก `Accept-Language` header
   - ถ้าไม่พบ → ใช้ `defaultLocale`

2. **URL Rewriting:**
   - เพิ่ม locale prefix ถ้าไม่มี: `/companies` → `/en/companies`
   - Redirect ถ้า locale ไม่ถูกต้อง

3. **Cookie Management:**
   - บันทึก locale ที่เลือกใน cookie `NEXT_LOCALE`
   - ใช้ cookie นี้ในการ request ครั้งถัดไป

**ตัวเลือก localePrefix:**

| ค่า | ความหมาย | ตัวอย่าง URL |
|-----|----------|--------------|
| `'always'` | แสดง locale เสมอ | `/en/companies`, `/th/companies` |
| `'as-needed'` | แสดงเฉพาะภาษาที่ไม่ใช่ default | `/companies` (en), `/th/companies` |
| `'never'` | ไม่แสดง locale ใน URL | `/companies` (ใช้ cookie/header) |

**คำแนะนำ:** ใช้ `'always'` เพื่อความชัดเจนและ SEO-friendly

---

### 2. i18n Configuration (`src/i18n.ts`)

**วัตถุประสงค์:** กำหนดค่า locales และจัดการการโหลด translation messages

```typescript
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

// กำหนดภาษาที่รองรับ (as const เพื่อ type safety)
export const locales = ['en', 'th'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number]; // Type: 'en' | 'th'

export default getRequestConfig(async ({locale}) => {
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    // Fallback to default locale
    return {
      locale: defaultLocale,
      messages: (await import(`./messages/${defaultLocale}.json`)).default
    };
  }

  // โหลด translation messages แบบ dynamic import
  return {
    locale: locale as Locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

**คุณสมบัติ:**

1. **Type Safety:**
   ```typescript
   export type Locale = 'en' | 'th'; // Auto-generated จาก locales array
   ```

2. **Dynamic Import:**
   - โหลด translation file เฉพาะที่จำเป็น (Code splitting)
   - ลดขนาด bundle

3. **Validation:**
   - ตรวจสอบ locale ที่ไม่ถูกต้อง
   - Fallback ไปยัง default locale

---

### 3. Locale Layout (`app/[locale]/layout.tsx`)

**วัตถุประสงค์:** Setup NextIntlClientProvider และโหลด messages สำหรับทุก page

```typescript
import type React from "react"
import type {Metadata} from "next"
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '@/src/i18n';

export const metadata: Metadata = {
    title: "Albaly OS",
    description: "Internal platform for Albaly Group",
}

// Generate static params สำหรับทุก locale
export function generateStaticParams() {
    return locales.map((locale) => ({locale}));
}

// Type guard function
function isValidLocale(locale: string): locale is typeof locales[number] {
    return locales.includes(locale as typeof locales[number]);
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{locale: string}>;
}) {
    const {locale} = await params;

    // Validate locale
    if (!isValidLocale(locale)) {
        notFound(); // แสดง 404 page ถ้า locale ไม่ถูกต้อง
    }

    // Enable static rendering สำหรับ locale
    setRequestLocale(locale);

    // โหลด translation messages
    const messages = await getMessages({locale});

    return (
        <div lang={locale}>
            <NextIntlClientProvider locale={locale} messages={messages}>
                {children}
            </NextIntlClientProvider>
        </div>
    )
}
```

**กลไกสำคัญ:**

1. **generateStaticParams():**
   - Generate static paths สำหรับทุก locale
   - ช่วยให้ Next.js pre-render pages สำหรับทุกภาษา

2. **setRequestLocale():**
   - กำหนด locale สำหรับ request นี้
   - จำเป็นสำหรับ static rendering

3. **NextIntlClientProvider:**
   - ทำให้ child components เข้าถึง translations ได้
   - ส่ง messages และ locale ไปยัง client

4. **lang attribute:**
   - ตั้ง HTML lang attribute ตาม locale
   - ดีสำหรับ SEO และ accessibility

---

### 4. Translation Messages (`src/messages/en.json`, `th.json`)

**โครงสร้างไฟล์ JSON:**

```json
{
  "app": {
    "title": "Albaly OS",
    "description": "Internal platform for Albaly Group"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "companies": "Companies",
    "projects": "Projects",
    "settings": "Settings"
  },
  "companies": {
    "title": "Companies",
    "addNew": "Add Company",
    "editCompany": "Edit Company",
    "deleteConfirm": "Are you sure you want to delete this company?",
    "fields": {
      "name": "Company Name",
      "taxId": "Tax ID",
      "address": "Address",
      "phone": "Phone Number"
    }
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "noData": "No data available"
  }
}
```

**หลักการจัดโครงสร้าง:**

1. **Nested Structure:**
   - แบ่งตาม feature/module (navigation, companies, projects, etc.)
   - ใช้ dot notation เพื่อเข้าถึง: `companies.fields.name`

2. **Naming Convention:**
   - ใช้ camelCase สำหรับ keys
   - ชื่อต้องสื่อความหมาย (descriptive)
   - Group related translations

3. **Consistency:**
   - Key ต้องเหมือนกันทุกภาษา
   - จำนวน key ต้องเท่ากัน (en: 2097, th: 2093 - แทบจะเท่ากัน)

**ตัวอย่างการแปลภาษาไทย (`th.json`):**

```json
{
  "navigation": {
    "dashboard": "แดชบอร์ด",
    "companies": "บริษัท",
    "projects": "โครงการ",
    "settings": "การตั้งค่า"
  },
  "companies": {
    "title": "บริษัท",
    "addNew": "เพิ่มบริษัท",
    "editCompany": "แก้ไขบริษัท",
    "deleteConfirm": "คุณแน่ใจหรือไม่ว่าต้องการลบบริษัทนี้?",
    "fields": {
      "name": "ชื่อบริษัท",
      "taxId": "เลขประจำตัวผู้เสียภาษี",
      "address": "ที่อยู่",
      "phone": "เบอร์โทรศัพท์"
    }
  }
}
```

---

### 5. Language Switcher Component (`src/components/language-switcher.tsx`)

**วัตถุประสงค์:** UI Component สำหรับให้ผู้ใช้สลับภาษา

```typescript
"use client"

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Globe} from 'lucide-react';

type Locale = 'en' | 'th';

// ชื่อภาษาที่แสดงใน UI
const languages: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย'
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;        // ภาษาปัจจุบัน
  const router = useRouter();                   // Next.js router
  const pathname = usePathname();               // URL path ปัจจุบัน

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;  // ถ้าเป็นภาษาเดียวกันไม่ต้องทำอะไร

    // แยก path segments
    const segments = pathname.split('/').filter(Boolean);
    
    // ตรวจสอบว่า segment แรกเป็น locale หรือไม่
    const firstSegmentIsLocale = segments.length > 0 && 
                                  ['en', 'th'].includes(segments[0]);
    
    // ดึง path โดยไม่มี locale prefix
    const pathWithoutLocale = firstSegmentIsLocale 
      ? '/' + segments.slice(1).join('/')
      : pathname;
    
    // สร้าง path ใหม่พร้อม locale ที่เลือก
    const newPath = `/${newLocale}${pathWithoutLocale || '/'}`;
    
    // Navigate ไปยัง URL ใหม่
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span>{languages[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(languages) as Locale[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => switchLocale(lang)}
            className={locale === lang ? 'bg-accent' : ''}
          >
            {languages[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**กลไกการทำงาน:**

1. **Get Current State:**
   - `useLocale()` → ได้ locale ปัจจุบัน (`en` หรือ `th`)
   - `usePathname()` → ได้ URL path (`/en/companies/123`)

2. **Path Parsing:**
   ```typescript
   // URL: /en/companies/123
   segments = ['en', 'companies', '123']
   firstSegmentIsLocale = true
   pathWithoutLocale = '/companies/123'
   ```

3. **Build New Path:**
   ```typescript
   // เปลี่ยนจาก en → th
   newPath = '/th/companies/123'
   ```

4. **Navigation:**
   - ใช้ `router.push()` เพื่อ navigate
   - Next.js จะ re-render page ด้วย locale ใหม่

**การใช้งานใน Layout:**

```typescript
import {LanguageSwitcher} from '@/src/components/language-switcher';

export function Header() {
  return (
    <header>
      <nav>
        {/* ... navigation items ... */}
      </nav>
      <LanguageSwitcher />  {/* วาง switcher ที่ header */}
    </header>
  );
}
```

---

### 6. Date & Time Utilities (`src/lib/date-utils.ts`)

**วัตถุประสงค์:** Format วันที่, เวลา, และตัวเลขตาม locale พร้อมรองรับ Buddhist Era

```typescript
import {format as dateFnsFormat, type FormatOptions} from 'date-fns';
import {th, enUS} from 'date-fns/locale';

// Map locales to date-fns locale objects
const localeMap = {
  en: enUS,
  th: th,
} as const;

export type SupportedLocale = keyof typeof localeMap;

/**
 * Format date ตาม locale
 * @param date - วันที่ (Date, number, หรือ string)
 * @param formatString - รูปแบบ (เช่น 'PPP', 'dd/MM/yyyy')
 * @param locale - ภาษา ('en' หรือ 'th')
 * @param useBuddhistEra - ใช้ พ.ศ. สำหรับภาษาไทย (default: false)
 */
export function formatDate(
  date: Date | number | string,
  formatString: string,
  locale: SupportedLocale = 'en',
  useBuddhistEra: boolean = false
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options: FormatOptions = {
    locale: localeMap[locale],
  };

  let formatted = dateFnsFormat(dateObj, formatString, options);

  // แปลงเป็น พ.ศ. สำหรับภาษาไทย
  if (locale === 'th' && useBuddhistEra) {
    const dateInstance = new Date(dateObj);
    const year = dateInstance.getFullYear();
    const buddhistYear = year + 543;  // ค.ศ. + 543 = พ.ศ.
    formatted = formatted.replace(
      new RegExp(`\\b${year}\\b`, 'g'), 
      buddhistYear.toString()
    );
  }

  return formatted;
}

/**
 * Format เป็น relative time (เช่น "2 hours ago", "2 ชั่วโมงที่แล้ว")
 */
export function formatRelativeTime(
  date: Date | number | string,
  locale: SupportedLocale = 'en'
): string {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(
    locale === 'th' ? 'th-TH' : 'en-US', 
    { numeric: 'auto' }
  );

  // เลือก unit ที่เหมาะสม
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (Math.abs(diffInSeconds) < minute) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (Math.abs(diffInSeconds) < hour) {
    return rtf.format(-Math.floor(diffInSeconds / minute), 'minute');
  } else if (Math.abs(diffInSeconds) < day) {
    return rtf.format(-Math.floor(diffInSeconds / hour), 'hour');
  } else if (Math.abs(diffInSeconds) < month) {
    return rtf.format(-Math.floor(diffInSeconds / day), 'day');
  } else if (Math.abs(diffInSeconds) < year) {
    return rtf.format(-Math.floor(diffInSeconds / month), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / year), 'year');
  }
}

/**
 * Format ตัวเลข
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale = 'en',
  options?: Intl.NumberFormatOptions
): string {
  const localeString = locale === 'th' ? 'th-TH' : 'en-US';
  return new Intl.NumberFormat(localeString, options).format(value);
}

/**
 * Format สกุลเงิน
 */
export function formatCurrency(
  value: number,
  locale: SupportedLocale = 'en',
  currency: string = 'THB'
): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency: currency,
  });
}
```

**ตัวอย่างการใช้งาน:**

```typescript
import {formatDate, formatRelativeTime, formatCurrency} from '@/src/lib/date-utils';

// Date formatting
formatDate(new Date(), 'PPP', 'en')  
// → "January 15, 2025"

formatDate(new Date(), 'PPP', 'th', false)  
// → "15 มกราคม 2025"

formatDate(new Date(), 'PPP', 'th', true)   
// → "15 มกราคม 2568" (พ.ศ.)

// Relative time
formatRelativeTime(new Date(Date.now() - 7200000), 'en')  
// → "2 hours ago"

formatRelativeTime(new Date(Date.now() - 7200000), 'th')  
// → "2 ชั่วโมงที่แล้ว"

// Currency
formatCurrency(1234567.89, 'th', 'THB')  
// → "฿1,234,567.89"

formatCurrency(1234567.89, 'en', 'USD')  
// → "$1,234,567.89"
```

---

### 7. Next.js Configuration (`next.config.mjs`)

**วัตถุประสงค์:** กำหนดค่า Next.js ให้รองรับ next-intl

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

// สร้าง plugin โดยระบุ path ไปยัง i18n config
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // ... other config ...
    
    async redirects() {
        return [
            {
                // Redirect legacy paths
                source: "/console",
                destination: "/en/sales-console",
                permanent: true,
            },
            {
                source: "/:locale/console",
                destination: "/:locale/sales-console",
                permanent: true,
            },
        ];
    },
}

// Wrap config ด้วย withNextIntl plugin
export default withNextIntl(nextConfig);
```

**คำอธิบาย:**

1. **createNextIntlPlugin():**
   - สร้าง webpack plugin สำหรับ next-intl
   - ระบุ path ไปยังไฟล์ `i18n.ts`

2. **withNextIntl():**
   - Wrap Next.js config
   - เพิ่ม optimizations สำหรับ i18n
   - Handle automatic code splitting สำหรับ translation files

---

## 🎯 วิธีการใช้งาน

### 1. การใช้งานใน Server Components

```typescript
import {getTranslations} from 'next-intl/server';

export default async function CompaniesPage() {
  // Get translations (Server-side)
  const t = await getTranslations('companies');
  
  return (
    <div>
      <h1>{t('title')}</h1>  {/* "Companies" หรือ "บริษัท" */}
      <button>{t('addNew')}</button>  {/* "Add Company" หรือ "เพิ่มบริษัท" */}
    </div>
  );
}
```

### 2. การใช้งานใน Client Components

```typescript
"use client"

import {useTranslations} from 'next-intl';

export function CompanyForm() {
  const t = useTranslations('companies');
  
  return (
    <form>
      <label>{t('fields.name')}</label>  {/* "Company Name" หรือ "ชื่อบริษัท" */}
      <input placeholder={t('fields.name')} />
      
      <button type="submit">{t('save')}</button>
    </form>
  );
}
```

### 3. การใช้ Variables ใน Translations

**ใน JSON:**

```json
{
  "welcome": "Welcome, {name}!",
  "itemCount": "You have {count} items"
}
```

**ใน Component:**

```typescript
const t = useTranslations('dashboard');

// Basic variable
<p>{t('welcome', {name: 'John'})}</p>
// → "Welcome, John!"

// Number formatting
<p>{t('itemCount', {count: 5})}</p>
// → "You have 5 items"
```

### 4. Rich Text และ HTML

```json
{
  "description": "Please read our <link>terms and conditions</link>"
}
```

```typescript
const t = useTranslations('legal');

<p>
  {t.rich('description', {
    link: (chunks) => <a href="/terms">{chunks}</a>
  })}
</p>
```

### 5. Pluralization

```json
{
  "items": {
    "one": "{count} item",
    "other": "{count} items"
  }
}
```

```typescript
const t = useTranslations('cart');

<p>{t('items', {count: 1})}</p>  // → "1 item"
<p>{t('items', {count: 5})}</p>  // → "5 items"
```

### 6. การใช้งาน Date Formatting

```typescript
"use client"

import {useLocale} from 'next-intl';
import {formatDate} from '@/src/lib/date-utils';

export function EventCard({date}: {date: Date}) {
  const locale = useLocale() as 'en' | 'th';
  
  return (
    <div>
      <p>{formatDate(date, 'PPP', locale, locale === 'th')}</p>
    </div>
  );
}
```

### 7. Locale-aware Navigation

```typescript
import {Link} from '@/src/components/locale-link';

export function Navigation() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/companies">Companies</Link>
      {/* Automatically adds locale prefix */}
      {/* /en/dashboard, /th/dashboard */}
    </nav>
  );
}
```

---

## 🚀 การนำไปใช้กับโปรเจคอื่น

### Step-by-Step Implementation Guide

#### **Step 1: ติดตั้ง Dependencies**

```bash
# ติดตั้ง next-intl
npm install next-intl

# ติดตั้ง date-fns (optional - สำหรับ date formatting)
npm install date-fns
```

#### **Step 2: สร้างโครงสร้างโฟลเดอร์**

```bash
mkdir -p src/messages
mkdir -p src/components
mkdir -p src/lib
mkdir -p app/[locale]
```

#### **Step 3: สร้างไฟล์ Configuration**

**3.1 สร้าง `src/i18n.ts`:**

```typescript
import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const locales = ['en', 'th'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({locale}) => {
  if (!locales.includes(locale as Locale)) {
    return {
      locale: defaultLocale,
      messages: (await import(`./messages/${defaultLocale}.json`)).default
    };
  }

  return {
    locale: locale as Locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

**3.2 สร้าง `middleware.ts` (ที่ root ของโปรเจค):**

```typescript
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './src/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true
});

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};
```

**3.3 แก้ไข `next.config.js`:**

```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... your existing config
};

export default withNextIntl(nextConfig);
```

#### **Step 4: สร้าง Translation Files**

**4.1 สร้าง `src/messages/en.json`:**

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  }
}
```

**4.2 สร้าง `src/messages/th.json`:**

```json
{
  "common": {
    "save": "บันทึก",
    "cancel": "ยกเลิก",
    "delete": "ลบ",
    "edit": "แก้ไข"
  },
  "navigation": {
    "home": "หน้าแรก",
    "about": "เกี่ยวกับเรา",
    "contact": "ติดต่อเรา"
  }
}
```

#### **Step 5: Restructure App Directory**

**5.1 ย้ายไฟล์ใน `app/` ไปยัง `app/[locale]/`:**

```
Before:
app/
├── page.tsx
├── about/
│   └── page.tsx
└── layout.tsx

After:
app/
├── layout.tsx          (root layout - pass through)
└── [locale]/
    ├── layout.tsx      (locale-specific layout)
    ├── page.tsx
    └── about/
        └── page.tsx
```

**5.2 สร้าง `app/layout.tsx` (Root Layout):**

```typescript
export default function RootLayout({children}: {children: React.ReactNode}) {
  return children;
}
```

**5.3 สร้าง `app/[locale]/layout.tsx`:**

```typescript
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '@/src/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({locale});

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

#### **Step 6: สร้าง Language Switcher**

**สร้าง `src/components/language-switcher.tsx`:**

```typescript
"use client"

import {useLocale} from 'next-intl';
import {useRouter, usePathname} from 'next/navigation';

const languages = {
  en: 'English',
  th: 'ไทย'
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegmentIsLocale = ['en', 'th'].includes(segments[0]);
    const pathWithoutLocale = firstSegmentIsLocale 
      ? '/' + segments.slice(1).join('/')
      : pathname;
    const newPath = `/${newLocale}${pathWithoutLocale || '/'}`;
    router.push(newPath);
  };

  return (
    <select value={locale} onChange={(e) => switchLocale(e.target.value)}>
      {Object.entries(languages).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  );
}
```

#### **Step 7: ใช้งานใน Components**

**Server Component:**

```typescript
import {getTranslations} from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('navigation');
  
  return <h1>{t('home')}</h1>;
}
```

**Client Component:**

```typescript
"use client"

import {useTranslations} from 'next-intl';

export function MyButton() {
  const t = useTranslations('common');
  
  return <button>{t('save')}</button>;
}
```

#### **Step 8: Test**

```bash
npm run dev

# ทดสอบ URLs:
# http://localhost:3000/en
# http://localhost:3000/th
# http://localhost:3000/en/about
# http://localhost:3000/th/about
```

---

### 📋 Checklist สำหรับ Implementation

- [ ] ติดตั้ง `next-intl` และ dependencies
- [ ] สร้างไฟล์ `src/i18n.ts`
- [ ] สร้างไฟล์ `middleware.ts`
- [ ] แก้ไข `next.config.js` ด้วย `withNextIntl`
- [ ] สร้าง translation files (`en.json`, `th.json`)
- [ ] Restructure `app/` directory เป็น `app/[locale]/`
- [ ] สร้าง root layout (`app/layout.tsx`)
- [ ] สร้าง locale layout (`app/[locale]/layout.tsx`)
- [ ] สร้าง Language Switcher component
- [ ] แก้ไข existing components ให้ใช้ `useTranslations()`
- [ ] แก้ไข existing links ให้ใช้ locale-aware routing
- [ ] ทดสอบการสลับภาษา
- [ ] ทดสอบ SEO (inspect HTML lang attribute)
- [ ] ทดสอบ URL routing ทุก locale

---

## 💡 Best Practices

### 1. Translation Keys Organization

**❌ ไม่ควร:**
```json
{
  "button1": "Save",
  "button2": "Cancel",
  "text1": "Welcome"
}
```

**✅ ควร:**
```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel"
    }
  },
  "auth": {
    "welcome": "Welcome"
  }
}
```

### 2. Type Safety

**สร้าง types สำหรับ translations:**

```typescript
// src/types/i18n.ts
import en from '@/src/messages/en.json';

type Messages = typeof en;

declare global {
  interface IntlMessages extends Messages {}
}
```

**ใช้งาน:**

```typescript
const t = useTranslations('common');
t('actions.save');  // ✅ Type-safe, autocomplete available
t('invalid.key');   // ❌ TypeScript error
```

### 3. Avoid Hardcoded Strings

**❌ ไม่ควร:**
```typescript
<button>Save</button>
<h1>Welcome to our app</h1>
```

**✅ ควร:**
```typescript
const t = useTranslations('common');
<button>{t('actions.save')}</button>
<h1>{t('welcome')}</h1>
```

### 4. Use Namespaces

```typescript
// แยก namespace ตาม feature
const tCommon = useTranslations('common');
const tAuth = useTranslations('auth');
const tCompanies = useTranslations('companies');

<button>{tCommon('save')}</button>
<h1>{tAuth('login')}</h1>
<p>{tCompanies('title')}</p>
```

### 5. Handle Missing Translations

```typescript
// src/i18n.ts
export default getRequestConfig(async ({locale}) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    // Fallback to key ถ้าไม่มี translation
    getMessageFallback({namespace, key, error}) {
      return `${namespace}.${key}`;
    }
  };
});
```

### 6. Date Formatting Best Practices

```typescript
// ใช้ preset formats แทนการกำหนดเอง
formatDate(date, 'PPP', locale)     // ✅ "January 15, 2025"
formatDate(date, 'yyyy-MM-dd', locale)  // ❌ ไม่ locale-aware

// ใช้ Buddhist Era สำหรับภาษาไทยเสมอ
const locale = useLocale();
formatDate(date, 'PPP', locale, locale === 'th');
```

### 7. Performance Optimization

**Code Splitting:**
- Translation files จะถูก split automatically
- โหลดเฉพาะ locale ที่ใช้งาน

**Caching:**
```typescript
// Middleware จะ cache locale detection
// Browser จะ cache translation files
```

**Lazy Loading:**
```typescript
// ใช้ dynamic import สำหรับ large translation files
const messages = await import(`./messages/${locale}/${namespace}.json`);
```

### 8. SEO Optimization

**1. Alternate Links:**
```typescript
// app/[locale]/layout.tsx
export async function generateMetadata({params}: {params: {locale: string}}) {
  return {
    alternates: {
      canonical: `https://example.com/${params.locale}`,
      languages: {
        'en': 'https://example.com/en',
        'th': 'https://example.com/th',
      }
    }
  };
}
```

**2. hreflang Tags:**
```typescript
// components/hreflang-links.tsx
export function HreflangLinks() {
  const pathname = usePathname();
  
  return (
    <>
      <link rel="alternate" hrefLang="en" href={`https://example.com/en${pathname}`} />
      <link rel="alternate" hrefLang="th" href={`https://example.com/th${pathname}`} />
      <link rel="alternate" hrefLang="x-default" href={`https://example.com/en${pathname}`} />
    </>
  );
}
```

---

## 🐛 Troubleshooting

### ปัญหา 1: "Locale not found" Error

**อาการ:**
```
Error: The locale 'th' is not configured
```

**วิธีแก้:**

1. ตรวจสอบไฟล์ `src/i18n.ts`:
   ```typescript
   export const locales = ['en', 'th'] as const;
   ```

2. ตรวจสอบไฟล์ `middleware.ts`:
   ```typescript
   import {locales} from './src/i18n';
   ```

3. ตรวจสอบว่ามีไฟล์ `src/messages/th.json`

---

### ปัญหา 2: Translation Keys ไม่ทำงาน

**อาการ:**
```typescript
t('companies.title')  // แสดง "companies.title" แทนที่จะแสดง "Companies"
```

**วิธีแก้:**

1. ตรวจสอบว่า key มีอยู่ใน JSON file:
   ```json
   {
     "companies": {
       "title": "Companies"
     }
   }
   ```

2. ตรวจสอบ namespace:
   ```typescript
   const t = useTranslations('companies');  // ต้องระบุ namespace
   t('title')  // ไม่ใช่ t('companies.title')
   ```

---

### ปัญหา 3: Language Switcher ไม่เปลี่ยนภาษา

**อาการ:** คลิกเปลี่ยนภาษาแล้ว URL เปลี่ยนแต่เนื้อหาไม่เปลี่ยน

**วิธีแก้:**

1. ตรวจสอบว่า `NextIntlClientProvider` wrap component:
   ```typescript
   <NextIntlClientProvider locale={locale} messages={messages}>
     {children}
   </NextIntlClientProvider>
   ```

2. ตรวจสอบว่าใช้ `router.push()` แทน `router.replace()`

3. Hard refresh browser (Ctrl+Shift+R)

---

### ปัญหา 4: Date Formatting แสดงเป็น NaN

**อาการ:**
```typescript
formatDate(date, 'PPP', 'th')  // แสดง "NaN มกราคม NaN"
```

**วิธีแก้:**

1. ตรวจสอบว่า date เป็น valid Date object:
   ```typescript
   const date = new Date(dateString);
   if (isNaN(date.getTime())) {
     console.error('Invalid date');
   }
   ```

2. ตรวจสอบว่า import date-fns locale:
   ```typescript
   import {th} from 'date-fns/locale';
   ```

---

### ปัญหา 5: Middleware ไม่ทำงาน

**อาการ:** เข้า `/dashboard` แล้วไม่ redirect ไปที่ `/en/dashboard`

**วิธีแก้:**

1. ตรวจสอบว่าไฟล์ `middleware.ts` อยู่ที่ root ของโปรเจค (ไม่ใช่ใน `app/` หรือ `src/`)

2. ตรวจสอบ `matcher` config:
   ```typescript
   export const config = {
     matcher: [
       '/((?!api|_next|_vercel|.*\\..*).*)',
     ]
   };
   ```

3. Restart dev server

---

### ปัญหา 6: Buddhist Era ไม่แสดง

**อาการ:** แสดงเป็น ค.ศ. แทน พ.ศ.

**วิธีแก้:**

```typescript
// ต้องส่ง parameter useBuddhistEra เป็น true
formatDate(date, 'PPP', 'th', true)  // ✅ แสดง พ.ศ.
formatDate(date, 'PPP', 'th')        // ❌ แสดง ค.ศ.
```

---

### ปัญหา 7: TypeScript Errors

**อาการ:**
```
Property 'companies' does not exist on type 'IntlMessages'
```

**วิธีแก้:**

สร้างไฟล์ type definition:

```typescript
// src/types/i18n.d.ts
import 'next-intl';
import type en from '@/src/messages/en.json';

type Messages = typeof en;

declare module 'next-intl' {
  interface IntlMessages extends Messages {}
}
```

---

## 📚 Additional Resources

### เอกสารอ้างอิง

1. **next-intl Documentation:** https://next-intl-docs.vercel.app/
2. **Next.js i18n Routing:** https://nextjs.org/docs/app/building-your-application/routing/internationalization
3. **date-fns Documentation:** https://date-fns.org/
4. **Intl API (MDN):** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl

### ไฟล์เอกสารที่เกี่ยวข้องในโปรเจค

- `I18N.md` - เอกสารหลักเกี่ยวกับ i18n (11,000+ words)
- `I18N_EXAMPLES.md` - ตัวอย่างการใช้งานทุกรูปแบบ (14,000+ words)
- `I18N_IMPLEMENTATION_SUMMARY.md` - สรุปการ implement

### Tools

1. **i18n Ally (VS Code Extension):** 
   - แสดง inline preview ของ translations
   - Extract hardcoded strings
   - Translation management

2. **POEditor / Lokalise:**
   - Translation management platforms
   - Collaboration tools
   - Export to JSON

---

## 🎓 สรุป

### Key Takeaways

1. **next-intl** เป็น library ที่เหมาะสมสำหรับ Next.js 15 App Router
2. **Middleware** จัดการ locale routing อัตโนมัติ
3. **Translation files** ควรจัดเป็น nested structure
4. **Type safety** สำคัญสำหรับการ maintain
5. **Buddhist Era** สำหรับภาษาไทยต้อง handle แยก
6. **SEO** ต้องใส่ hreflang และ alternate links

### Implementation Steps Summary

```
1. ติดตั้ง next-intl
2. สร้าง i18n.ts config
3. สร้าง middleware.ts
4. แก้ไข next.config.js
5. สร้าง translation files
6. Restructure app directory
7. สร้าง layouts
8. สร้าง Language Switcher
9. แก้ไข components
10. ทดสอบ
```
