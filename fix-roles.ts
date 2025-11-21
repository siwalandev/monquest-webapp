import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRoles() {
  console.log('🔧 Fixing role permissions...\n');
  
  // Fix User role - no admin access
  await prisma.role.update({
    where: { slug: 'user' },
    data: { permissions: [] }
  });
  console.log('✅ Fixed User role (no admin access)');
  
  // Delete testod role if exists and not system
  try {
    const testodRole = await prisma.role.findUnique({
      where: { slug: 'testod' }
    });
    
    if (testodRole && !testodRole.isSystem) {
      await prisma.role.delete({
        where: { slug: 'testod' }
      });
      console.log('✅ Deleted testod role');
    }
  } catch (e) {
    console.log('ℹ️  testod role not found or already deleted');
  }
  
  await prisma.$disconnect();
  console.log('\n✨ Done!');
}

fixRoles();
