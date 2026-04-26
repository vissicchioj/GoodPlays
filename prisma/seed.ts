import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@goodplays.dev" },
    update: {},
    create: {
      email: "demo@goodplays.dev",
      username: "jake_dev",
      image: "https://github.com/github.png",
    },
  });

  const game1 = await prisma.game.upsert({
    where: { igdbId: 1 },
    update: {},
    create: {
      igdbId: 1,
      slug: "elden-ring",
      title: "Elden Ring",
      summary: "A vast open-world action RPG.",
    },
  });

  const game2 = await prisma.game.upsert({
    where: { igdbId: 2 },
    update: {},
    create: {
      igdbId: 2,
      slug: "balatro",
      title: "Balatro",
      summary: "A poker-inspired roguelike deckbuilder.",
    },
  });

  await prisma.gameLog.upsert({
    where: {
      userId_gameId: {
        userId: user.id,
        gameId: game1.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      gameId: game1.id,
      status: "playing",
    },
  });

  await prisma.gameLog.upsert({
    where: {
      userId_gameId: {
        userId: user.id,
        gameId: game2.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      gameId: game2.id,
      status: "backlog",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });