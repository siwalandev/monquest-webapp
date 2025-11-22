import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Permission constants
const PERMISSIONS = {
  panel: [
    'panel.access', // Required to access admin panel
  ],
  users: [
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.manage_roles',
  ],
  roles: [
    'roles.view',
    'roles.create',
    'roles.edit',
    'roles.delete',
    'roles.assign',
  ],
  content: [
    'content.view',
    'content.create',
    'content.edit',
    'content.delete',
  ],
  media: [
    'media.view',
    'media.upload',
    'media.delete',
  ],
  apiKeys: [
    'apiKeys.view',
    'apiKeys.create',
    'apiKeys.delete',
  ],
  settings: [
    'settings.view',
    'settings.edit',
  ],
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS).flat();

async function main() {
  console.log('🌱 Starting seed...');

  // Create roles (already created in migration, but upsert for safety)
  const superAdminRole = await prisma.role.upsert({
    where: { slug: 'super_admin' },
    update: {
      permissions: ALL_PERMISSIONS,
    },
    create: {
      id: 'role_super_admin',
      name: 'Super Admin',
      slug: 'super_admin',
      description: 'Full system access with all permissions',
      permissions: ALL_PERMISSIONS,
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {
      permissions: [
        ...PERMISSIONS.panel,
        ...PERMISSIONS.users.filter(p => p !== 'users.delete' && p !== 'users.manage_roles'),
        ...PERMISSIONS.content,
        ...PERMISSIONS.media,
        ...PERMISSIONS.apiKeys,
        ...PERMISSIONS.settings, // Full settings access
      ],
    },
    create: {
      id: 'role_admin',
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access with limited permissions',
      permissions: [
        ...PERMISSIONS.panel,
        ...PERMISSIONS.users.filter(p => p !== 'users.delete' && p !== 'users.manage_roles'),
        ...PERMISSIONS.content,
        ...PERMISSIONS.media,
        ...PERMISSIONS.apiKeys,
        ...PERMISSIONS.settings, // Full settings access
      ],
      isSystem: true,
    },
  });

  // Create optional roles for flexibility
  const editorRole = await prisma.role.upsert({
    where: { slug: 'editor' },
    update: {
      permissions: [
        ...PERMISSIONS.panel, // ✅ Need panel.access to enter admin
        ...PERMISSIONS.content,
        ...PERMISSIONS.media,
      ],
    },
    create: {
      name: 'Editor',
      slug: 'editor',
      description: 'Content management access only',
      permissions: [
        ...PERMISSIONS.panel, // ✅ Need panel.access to enter admin
        ...PERMISSIONS.content,
        ...PERMISSIONS.media,
      ],
      isSystem: false,
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { slug: 'viewer' },
    update: {
      permissions: [
        ...PERMISSIONS.panel, // ✅ Need panel.access to enter admin
        'users.view',
        'roles.view',
        'content.view',
        'media.view',
        'apiKeys.view',
        'settings.view',
      ],
    },
    create: {
      name: 'Viewer',
      slug: 'viewer',
      description: 'Read-only access to all content',
      permissions: [
        ...PERMISSIONS.panel, // ✅ Need panel.access to enter admin
        'users.view',
        'roles.view',
        'content.view',
        'media.view',
        'apiKeys.view',
        'settings.view',
      ],
      isSystem: false,
    },
  });

  // Create User role for regular website visitors (no admin access)
  const userRole = await prisma.role.upsert({
    where: { slug: 'user' },
    update: {},
    create: {
      name: 'User',
      slug: 'user',
      description: 'Regular user with no admin panel access - homepage only',
      permissions: [],
      isSystem: false,
    },
  });

  console.log('✅ Created roles:', superAdminRole.name, adminRole.name, editorRole.name, viewerRole.name, userRole.name);

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@monquest.com' },
    update: {},
    create: {
      email: 'admin@monquest.com',
      password: hashedPassword,
      name: 'Admin User',
      roleId: superAdminRole.id,
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
        ctaButtons: [
          { 
            id: 'cta1', 
            text: 'Play Now', 
            icon: 'IoGameController', 
            variant: 'primary',
            link: '/play',
            order: 0 
          },
          { 
            id: 'cta2', 
            text: 'Learn More', 
            icon: 'IoBook', 
            variant: 'secondary',
            link: '/docs',
            order: 1 
          },
        ],
        stats: [
          { id: 'stat1', value: '1000+', label: 'Players', order: 0 },
          { id: 'stat2', value: '50+', label: 'Unique Towers', order: 1 },
          { id: 'stat3', value: '100+', label: 'NFT Items', order: 2 },
          { id: 'stat4', value: '24/7', label: 'Online', order: 3 },
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
            id: 'step1',
            icon: 'IoLink',
            title: 'Connect Wallet',
            description: 'Connect your Web3 wallet to access the game on Monad blockchain.',
            order: 0,
          },
          {
            id: 'step2',
            icon: 'IoCompass',
            title: 'Choose Your Path',
            description: 'Select your starting hero and receive your first tower NFTs.',
            order: 1,
          },
          {
            id: 'step3',
            icon: 'IoHammer',
            title: 'Build & Defend',
            description: 'Place towers strategically and defend against monster waves.',
            order: 2,
          },
          {
            id: 'step4',
            icon: 'IoArrowUp',
            title: 'Earn & Upgrade',
            description: 'Collect rewards, upgrade towers, and mint rare NFT items.',
            order: 3,
          },
        ],
      },
    },
  });

  const roadmapContent = await prisma.content.upsert({
    where: { type: 'ROADMAP' },
    update: {},
    create: {
      type: 'ROADMAP',
      data: {
        title: 'Roadmap',
        subtitle: 'Our journey to build the ultimate tower defense game on Monad',
        items: [
          {
            id: 'phase1',
            phase: 'Phase 1',
            quarter: 'Q1 2025',
            title: 'Foundation',
            status: 'completed',
            items: [
              'Concept & Design',
              'Smart Contract Development',
              'Website & dApp UI',
              'Testnet Deployment',
            ],
            order: 0,
          },
          {
            id: 'phase2',
            phase: 'Phase 2',
            quarter: 'Q2 2025',
            title: 'Alpha Launch',
            status: 'in-progress',
            items: [
              'Mainnet Deployment',
              'Alpha Testing',
              'NFT Marketplace',
              'Community Building',
            ],
            order: 1,
          },
          {
            id: 'phase3',
            phase: 'Phase 3',
            quarter: 'Q3 2025',
            title: 'Beta & Expansion',
            status: 'upcoming',
            items: [
              'Public Beta Launch',
              'PvP Mode',
              'Tournaments',
              'Mobile Version',
            ],
            order: 2,
          },
          {
            id: 'phase4',
            phase: 'Phase 4',
            quarter: 'Q4 2025',
            title: 'Full Release',
            status: 'upcoming',
            items: [
              'Official Launch',
              'Cross-Chain Integration',
              'DAO Governance',
              'Metaverse Integration',
            ],
            order: 3,
          },
        ],
      },
    },
  });

  const faqContent = await prisma.content.upsert({
    where: { type: 'FAQ' },
    update: {},
    create: {
      type: 'FAQ',
      data: {
        title: 'FAQ',
        subtitle: 'Got questions? We\'ve got answers!',
        items: [
          {
            id: 'faq1',
            question: 'What is Monquest?',
            answer: 'Monquest is a pixel-art tower defense game built on Monad blockchain. Players build towers, defend against monsters, and earn NFT rewards while enjoying strategic gameplay.',
            order: 0,
          },
          {
            id: 'faq2',
            question: 'How do I start playing?',
            answer: 'Simply connect your Web3 wallet (MetaMask, WalletConnect, etc.), mint your starter pack, and begin your adventure! The game guides you through the basics.',
            order: 1,
          },
          {
            id: 'faq3',
            question: 'What blockchain does Monquest use?',
            answer: 'Monquest is built on Monad, a high-performance EVM-compatible blockchain. This ensures fast transactions and low fees for the best gaming experience.',
            order: 2,
          },
          {
            id: 'faq4',
            question: 'Can I earn money playing Monquest?',
            answer: 'Yes! Monquest features play-to-earn mechanics. You can earn rewards, collect rare NFTs, and trade items on the marketplace. Top players also receive tournament prizes.',
            order: 3,
          },
          {
            id: 'faq5',
            question: 'Are the NFTs tradeable?',
            answer: 'Absolutely! All towers, heroes, and items are NFTs that you truly own. Trade them on our marketplace or any compatible NFT platform.',
            order: 4,
          },
          {
            id: 'faq6',
            question: 'Is there a mobile version?',
            answer: 'Mobile version is planned for Phase 3 (Q3 2025). Currently, Monquest is available as a web-based dApp accessible from desktop browsers.',
            order: 5,
          },
        ],
      },
    },
  });

  console.log('✅ Created content:', heroContent.type, featuresContent.type, howItWorksContent.type, roadmapContent.type, faqContent.type);

  // Create theme presets
  const defaultPreset = await prisma.themePreset.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default',
      slug: 'default',
      colors: {
        primary: '#4ADE80',
        secondary: '#60A5FA',
        accent: '#FB923C',
        dark: '#1E293B',
        darker: '#0F172A',
        light: '#F1F5F9',
      },
      isDefault: true,
      isSystem: true,
    },
  });

  const cyberpunkPreset = await prisma.themePreset.upsert({
    where: { slug: 'cyberpunk' },
    update: {},
    create: {
      name: 'Cyberpunk',
      slug: 'cyberpunk',
      colors: {
        primary: '#FF0080',
        secondary: '#00FFFF',
        accent: '#FFFF00',
        dark: '#0D001A',
        darker: '#050008',
        light: '#E0E0FF',
      },
      isDefault: false,
      isSystem: true,
    },
  });

  const oceanPreset = await prisma.themePreset.upsert({
    where: { slug: 'ocean' },
    update: {},
    create: {
      name: 'Ocean',
      slug: 'ocean',
      colors: {
        primary: '#06B6D4',
        secondary: '#3B82F6',
        accent: '#10B981',
        dark: '#0C4A6E',
        darker: '#082F49',
        light: '#E0F2FE',
      },
      isDefault: false,
      isSystem: true,
    },
  });

  const sunsetPreset = await prisma.themePreset.upsert({
    where: { slug: 'sunset' },
    update: {},
    create: {
      name: 'Sunset',
      slug: 'sunset',
      colors: {
        primary: '#F59E0B',
        secondary: '#EF4444',
        accent: '#EC4899',
        dark: '#451A03',
        darker: '#1C0A00',
        light: '#FEF3C7',
      },
      isDefault: false,
      isSystem: true,
    },
  });

  console.log('✅ Created theme presets:', defaultPreset.name, cyberpunkPreset.name, oceanPreset.name, sunsetPreset.name);

  // Create settings for active theme
  const activeThemeSetting = await prisma.settings.upsert({
    where: { key: 'active_theme_preset' },
    update: {},
    create: {
      key: 'active_theme_preset',
      value: 'default',
      category: 'appearance',
      description: 'Currently active theme preset slug',
    },
  });

  console.log('✅ Created settings:', activeThemeSetting.key);

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
