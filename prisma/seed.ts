import { prisma } from '../src/lib/prisma';

async function main() {
  const email = 'ester@contabilidade.com';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('Usuária Ester já existe. Nada a fazer.');
    return;
  }

  // senha em texto puro, igual vamos comparar no login
  const passwordHash = 'senha123';

  await prisma.user.create({
    data: {
      name: 'Ester',
      email,
      passwordHash,
      role: 'ACCOUNTANT',
    },
  });

  console.log('Usuária Ester criada com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
