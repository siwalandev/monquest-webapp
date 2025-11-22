const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColorToRoadmap() {
  try {
    const content = await prisma.content.findUnique({
      where: { type: 'ROADMAP' }
    });

    if (!content || !content.data || !content.data.items) {
      console.log('No Roadmap data found');
      return;
    }

    // Add color field to all items
    const updatedItems = content.data.items.map(item => ({
      ...item,
      color: item.color || 'primary' // Default to primary if no color
    }));

    const updatedData = {
      ...content.data,
      items: updatedItems
    };

    await prisma.content.update({
      where: { type: 'ROADMAP' },
      data: {
        data: updatedData
      }
    });

    console.log('✅ Successfully added primary color to all Roadmap items!');
    console.log('\nUpdated items:');
    updatedItems.forEach((item, i) => {
      console.log(`${i + 1}. ${item.title} (${item.phase}) - Color: ${item.color}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addColorToRoadmap();
