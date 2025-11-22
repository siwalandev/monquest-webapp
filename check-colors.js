const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFAQColors() {
  try {
    const faq = await prisma.content.findUnique({
      where: { type: 'FAQ' }
    });

    if (faq && faq.data && faq.data.items) {
      console.log('FAQ Items:');
      faq.data.items.forEach((item, i) => {
        console.log(`${i + 1}. ${item.question}`);
        console.log(`   Color: ${item.color || 'NONE (will default to secondary)'}`);
      });
    } else {
      console.log('No FAQ data found');
    }

    const features = await prisma.content.findUnique({
      where: { type: 'FEATURES' }
    });

    if (features && features.data && features.data.items) {
      console.log('\nFeatures Items (for comparison):');
      features.data.items.forEach((item, i) => {
        console.log(`${i + 1}. ${item.title}`);
        console.log(`   Color: ${item.color || 'NONE'}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFAQColors();
