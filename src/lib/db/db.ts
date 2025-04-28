import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

export default db
  // ... you will write your Prisma Client queries here


// db()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })