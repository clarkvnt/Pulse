import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default columns
  const defaultColumns = [
    { id: 'col-todo', title: 'To Do', color: '#ef4444', order: 0 },
    { id: 'col-in-progress', title: 'In Progress', color: '#f59e0b', order: 1 },
    { id: 'col-done', title: 'Done', color: '#10b981', order: 2 },
  ];

  for (const column of defaultColumns) {
    await prisma.column.upsert({
      where: { id: column.id },
      update: {},
      create: column,
    });
  }

  // Create sample team members
  const members = [
    {
      name: 'Sarah Johnson',
      role: 'Product Designer',
      email: 'sarah.j@company.com',
      initials: 'SJ',
      tasksCompleted: 24,
      avatar: 'bg-slate-900',
      status: 'Active',
    },
    {
      name: 'Michael Chen',
      role: 'Frontend Developer',
      email: 'michael.c@company.com',
      initials: 'MC',
      tasksCompleted: 18,
      avatar: 'bg-slate-700',
      status: 'Active',
    },
    {
      name: 'Emily Davis',
      role: 'Backend Developer',
      email: 'emily.d@company.com',
      initials: 'ED',
      tasksCompleted: 31,
      avatar: 'bg-slate-600',
      status: 'Active',
    },
  ];

  for (const member of members) {
    await prisma.teamMember.upsert({
      where: { email: member.email },
      update: {},
      create: member,
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
