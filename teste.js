const { PrismaClient } = require("@prisma/client");

const prisma = require("./prismaClient");

async function main() {
  const usuarios = await prisma.usuario.findMany();

  console.log(usuarios);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });