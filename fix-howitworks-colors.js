const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColorToHowItWorks() {
  try {
    const content = await prisma.content.findUnique({
      where: { type: 'HOW_IT_WORKS' }
    });

    if (!content || !content.data || !content.data.steps) {
      console.log('No How It Works data found');
      return;
    }

    // Add color field to all steps
    const updatedSteps = content.data.steps.map(step => ({
      ...step,
      color: step.color || 'secondary' // Default to secondary if no color
    }));

    const updatedData = {
      ...content.data,
      steps: updatedSteps
    };

    await prisma.content.update({
      where: { type: 'HOW_IT_WORKS' },
      data: {
        data: updatedData
      }
    });

    console.log('✅ Successfully added secondary color to all How It Works steps!');
    console.log('\nUpdated steps:');
    updatedSteps.forEach((step, i) => {
      console.log(`${i + 1}. ${step.title} - Color: ${step.color}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addColorToHowItWorks();
