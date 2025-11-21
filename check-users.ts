import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('👥 Checking all users...\n');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: {
        select: {
          name: true,
          slug: true,
          permissions: true
        }
      },
      status: true
    }
  });

  users.forEach(user => {
    const perms = user.role.permissions as any;
    const hasPanelAccess = perms.includes('panel.access');
    
    console.log(`\n👤 ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role.name} (${user.role.slug})`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Panel Access: ${hasPanelAccess ? '✅ YES' : '❌ NO'}`);
    console.log(`   Permissions: ${perms.length}`);
  });

  await prisma.$disconnect();
}

checkUsers();
