import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Checking database data...\n');

  // Check roles
  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true,
      permissions: true,
      _count: {
        select: { users: true }
      }
    }
  });
  
  console.log('🔐 Roles:');
  roles.forEach(role => {
    console.log(`  - ${role.name} (${role._count.users} users)`);
    console.log(`    Permissions: ${JSON.parse(role.permissions as string).length} items`);
  });

  // Check users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      role: {
        select: { name: true }
      }
    }
  });
  
  console.log('\n👥 Users:');
  users.forEach(user => {
    console.log(`  - ${user.email} (${user.name}) - Role: ${user.role.name} - Status: ${user.status}`);
  });

  // Check API keys
  const apiKeys = await prisma.apiKey.findMany({
    select: {
      id: true,
      name: true,
      status: true
    }
  });
  
  console.log('\n🔑 API Keys:');
  apiKeys.forEach(key => {
    console.log(`  - ${key.name} - Status: ${key.status}`);
  });

  // Check content
  const contents = await prisma.content.findMany({
    select: {
      id: true,
      type: true,
      data: true
    }
  });
  
  console.log('\n📄 Content:');
  contents.forEach(content => {
    const data = JSON.parse(content.data as string);
    console.log(`  - ${content.type}`);
    if (content.type === 'HERO' && data.title) {
      console.log(`    Title: ${data.title}`);
    } else if (content.type === 'FEATURES' && data.features) {
      console.log(`    Features count: ${data.features.length}`);
    } else if (content.type === 'HOW_IT_WORKS' && data.steps) {
      console.log(`    Steps count: ${data.steps.length}`);
    }
  });

  console.log('\n✅ Database check completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
