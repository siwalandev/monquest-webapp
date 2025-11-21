import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@monquest.com' },
    update: {},
    create: {
      email: 'admin@monquest.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample API keys
  const apiKey1 = await prisma.apiKey.upsert({
    where: { key: 'mk_prod_1234567890abcdefghij' },
    update: {},
    create: {
      name: 'Production API Key',
      key: 'mk_prod_1234567890abcdefghij',
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      userId: admin.id,
    },
  });

  const apiKey2 = await prisma.apiKey.upsert({
    where: { key: 'mk_dev_0987654321zyxwvutsrq' },
    update: {},
    create: {
      name: 'Development API Key',
      key: 'mk_dev_0987654321zyxwvutsrq',
      environment: 'DEVELOPMENT',
      status: 'ACTIVE',
      userId: admin.id,
    },
  });

  console.log('✅ Created API keys:', apiKey1.name, apiKey2.name);

  // Create initial content
  const heroContent = await prisma.content.upsert({
    where: { type: 'HERO' },
    update: {},
    create: {
      type: 'HERO',
      data: {
        title: 'MONQUEST',
        subtitle: 'Defend Your Kingdom in Epic Pixel-Art Tower Defense',
        description: 'Build towers, summon heroes, and conquer waves of monsters on the Monad blockchain. Earn NFTs, collect rare items, and climb the leaderboard in this play-to-earn adventure!',
        ctaPrimary: { text: 'Play Now', icon: 'IoGameController' },
        ctaSecondary: { text: 'Learn More', icon: 'IoBook' },
        stats: [
          { value: '1000+', label: 'Players' },
          { value: '50+', label: 'Unique Towers' },
          { value: '100+', label: 'NFT Items' },
          { value: '24/7', label: 'Online' },
        ],
      },
    },
  });

  const featuresContent = await prisma.content.upsert({
    where: { type: 'FEATURES' },
    update: {},
    create: {
      type: 'FEATURES',
      data: {
        title: 'Game Features',
        subtitle: 'Experience the ultimate tower defense adventure with blockchain technology',
        items: [
          {
            id: '1',
            icon: 'IoHome',
            title: 'Strategic Defense',
            description: 'Build and upgrade towers with unique abilities. Plan your defense strategy carefully!',
            color: 'primary',
          },
          {
            id: '2',
            icon: 'IoShield',
            title: 'Epic Battles',
            description: 'Fight against waves of monsters with increasing difficulty. Boss battles await!',
            color: 'secondary',
          },
          {
            id: '3',
            icon: 'IoColorPalette',
            title: 'Pixel-Art Beauty',
            description: 'Stunning retro pixel-art graphics with smooth animations and vibrant colors.',
            color: 'accent',
          },
        ],
      },
    },
  });

  const howItWorksContent = await prisma.content.upsert({
    where: { type: 'HOW_IT_WORKS' },
    update: {},
    create: {
      type: 'HOW_IT_WORKS',
      data: {
        title: 'How It Works',
        subtitle: 'Start your adventure in just 4 simple steps',
        steps: [
          {
            id: '1',
            number: '1',
            icon: 'IoLink',
            title: 'Connect Wallet',
            description: 'Connect your Web3 wallet to access the game on Monad blockchain.',
          },
          {
            id: '2',
            number: '2',
            icon: 'IoCompass',
            title: 'Choose Your Path',
            description: 'Select your starting hero and receive your first tower NFTs.',
          },
          {
            id: '3',
            number: '3',
            icon: 'IoHammer',
            title: 'Build & Defend',
            description: 'Place towers strategically and defend against monster waves.',
          },
          {
            id: '4',
            number: '4',
            icon: 'IoArrowUp',
            title: 'Earn & Upgrade',
            description: 'Collect rewards, upgrade towers, and mint rare NFT items.',
          },
        ],
      },
    },
  });

  console.log('✅ Created content:', heroContent.type, featuresContent.type, howItWorksContent.type);

  // Create activity log
  await prisma.activityLog.create({
    data: {
      action: 'created',
      resource: 'database',
      resourceId: 'seed',
      details: { message: 'Initial database seed completed' },
      userId: admin.id,
    },
  });

  console.log('✅ Created initial activity log');
  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
