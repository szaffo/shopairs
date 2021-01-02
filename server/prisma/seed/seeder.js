const { PrismaClient } = require("@prisma/client");
const util = require("util");

const EMAIL_1 = 'jozsika88@citromail.hu';
const EMAIL_2 = "t@eszter.hu";
const EMAIL_3 = "mpisti@mail.hu";

(async () => {
  const db = new PrismaClient();
  await db.item.deleteMany();
  await db.list.deleteMany();
  await db.pair.deleteMany();
  await db.user.deleteMany();
  
  await db.user.create({
    data: {
      name: "Szingli Jóska",
      email: EMAIL_1,
    },
  });

  await db.pair.create({
    data: {
      creator: {
        create: {
          name: "Minta Pista",
          email: EMAIL_3,
        },
      },
      joinner: {
        create: {
          name: "T.Eszter",
          email: EMAIL_2,
        },
      },
      lists: {
        create: [
          {
            name: "reggelire",
            items: {
              create: [
                { name: "alma", quantity: 5 },
                { name: "vaj" },
                { name: "kenyér" },
              ],
            },
          },
          {
            name: "szülinapi buli",
            items: {
              create: [
                { name: "torta" },
                { name: "papír pohár", quantity: 12 },
                { name: "innivaló" },
                { name: "ajándék" },
              ],
            },
          },
        ],
      },
    },
  });

  const pairs = await db.pair.findMany({
    include: {
      creator: true,
      joinner: true,
      lists: {
        include: {
          items: {
            select: {
              name: true,
              quantity: true
            }
          }
        }
      },
    }
  })

  db.$disconnect();
  console.log('\nSeeding done')
  console.log('\n\Current state of the database\n')
  console.log(util.inspect(pairs, false, null, true /* enable colors */));
  console.log(EMAIL_1)
  console.log(EMAIL_2)
  console.log(EMAIL_3)
  console.log()
})()
