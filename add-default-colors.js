// Script to add default colors to existing content items
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDefaultColors() {
  try {
    console.log('🔍 Checking existing content...');

    // Get FAQ content
    const faqContent = await prisma.content.findUnique({
      where: { type: 'FAQ' }
    });

    if (faqContent) {
      const faqData = faqContent.data;
      if (faqData.items && Array.isArray(faqData.items)) {
        let updated = false;
        faqData.items = faqData.items.map(item => {
          if (!item.color) {
            updated = true;
            return { ...item, color: 'primary' }; // Default FAQ to primary
          }
          return item;
        });

        if (updated) {
          await prisma.content.update({
            where: { type: 'FAQ' },
            data: { data: faqData }
          });
          console.log('✅ Updated FAQ items with default primary color');
        } else {
          console.log('ℹ️ FAQ items already have colors');
        }
      }
    }

    // Get How It Works content
    const howItWorksContent = await prisma.content.findUnique({
      where: { type: 'HOW_IT_WORKS' }
    });

    if (howItWorksContent) {
      const howItWorksData = howItWorksContent.data;
      if (howItWorksData.steps && Array.isArray(howItWorksData.steps)) {
        let updated = false;
        howItWorksData.steps = howItWorksData.steps.map(step => {
          if (!step.color) {
            updated = true;
            return { ...step, color: 'secondary' }; // Default How It Works to secondary
          }
          return step;
        });

        if (updated) {
          await prisma.content.update({
            where: { type: 'HOW_IT_WORKS' },
            data: { data: howItWorksData }
          });
          console.log('✅ Updated How It Works steps with default secondary color');
        } else {
          console.log('ℹ️ How It Works steps already have colors');
        }
      }
    }

    // Get Roadmap content
    const roadmapContent = await prisma.content.findUnique({
      where: { type: 'ROADMAP' }
    });

    if (roadmapContent) {
      const roadmapData = roadmapContent.data;
      if (roadmapData.items && Array.isArray(roadmapData.items)) {
        let updated = false;
        roadmapData.items = roadmapData.items.map(item => {
          if (!item.color) {
            updated = true;
            return { ...item, color: 'primary' }; // Default Roadmap to primary
          }
          return item;
        });

        if (updated) {
          await prisma.content.update({
            where: { type: 'ROADMAP' },
            data: { data: roadmapData }
          });
          console.log('✅ Updated Roadmap items with default primary color');
        } else {
          console.log('ℹ️ Roadmap items already have colors');
        }
      }
    }

    // Get Features content
    const featuresContent = await prisma.content.findUnique({
      where: { type: 'FEATURES' }
    });

    if (featuresContent) {
      const featuresData = featuresContent.data;
      if (featuresData.items && Array.isArray(featuresData.items)) {
        let updated = false;
        featuresData.items = featuresData.items.map(item => {
          if (!item.color) {
            updated = true;
            return { ...item, color: 'primary' }; // Default Features to primary
          }
          return item;
        });

        if (updated) {
          await prisma.content.update({
            where: { type: 'FEATURES' },
            data: { data: featuresData }
          });
          console.log('✅ Updated Features items with default primary color');
        } else {
          console.log('ℹ️ Features items already have colors');
        }
      }
    }

    console.log('\n✨ Default colors added successfully!');
  } catch (error) {
    console.error('❌ Error adding default colors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDefaultColors();
