import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPermissions() {
  console.log('🔍 Checking role permissions...\n');
  
  const roles = await prisma.role.findMany({
    select: {
      name: true,
      slug: true,
      permissions: true,
      _count: {
        select: {
          users: true
        }
      }
    }
  });

  roles.forEach(role => {
    console.log(`\n📋 ${role.name} (${role.slug})`);
    console.log(`   Users: ${role._count.users}`);
    console.log(`   Permissions (${(role.permissions as any).length}):`);
    
    const perms = role.permissions as any;
    const hasPanelAccess = perms.includes('panel.access');
    
    console.log(`   ✓ panel.access: ${hasPanelAccess ? '✅ YES' : '❌ NO'}`);
    
    if (perms.length > 0) {
      perms.forEach((p: string) => {
        if (p !== 'panel.access') {
          console.log(`     - ${p}`);
        }
      });
    }
  });

  await prisma.$disconnect();
}

checkPermissions();
