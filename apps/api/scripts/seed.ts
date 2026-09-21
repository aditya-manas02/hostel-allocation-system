import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getScopedPRNG } from '@hostel/engine';
import {
  GenderDesignation,
  RoomType,
  QuotaCategory,
  FeeCategory,
  Gender,
} from '@hostel/shared';
import { HostelModel } from '../src/models/Hostel.js';
import { BlockModel } from '../src/models/Block.js';
import { FloorModel } from '../src/models/Floor.js';
import { RoomModel } from '../src/models/Room.js';
import { BedModel } from '../src/models/Bed.js';
import { UserModel } from '../src/models/User.js';
import { AllocationCycleModel } from '../src/models/AllocationCycle.js';
import { ApplicationModel } from '../src/models/Application.js';
import { defaultEncryptionService } from '../src/services/EncryptionService.js';
import { env } from '../src/config/env.js';

const MASTER_SEED = 'university-hostel-seed-v1-2026';

export async function runSeed(limitScale: number = 1.0): Promise<{
  hostelsCount: number;
  blocksCount: number;
  floorsCount: number;
  roomsCount: number;
  bedsCount: number;
  accessibleBedsCount: number;
  studentsCount: number;
  applicationsCount: number;
}> {
  console.log(`[Seed] Starting deterministic seeding with scale ${limitScale}...`);

  const rng = getScopedPRNG(MASTER_SEED, 'seed-generator');

  // Connect to DB if not connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.MONGODB_URI);
  }

  // Clear existing collections for a clean deterministic seed
  await Promise.all([
    HostelModel.deleteMany({}),
    BlockModel.deleteMany({}),
    FloorModel.deleteMany({}),
    RoomModel.deleteMany({}),
    BedModel.deleteMany({}),
    UserModel.deleteMany({}),
    AllocationCycleModel.deleteMany({}),
    ApplicationModel.deleteMany({}),
  ]);

  const defaultPasswordHash = await bcrypt.hash('Password123!', 8);

  // 1. Create Administrative Users
  const systemAdmin = await UserModel.create({
    email: 'admin@university.edu',
    fullName: 'System Administrator',
    passwordHash: defaultPasswordHash,
    role: 'SYSTEM_ADMIN',
  });

  await UserModel.create({
    email: 'dean@university.edu',
    fullName: 'Dean of Student Welfare',
    passwordHash: defaultPasswordHash,
    role: 'DEAN',
  });

  await UserModel.create({
    email: 'chief.warden@university.edu',
    fullName: 'Chief Warden',
    passwordHash: defaultPasswordHash,
    role: 'CHIEF_WARDEN',
  });

  // 2. Create 5 Hostels
  const hostelConfigs: Array<{
    name: string;
    code: string;
    gender: GenderDesignation;
    blockPrefix: string;
  }> = [
    { name: 'Gargi Bhawan', code: 'GB', gender: 'FEMALE', blockPrefix: 'G' },
    { name: 'Sarojini Bhawan', code: 'SB', gender: 'FEMALE', blockPrefix: 'S' },
    { name: 'Tagore Bhawan', code: 'TB', gender: 'MALE', blockPrefix: 'T' },
    { name: 'Aryabhatta Bhawan', code: 'AB', gender: 'MALE', blockPrefix: 'A' },
    { name: 'Kalam International House', code: 'KB', gender: 'COED', blockPrefix: 'K' },
  ];

  const createdHostels = [];
  const wardens = [];

  for (const hConf of hostelConfigs) {
    const hostel = await HostelModel.create({
      name: hConf.name,
      code: hConf.code,
      genderDesignation: hConf.gender,
      description: `${hConf.name} residential complex`,
    });
    createdHostels.push(hostel);

    // Warden for this hostel
    const warden = await UserModel.create({
      email: `warden.${hConf.code.toLowerCase()}@university.edu`,
      fullName: `Warden ${hConf.name}`,
      passwordHash: defaultPasswordHash,
      role: 'WARDEN',
      assignedHostelId: hostel._id.toString(),
    });
    wardens.push(warden);
  }

  // 3. Build Blocks, Floors, Rooms, and Beds to target ~8,000 beds
  // 5 hostels * 4 blocks = 20 blocks
  // Each block has 4 floors = 80 floors
  // Each floor has 30 rooms = 2,400 rooms
  // Average capacity: ~3.33 beds/room => 2,400 * 3.33 = ~8,000 beds!
  let totalBeds = 0;
  let totalAccessibleBeds = 0;
  let totalRooms = 0;
  let totalFloors = 0;
  let totalBlocks = 0;

  const roomDocs: any[] = [];
  const bedDocs: any[] = [];

  const roomTypes: RoomType[] = ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'];
  const capacities = { SINGLE: 1, DOUBLE: 2, TRIPLE: 3, QUAD: 4 };

  for (const hostel of createdHostels) {
    const isCoed = hostel.genderDesignation === 'COED';

    for (let b = 1; b <= 4; b++) {
      totalBlocks++;
      let blockGender: GenderDesignation = hostel.genderDesignation;
      if (isCoed) {
        blockGender = b <= 2 ? 'MALE' : 'FEMALE';
      }

      const block = await BlockModel.create({
        hostelId: hostel._id,
        name: `Block ${String.fromCharCode(64 + b)}`,
        code: `${hostel.code}-${String.fromCharCode(64 + b)}`,
        genderDesignation: blockGender,
      });

      for (let f = 0; f <= 3; f++) {
        totalFloors++;
        const floor = await FloorModel.create({
          blockId: block._id,
          hostelId: hostel._id,
          floorNumber: f,
          name: f === 0 ? 'Ground Floor' : `Floor ${f}`,
        });

        // 37 rooms per floor (80 floors * 37 rooms = 2,960 rooms -> ~8,000 beds)
        for (let r = 1; r <= 37; r++) {
          totalRooms++;
          // Determine room type deterministically
          const randType = rng();
          let rType: RoomType = 'TRIPLE';
          if (randType < 0.10) rType = 'SINGLE';
          else if (randType < 0.40) rType = 'DOUBLE';
          else if (randType < 0.80) rType = 'TRIPLE';
          else rType = 'QUAD';

          const cap = capacities[rType];
          // Ground floor has accessible rooms
          const isAccessible = f === 0 && r <= 4;

          const roomNumber = `${f}${r.toString().padStart(2, '0')}`;
          const roomId = new mongoose.Types.ObjectId();

          roomDocs.push({
            _id: roomId,
            floorId: floor._id,
            blockId: block._id,
            hostelId: hostel._id,
            roomNumber,
            roomType: rType,
            capacity: cap,
            genderDesignation: blockGender,
            isAccessible,
            status: 'AVAILABLE',
          });

          // Beds in room
          for (let bedIdx = 1; bedIdx <= cap; bedIdx++) {
            totalBeds++;
            if (isAccessible) totalAccessibleBeds++;
            const bedLabel = String.fromCharCode(64 + bedIdx);

            bedDocs.push({
              _id: new mongoose.Types.ObjectId(),
              roomId,
              floorId: floor._id,
              blockId: block._id,
              hostelId: hostel._id,
              bedLabel,
              status: 'AVAILABLE',
              isAccessible,
            });
          }
        }
      }
    }
  }

  // Bulk insert rooms and beds in chunks for high performance
  console.log(`[Seed] Inserting ${roomDocs.length} rooms and ${bedDocs.length} beds...`);
  await RoomModel.insertMany(roomDocs, { ordered: false });
  await BedModel.insertMany(bedDocs, { ordered: false });

  // 4. Create Active Allocation Cycle
  const cycle = await AllocationCycleModel.create({
    academicYear: '2026-2027',
    term: 'Fall Semester',
    status: 'APPLICATIONS_OPEN',
    applicationStartDate: new Date('2026-08-01'),
    applicationEndDate: new Date('2026-10-31'),
    eligibilityRuleSetVersion: 'v1',
    documentRequirements: ['STUDENT_ID', 'FEE_RECEIPT', 'INCOME_CERTIFICATE'],
    quotas: {
      GENERAL: 60,
      SPORTS: 10,
      INTERNATIONAL: 10,
      PWD: 5,
      SCHOLARSHIP: 10,
      STAFF_WARD: 5,
    },
  });

  // 5. Create ~8,000 synthetic applicants with varied attributes
  const targetApplicantCount = Math.round(totalBeds * limitScale);
  console.log(`[Seed] Generating ${targetApplicantCount} student applicants...`);

  const studentDocs: any[] = [];
  const appDocs: any[] = [];

  const programmes = ['B.Tech CSE', 'B.Tech ECE', 'B.Tech ME', 'M.Tech AI', 'MBA', 'M.Sc Physics', 'Ph.D'];
  const quotaPool: QuotaCategory[] = ['GENERAL', 'SPORTS', 'INTERNATIONAL', 'PWD', 'SCHOLARSHIP', 'STAFF_WARD'];
  const feePool: FeeCategory[] = ['STANDARD', 'SUBSIDIZED', 'FULL_FEE', 'EXEMPTED'];

  for (let i = 1; i <= targetApplicantCount; i++) {
    const studentId = new mongoose.Types.ObjectId();
    const randGender = rng();
    const gender: Gender = randGender < 0.5 ? 'FEMALE' : randGender < 0.98 ? 'MALE' : 'OTHER';

    const randQuota = rng();
    let quota: QuotaCategory = 'GENERAL';
    if (randQuota < 0.6) quota = 'GENERAL';
    else if (randQuota < 0.7) quota = 'SPORTS';
    else if (randQuota < 0.8) quota = 'INTERNATIONAL';
    else if (randQuota < 0.85) quota = 'PWD';
    else if (randQuota < 0.95) quota = 'SCHOLARSHIP';
    else quota = 'STAFF_WARD';

    const randFee = rng();
    let fee: FeeCategory = 'STANDARD';
    if (randFee < 0.7) fee = 'STANDARD';
    else if (randFee < 0.85) fee = 'SUBSIDIZED';
    else if (randFee < 0.95) fee = 'FULL_FEE';
    else fee = 'EXEMPTED';

    const progIdx = Math.floor(rng() * programmes.length);
    const programme = programmes[progIdx]!;
    const yearOfStudy = Math.floor(rng() * 4) + 1;
    const isAccessible = quota === 'PWD' || rng() < 0.02;

    studentDocs.push({
      _id: studentId,
      email: `student.${i}@university.edu`,
      fullName: `Student Applicant ${i}`,
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      isActive: true,
    });

    // Encrypted questionnaire response for roommate matching
    const surveyAnswers = {
      sleepSchedule: rng() < 0.4 ? 'EARLY_BIRD' : rng() < 0.8 ? 'NIGHT_OWL' : 'FLEXIBLE',
      cleanlinessLevel: Math.floor(rng() * 5) + 1,
      noiseTolerance: Math.floor(rng() * 5) + 1,
      studyHabits: rng() < 0.5 ? 'IN_ROOM_SILENT' : rng() < 0.8 ? 'IN_ROOM_MUSIC' : 'LIBRARY_ONLY',
      guestFrequency: rng() < 0.3 ? 'NEVER' : rng() < 0.8 ? 'OCCASIONAL' : 'FREQUENT',
      smokingHabit: rng() < 0.05,
    };

    appDocs.push({
      cycleId: cycle._id,
      studentId,
      status: 'SUBMITTED',
      programme,
      yearOfStudy,
      gender,
      quotaCategory: quota,
      feeCategory: fee,
      accessibilityRequired: isAccessible,
      accessibilityReason: isAccessible ? 'Mobility impairment requires ground floor accessible bed' : undefined,
      meritRank: Math.floor(rng() * 10000) + 1,
      submittedAt: new Date(Date.now() - Math.floor(rng() * 30 * 86400000)),
      documents: [
        { docType: 'STUDENT_ID', url: `https://storage.university.edu/docs/${studentId}/id.pdf`, verified: true },
        { docType: 'FEE_RECEIPT', url: `https://storage.university.edu/docs/${studentId}/fee.pdf`, verified: true },
      ],
    });
  }

  console.log(`[Seed] Inserting ${studentDocs.length} students and applications...`);
  await UserModel.insertMany(studentDocs, { ordered: false });
  await ApplicationModel.insertMany(appDocs, { ordered: false });

  console.log('[Seed] Seeding completed successfully!');
  return {
    hostelsCount: createdHostels.length,
    blocksCount: totalBlocks,
    floorsCount: totalFloors,
    roomsCount: totalRooms,
    bedsCount: totalBeds,
    accessibleBedsCount: totalAccessibleBeds,
    studentsCount: studentDocs.length,
    applicationsCount: appDocs.length,
  };
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed(1.0)
    .then((stats) => {
      console.log('Seeding statistics:', stats);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
