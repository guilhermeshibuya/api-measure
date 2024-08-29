import { prisma } from '../src/lib/prisma'

async function main() {
  await prisma.customer.createMany({
    data: [
      {
        customer_code: 'a17d5170-c07a-40e0-9cdf-05e1690f0685',
        name: 'Nettie Harding',
      },
      {
        customer_code: '62fc521a-f215-47df-bb12-bd87f01b4409',
        name: 'Nora Cross',
      },
    ],
  })
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => await prisma.$disconnect)
