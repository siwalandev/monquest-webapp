const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColorToFAQ() {
  try {
    const faq = await prisma.content.findUnique({
      where: { type: 'FAQ' }
    });

    if (!faq || !faq.data || !faq.data.items) {
      console.log('No FAQ data found');
      return;
    }

    // Add color field to all FAQ items
    const updatedItems = faq.data.items.map(item => ({
      ...item,
      color: item.color || 'primary' // Default to primary if no color
    }));

    const updatedData = {
      ...faq.data,
      items: updatedItems
    };

    await prisma.content.update({
      where: { type: 'FAQ' },
      data: {
        data: updatedData
      }
    });

    console.log('✅ Successfully added primary color to all FAQ items!');
    console.log('\nUpdated FAQ items:');
    updatedItems.forEach((item, i) => {
      console.log(`${i + 1}. ${item.question} - Color: ${item.color}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addColorToFAQ();
