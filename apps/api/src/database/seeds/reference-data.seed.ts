import { DataSource } from 'typeorm';
import { RefIndustryCodes } from '../../entities/RefIndustryCodes';
import { RefRegions } from '../../entities/RefRegions';

/**
 * Seed data for reference tables
 * Run this with: npm run seed
 */

export async function seedReferenceData(dataSource: DataSource): Promise<void> {
  console.log('🌱 Seeding reference data...');

  const industryRepo = dataSource.getRepository(RefIndustryCodes);
  const regionRepo = dataSource.getRepository(RefRegions);

  // Seed Industry Codes (TSIC 2009 - Thailand Standard Industrial Classification)
  const industries = [
    {
      code: '01',
      titleEn: 'Agriculture, forestry and fishing',
      titleTh: 'เกษตรกรรม การป่าไม้ และการประมง',
      description: 'Growing of crops, farming of animals, forestry, fishing',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '05',
      titleEn: 'Mining and quarrying',
      titleTh: 'การทำเหมืองแร่และเหมืองหิน',
      description: 'Mining of coal, metal ores, crude petroleum and natural gas',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '10',
      titleEn: 'Manufacturing',
      titleTh: 'อุตสาหกรรมการผลิต',
      description: 'Manufacture of food products, beverages, textiles, chemicals, machinery',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '35',
      titleEn: 'Electricity, gas, steam and air conditioning supply',
      titleTh: 'การจัดหาไฟฟ้า ก๊าซ ไอน้ำ และอากาศบริสุทธิ์',
      description: 'Electric power generation, transmission and distribution',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '41',
      titleEn: 'Construction',
      titleTh: 'การก่อสร้าง',
      description: 'Construction of buildings, civil engineering',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '45',
      titleEn: 'Wholesale and retail trade',
      titleTh: 'การค้าส่งและการค้าปลีก',
      description: 'Sale and repair of motor vehicles, wholesale and retail trade',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '49',
      titleEn: 'Transportation and storage',
      titleTh: 'การขนส่งและสถานที่เก็บสินค้า',
      description: 'Land transport, water transport, air transport, warehousing',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '55',
      titleEn: 'Accommodation and food service activities',
      titleTh: 'บริการที่พักแรมและบริการด้านอาหาร',
      description: 'Hotels, restaurants, catering services',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '58',
      titleEn: 'Information and communication',
      titleTh: 'สารสนเทศและการสื่อสาร',
      description: 'Publishing, telecommunications, computer programming',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '62',
      titleEn: 'Computer programming, consultancy',
      titleTh: 'การเขียนโปรแกรมคอมพิวเตอร์และที่ปรึกษา',
      description: 'Software development, IT consulting, computer facilities management',
      classificationSystem: 'TSIC',
      level: 2,
      parentCode: '58',
      isActive: true,
    },
    {
      code: '64',
      titleEn: 'Financial and insurance activities',
      titleTh: 'กิจกรรมทางการเงินและการประกันภัย',
      description: 'Banking, insurance, financial services',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '68',
      titleEn: 'Real estate activities',
      titleTh: 'กิจกรรมด้านอสังหาริมทรัพย์',
      description: 'Buying, selling, renting of real estate',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '69',
      titleEn: 'Professional, scientific and technical activities',
      titleTh: 'กิจกรรมทางวิชาชีพ วิทยาศาสตร์และเทคนิค',
      description: 'Legal, accounting, engineering, architecture, consulting',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '77',
      titleEn: 'Administrative and support service activities',
      titleTh: 'กิจกรรมการบริหารและบริการสนับสนุน',
      description: 'Rental and leasing, employment services, travel agencies',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '85',
      titleEn: 'Education',
      titleTh: 'การศึกษา',
      description: 'Pre-primary, primary, secondary, higher education',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '86',
      titleEn: 'Human health activities',
      titleTh: 'กิจกรรมด้านสุขภาพของมนุษย์',
      description: 'Hospital activities, medical and dental practice',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
    {
      code: '90',
      titleEn: 'Creative, arts and entertainment activities',
      titleTh: 'กิจกรรมสร้างสรรค์ ศิลปะและความบันเทิง',
      description: 'Performing arts, museums, gambling and betting',
      classificationSystem: 'TSIC',
      level: 1,
      parentCode: null,
      isActive: true,
    },
  ];

  console.log(`  Seeding ${industries.length} industry codes...`);
  
  for (const industry of industries) {
    const existing = await industryRepo.findOne({
      where: { code: industry.code, classificationSystem: industry.classificationSystem },
    });

    if (!existing) {
      await industryRepo.save(industryRepo.create(industry));
    }
  }

  // Seed Thai Provinces (Regions)
  const provinces = [
    { code: 'BKK', nameEn: 'Bangkok', nameTh: 'กรุงเทพมหานคร', regionType: 'province', countryCode: 'TH' },
    { code: 'CNX', nameEn: 'Chiang Mai', nameTh: 'เชียงใหม่', regionType: 'province', countryCode: 'TH' },
    { code: 'CNR', nameEn: 'Chiang Rai', nameTh: 'เชียงราย', regionType: 'province', countryCode: 'TH' },
    { code: 'NMA', nameEn: 'Nakhon Ratchasima', nameTh: 'นครราชสีมา', regionType: 'province', countryCode: 'TH' },
    { code: 'PKT', nameEn: 'Phuket', nameTh: 'ภูเก็ต', regionType: 'province', countryCode: 'TH' },
    { code: 'KBI', nameEn: 'Krabi', nameTh: 'กระบี่', regionType: 'province', countryCode: 'TH' },
    { code: 'CBI', nameEn: 'Chonburi', nameTh: 'ชลบุรี', regionType: 'province', countryCode: 'TH' },
    { code: 'RYG', nameEn: 'Rayong', nameTh: 'ระยอง', regionType: 'province', countryCode: 'TH' },
    { code: 'SPK', nameEn: 'Samut Prakan', nameTh: 'สมุทรปราการ', regionType: 'province', countryCode: 'TH' },
    { code: 'SKA', nameEn: 'Samut Sakhon', nameTh: 'สมุทรสาคร', regionType: 'province', countryCode: 'TH' },
    { code: 'NBI', nameEn: 'Nonthaburi', nameTh: 'นนทบุรี', regionType: 'province', countryCode: 'TH' },
    { code: 'PTE', nameEn: 'Pathum Thani', nameTh: 'ปทุมธานี', regionType: 'province', countryCode: 'TH' },
    { code: 'AYA', nameEn: 'Phra Nakhon Si Ayutthaya', nameTh: 'พระนครศรีอยุธยา', regionType: 'province', countryCode: 'TH' },
    { code: 'KKC', nameEn: 'Khon Kaen', nameTh: 'ขอนแก่น', regionType: 'province', countryCode: 'TH' },
    { code: 'UDT', nameEn: 'Udon Thani', nameTh: 'อุดรธานี', regionType: 'province', countryCode: 'TH' },
    { code: 'UBN', nameEn: 'Ubon Ratchathani', nameTh: 'อุบลราชธานี', regionType: 'province', countryCode: 'TH' },
    { code: 'HKT', nameEn: 'Hat Yai', nameTh: 'หาดใหญ่', regionType: 'province', countryCode: 'TH' },
    { code: 'SKA', nameEn: 'Songkhla', nameTh: 'สงขลา', regionType: 'province', countryCode: 'TH' },
    { code: 'NWT', nameEn: 'Nakhon Si Thammarat', nameTh: 'นครศรีธรรมราช', regionType: 'province', countryCode: 'TH' },
    { code: 'SRT', nameEn: 'Surat Thani', nameTh: 'สุราษฎร์ธานี', regionType: 'province', countryCode: 'TH' },
  ];

  console.log(`  Seeding ${provinces.length} provinces...`);

  for (const province of provinces) {
    const existing = await regionRepo.findOne({
      where: { code: province.code, countryCode: province.countryCode, regionType: province.regionType },
    });

    if (!existing) {
      await regionRepo.save(regionRepo.create({
        ...province,
        isActive: true,
        parentRegion: undefined,
      }));
    }
  }

  console.log('✅ Reference data seeding completed!');
}
