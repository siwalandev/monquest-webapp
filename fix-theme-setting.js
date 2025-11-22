const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixThemeSetting() {
  try {
    // Fix active_theme_preset to use proper JSON format
    await prisma.settings.upsert({
      where: { key: 'active_theme_preset' },
      update: { 
        value: { slug: 'default' }
      },
      create: {
        key: 'active_theme_preset',
        value: { slug: 'default' },
        category: 'appearance',
        description: 'Currently active theme preset slug',
      },
    });

    console.log('✅ Fixed active_theme_preset setting!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixThemeSetting();
