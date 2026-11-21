import prisma from '../src/lib/prisma';

async function main() {
  console.log('🌱 Inicializando datos de prueba...');

  const user = await prisma.user.upsert({
    where: { email: 'admin@frojoltec.com' },
    update: {},
    create: {
      email: 'admin@frojoltec.com',
      name: 'Admin Frojoltec',
      role: 'ADMIN',
      posts: {
        create: [
          {
            title: 'Primer post en Vercel Postgres',
            content: 'Backend Express + Prisma configurado y funcionando exitosamente.',
            published: true,
          },
        ],
      },
    },
  });

  console.log('✅ Usuario inicial verificado/creado:', user.email);
}

main()
  .catch((e) => {
    console.error('Error al sembrar datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
