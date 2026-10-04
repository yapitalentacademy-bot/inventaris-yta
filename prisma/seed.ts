import { PrismaClient } from '@prisma/client';
import hash from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database Inventaris PT YAPI Talent Academy (YTA)...');

  // 1. Create Default Users
  const adminPassword = await hash.hash('admin123', 10);
  const petugasPassword = await hash.hash('petugas123', 10);
  const pimpinanPassword = await hash.hash('pimpinan123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@yta.ac.id' },
    update: {},
    create: {
      name: 'Admin Inventaris YTA',
      email: 'admin@yta.ac.id',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const petugasUser = await prisma.user.upsert({
    where: { email: 'petugas@yta.ac.id' },
    update: {},
    create: {
      name: 'Petugas Sarpras YTA',
      email: 'petugas@yta.ac.id',
      password: petugasPassword,
      role: 'PETUGAS',
    },
  });

  const pimpinanUser = await prisma.user.upsert({
    where: { email: 'pimpinan@yta.ac.id' },
    update: {},
    create: {
      name: 'Direktur / Pimpinan YTA',
      email: 'pimpinan@yta.ac.id',
      password: pimpinanPassword,
      role: 'PIMPINAN',
    },
  });

  console.log('User Accounts Created: admin@yta.ac.id, petugas@yta.ac.id, pimpinan@yta.ac.id');

  // 2. Create Master Data: Categories
  const catElektronik = await prisma.category.upsert({
    where: { name: 'Elektronik' },
    update: {},
    create: { name: 'Elektronik', description: 'Perangkat elektronik dan IT' },
  });

  const catFurnitur = await prisma.category.upsert({
    where: { name: 'Furnitur' },
    update: {},
    create: { name: 'Furnitur', description: 'Perabotan kantor dan meja kursi' },
  });

  const catATK = await prisma.category.upsert({
    where: { name: 'Alat Tulis & Kantor' },
    update: {},
    create: { name: 'Alat Tulis & Kantor', description: 'Perlengkapan kerja harian kantor' },
  });

  // 3. Create Master Data: Locations
  const locGudang = await prisma.location.upsert({
    where: { name: 'Gudang Utama Sarpras' },
    update: {},
    create: { name: 'Gudang Utama Sarpras', type: 'Gudang', description: 'Lantai 1 Gedung YTA' },
  });

  const locKelas = await prisma.location.upsert({
    where: { name: 'Ruang Kelas 101' },
    update: {},
    create: { name: 'Ruang Kelas 101', type: 'Ruang', description: 'Gedung A Lantai 1' },
  });

  const locAdmin = await prisma.location.upsert({
    where: { name: 'Ruang Staff Admin' },
    update: {},
    create: { name: 'Ruang Staff Admin', type: 'Ruang', description: 'Gedung Utama Lantai 2' },
  });

  // 4. Create Master Data: Units
  const unitUnit = await prisma.unit.upsert({
    where: { name: 'unit' },
    update: {},
    create: { name: 'unit' },
  });

  const unitBuah = await prisma.unit.upsert({
    where: { name: 'buah' },
    update: {},
    create: { name: 'buah' },
  });

  const unitSet = await prisma.unit.upsert({
    where: { name: 'set' },
    update: {},
    create: { name: 'set' },
  });

  // 5. Create Master Data: Person in Charge (PIC)
  const picIT = await prisma.personInCharge.create({
    data: { name: 'Budi Santoso', division: 'Tim IT & Infrastruktur' },
  });

  const picOps = await prisma.personInCharge.create({
    data: { name: 'Siti Aminah', division: 'Operasional Pembelajaran' },
  });

  const picUmum = await prisma.personInCharge.create({
    data: { name: 'Divisi Rumah Tangga', division: 'Umum & Sarpras' },
  });

  // 6. Public Visibility Settings Default
  await prisma.publicSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      showBrand: true,
      showSpec: true,
      showPic: false,
      showPrice: false,
      showHistory: false,
    },
  });

  // 7. Initialize Sequence Counter
  await prisma.itemSequence.upsert({
    where: { id: 1 },
    update: { lastNum: 10 },
    create: { id: 1, lastNum: 10 },
  });

  // 8. Create 10 Sample Items
  const sampleItems = [
    {
      code: '001-BRG-YTA',
      codeSeq: 1,
      name: 'Laptop Lenovo ThinkPad E14 Gen 4',
      categoryId: catElektronik.id,
      brandModel: 'Lenovo / ThinkPad E14',
      serialNumber: 'LNV-8392104-YTA',
      specification: 'Core i5-1235U, RAM 16GB, SSD 512GB NVMe, Windows 11 Pro',
      quantity: 1,
      unitId: unitUnit.id,
      locationId: locAdmin.id,
      picId: picIT.id,
      condition: 'BAIK',
      status: 'TERSEDIA',
      acquisitionDate: new Date('2024-01-15'),
      acquisitionSource: 'PEMBELIAN',
      acquisitionPrice: 12500000,
      warrantyExpiry: new Date('2026-01-15'),
      notes: 'Laptop operasional admin divisi akademik',
      photos: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop'],
    },
    {
      code: '002-BRG-YTA',
      codeSeq: 2,
      name: 'Proyektor Epson EB-E500 3300 Lumens',
      categoryId: catElektronik.id,
      brandModel: 'Epson / EB-E500',
      serialNumber: 'EPS-9912034',
      specification: '3300 ANSI Lumens, XGA resolution, HDMI & VGA Input',
      quantity: 1,
      unitId: unitUnit.id,
      locationId: locKelas.id,
      picId: picOps.id,
      condition: 'BAIK',
      status: 'TERSEDIA',
      acquisitionDate: new Date('2023-11-10'),
      acquisitionSource: 'PEMBELIAN',
      acquisitionPrice: 6200000,
      warrantyExpiry: new Date('2025-11-10'),
      notes: 'Proyektor kelas pelatihan utama',
      photos: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop'],
    },
    {
      code: '003-BRG-YTA',
      codeSeq: 3,
      name: 'Meja Kerja Kayu Jati Minimalis 120x60',
      categoryId: catFurnitur.id,
      brandModel: 'Custom / Jati Jepara',
      serialNumber: '-',
      specification: 'Rangka Kayu Jati Solid, Finishing Melamine Natural Walnut',
      quantity: 1,
      unitId: unitBuah.id,
      locationId: locAdmin.id,
      picId: picUmum.id,
      condition: 'BAIK',
      status: 'TERSEDIA',
      acquisitionDate: new Date('2023-08-01'),
      acquisitionSource: 'PEMBELIAN',
      acquisitionPrice: 2100000,
      notes: 'Meja kerja staf administrasi',
      photos: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop'],
    },
    {
      code: '004-BRG-YTA',
      codeSeq: 4,
      name: 'Kursi Ergonomis Mesh Office Chair',
      categoryId: catFurnitur.id,
      brandModel: 'Fantech / OC-A2',
      serialNumber: '-',
      specification: '3D Armrest, Lumbar Support Adjustable, Heavy Duty Gaslift',
      quantity: 1,
      unitId: unitBuah.id,
      locationId: locAdmin.id,
      picId: picUmum.id,
      condition: 'RUSAK_RINGAN',
      status: 'TERSEDIA',
      acquisitionDate: new Date('2023-08-01'),
      acquisitionSource: 'PEMBELIAN',
      acquisitionPrice: 1450000,
      notes: 'Roda kiri agak aus, masih berfungsi baik',
      photos: ['https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=600&auto=format&fit=crop'],
    },
    {
      code: '005-BRG-YTA',
      codeSeq: 5,
      name: 'AC Portable Sharp 1 PK Turbo Cool',
      categoryId: catElektronik.id,
      brandModel: 'Sharp / CV-P10TC',
      serialNumber: 'SHP-AC-78219',
      specification: 'Daya 850W, Freon R32, Self Cleaning Function',
      quantity: 1,
      unitId: unitUnit.id,
      locationId: locGudang.id,
      picId: picUmum.id,
      condition: 'BAIK',
      status: 'DIPINJAM',
      acquisitionDate: new Date('2024-02-20'),
      acquisitionSource: 'PEMBELIAN',
      acquisitionPrice: 4300000,
      warrantyExpiry: new Date('2026-02-20'),
      notes: 'Dipinjam sementara untuk event hall YTA',
      photos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop'],
    },
    {
      code: '006-BRG-YTA',
      codeSeq: 6,
      name: 'Printer Canon Pixma G3010 Wireless Ink Tank',
      categoryId: catElektronik.id,
      brandModel: 'Canon / G3010',
      serialNumber: 'CNN-G3010-901',
      specification: 'Print, Scan, Copy, Wi-Fi Direct, Continuous Ink Tank System',
      quantity: 1,
      unitId: unitUnit.id,
      locationId: locAdmin.id,
      picId: picIT.id,
      condition: 'BAIK',
      status: 'TERSEDIA',
      acquisitionDate: new Date('2024-03-05'),
      acquisitionSource: 'PEMBELIAN',
      acquisitionPrice: 2850000,
      warrantyExpiry: new Date('2025-03-05'),
      notes: 'Printer cetak dokumen resmi YTA',
      photos: ['https://images.unsplash.com/photo-1612815150546-a6a26d7054f0?w=600&auto=format&fit=crop'],
    },
    {
      code: '007-BRG-YTA',
      codeSeq: 7,
      name: 'Board Marker Whiteboard Spidol Box (Isi 12)',
      categoryId: catATK.id,
      brandModel: 'Snowman / BG-12',
      serialNumber: '-',
      specification: 'Warna Hitam Refillable, Tidak Beracun, Cepat Kering',
      quantity: 5,
      unitId: unitSet.id,
      locationId: locGudang.id,
      picId: picOps.id,
      condition: 'BAIK',
      status: 'TERSEDIA',
      acquisitionDate: new Date('2024-05-10'),
      acquisitionSource: 'PEMBELIAN',
      acquisitionPrice: 180000,
      notes: 'Stok perlengkapan pengajar di kelas',
      photos: ['https://images.unsplash.com/photo-1585336261026-8f5786372969?w=600&auto=format&fit=crop'],
    },
    {
      code: '008-BRG-YTA',
      codeSeq: 8,
      name: 'Speaker Portable Baretone 15 Inch Wireless',
      categoryId: catElektronik.id,
      brandModel: 'Baretone / MAX15AL',
      serialNumber: 'BRT-15-7721',
      specification: 'Baterai Cas, 2 Wireless Microphone, Bluetooth, USB & SD Card',
      quantity: 1,
      unitId: unitSet.id,
      locationId: locGudang.id,
      picId: picOps.id,
      condition: 'BAIK',
      status: 'TERSEDIA',
      acquisitionDate: new Date('2023-12-01'),
      acquisitionSource: 'HIBAH',
      acquisitionPrice: 3500000,
      notes: 'Hibah dari Mitra Industri YTA',
      photos: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop'],
    },
    {
      code: '009-BRG-YTA',
      codeSeq: 9,
      name: 'Kamera DSLR Canon EOS 1500D Kit 18-55mm',
      categoryId: catElektronik.id,
      brandModel: 'Canon / EOS 1500D',
      serialNumber: 'CNN-EOS-552190',
      specification: 'Sensor 24.1MP APS-C CMOS, DIGIC 4+, Full HD Video Recording',
      quantity: 1,
      unitId: unitSet.id,
      locationId: locAdmin.id,
      picId: picIT.id,
      condition: 'BAIK',
      status: 'TERSEDIA',
      acquisitionDate: new Date('2024-01-20'),
      acquisitionSource: 'PEMBELIAN',
      acquisitionPrice: 6800000,
      warrantyExpiry: new Date('2025-01-20'),
      notes: 'Kamera dokumentasi kegiatan YTA',
      photos: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop'],
    },
    {
      code: '010-BRG-YTA',
      codeSeq: 10,
      name: 'Mikroskop Digital Portable HD 1000x',
      categoryId: catElektronik.id,
      brandModel: 'Mustool / G1200',
      serialNumber: 'MST-1000X-88',
      specification: 'Layar LCD 7 Inch, Pembesaran 1-1200X Continuous, LED Light',
      quantity: 1,
      unitId: unitUnit.id,
      locationId: locKelas.id,
      picId: picOps.id,
      condition: 'RUSAK_RINGAN',
      status: 'DALAM_PERBAIKAN',
      acquisitionDate: new Date('2023-06-15'),
      acquisitionSource: 'PEMBELIAN',
      acquisitionPrice: 1200000,
      notes: 'Port pengisian daya micro-USB longgar, sedang diperbaiki tim IT',
      photos: ['https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop'],
    },
  ];

  for (const item of sampleItems) {
    const { photos, ...itemData } = item;
    const createdItem = await prisma.item.upsert({
      where: { code: item.code },
      update: {},
      create: {
        ...itemData,
        createdById: adminUser.id,
        updatedById: adminUser.id,
      },
    });

    if (photos && photos.length > 0) {
      await prisma.itemPhoto.createMany({
        data: photos.map((url, idx) => ({
          itemId: createdItem.id,
          url,
          isPrimary: idx === 0,
        })),
      });
    }

    await prisma.itemHistory.create({
      data: {
        itemId: createdItem.id,
        userId: adminUser.id,
        action: 'TAMBAH',
        details: 'Barang baru ditambahkan saat pengisian data awal (seeding database).',
      },
    });
  }

  console.log('10 Sample Items created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
