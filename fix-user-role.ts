import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserRole() {
  console.log('🔧 Fixing user role...\n');
  
  // Get all users
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  
  console.log('📋 Current users:');
  users.forEach(user => {
    console.log(`  - ${user.email} (${user.name}) - Role: ${user.role.name}`);
  });
  
  // Get Super Admin role
  const superAdminRole = await prisma.role.findUnique({
    where: { slug: 'super_admin' }
  });
  
  if (!superAdminRole) {
    console.error('❌ Super Admin role not found!');
    return;
  }
  
  // Update all non-admin users to Super Admin
  const nonAdminUsers = users.filter(u => u.role.slug !== 'super_admin');
  
  if (nonAdminUsers.length === 0) {
    console.log('\n✅ All users already have Super Admin role!');
    return;
  }
  
  console.log(`\n🔄 Updating ${nonAdminUsers.length} user(s) to Super Admin...`);
  
  for (const user of nonAdminUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { roleId: superAdminRole.id }
    });
    console.log(`  ✅ ${user.email} -> Super Admin`);
  }
  
  console.log('\n✅ Done! All users now have Super Admin role.');
  console.log('⚠️  Please logout and login again to refresh permissions.');
}

fixUserRole()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
