const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'ester@contabilidade.com';
  const password = '123456';

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('Usuária Ester já existe.');
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: 'Ester Contabilidade',
      email,
      passwordHash: hash,   // 👈 AQUI é passwordHash
      role: 'ACCOUNTANT',
    },
  });

  console.log('Usuária Ester criada com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
