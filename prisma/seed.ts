import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample project
  const project1 = await prisma.project.create({
    data: {
      name: 'Persoonlijke Ontwikkeling',
      goals: {
        create: [
          {
            name: 'Gezondheid & Fitness',
            tasks: {
              create: [
                {
                  name: 'Dagelijks 30 minuten sporten',
                  urgency: 'HOOG',
                  todaysFocus: true,
                  completed: false,
                },
                {
                  name: '2 liter water per dag drinken',
                  urgency: 'MIDDEN',
                  todaysFocus: true,
                  completed: false,
                },
                {
                  name: 'Wekelijkse yoga sessie',
                  urgency: 'LAAG',
                  todaysFocus: false,
                  completed: false,
                },
              ],
            },
          },
          {
            name: 'Leren & Groei',
            tasks: {
              create: [
                {
                  name: 'TypeScript cursus afmaken',
                  urgency: 'HOOG',
                  todaysFocus: true,
                  completed: false,
                },
                {
                  name: 'Boek lezen: Atomic Habits',
                  urgency: 'MIDDEN',
                  todaysFocus: false,
                  completed: true,
                  completedAt: new Date('2026-02-05'),
                },
              ],
            },
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Werk Projecten',
      goals: {
        create: [
          {
            name: 'FocusFlow Backend',
            tasks: {
              create: [
                {
                  name: 'API endpoints implementeren',
                  urgency: 'HOOG',
                  todaysFocus: true,
                  completed: false,
                },
                {
                  name: 'Database schema ontwerpen',
                  urgency: 'HOOG',
                  todaysFocus: false,
                  completed: true,
                  completedAt: new Date(),
                },
                {
                  name: 'Documentatie schrijven',
                  urgency: 'MIDDEN',
                  todaysFocus: false,
                  completed: false,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Created projects: ${project1.name}, ${project2.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
