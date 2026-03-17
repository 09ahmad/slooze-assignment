import bcrypt from "bcryptjs";
import { PrismaClient, Role, Country } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Reset (so seeding is repeatable)
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  const nick = await prisma.user.create({
    data: {
      name: "Nick Fury",
      email: "nick@slooze.com",
      password: hash("admin123"),
      role: Role.ADMIN,
      country: Country.AMERICA,
    },
  });
  const marvel = await prisma.user.create({
    data: {
      name: "Captain Marvel",
      email: "marvel@slooze.com",
      password: hash("pass123"),
      role: Role.MANAGER,
      country: Country.INDIA,
    },
  });
  const america = await prisma.user.create({
    data: {
      name: "Captain America",
      email: "america@slooze.com",
      password: hash("pass123"),
      role: Role.MANAGER,
      country: Country.AMERICA,
    },
  });
  const thanos = await prisma.user.create({
    data: {
      name: "Thanos",
      email: "thanos@slooze.com",
      password: hash("pass123"),
      role: Role.MEMBER,
      country: Country.INDIA,
    },
  });
  const thor = await prisma.user.create({
    data: {
      name: "Thor",
      email: "thor@slooze.com",
      password: hash("pass123"),
      role: Role.MEMBER,
      country: Country.INDIA,
    },
  });
  const travis = await prisma.user.create({
    data: {
      name: "Travis",
      email: "travis@slooze.com",
      password: hash("pass123"),
      role: Role.MEMBER,
      country: Country.AMERICA,
    },
  });

  // Seed Payment Methods (so ADMIN/MANAGER checkout works out of the box)
  await prisma.paymentMethod.createMany({
    data: [
      {
        userId: nick.id,
        type: "card",
        details: "4242",
        isDefault: true,
      },
      {
        userId: marvel.id,
        type: "upi",
        details: "marvel@upi",
        isDefault: true,
      },
      {
        userId: america.id,
        type: "card",
        details: "1111",
        isDefault: true,
      },
      {
        userId: thanos.id,
        type: "upi",
        details: "thanos@upi",
        isDefault: true,
      },
      {
        userId: thor.id,
        type: "upi",
        details: "thor@upi",
        isDefault: true,
      },
      {
        userId: travis.id,
        type: "netbanking",
        details: "travis-bank",
        isDefault: true,
      },
    ],
  });

  // Seed Restaurants + Menu Items
  const indiaRest = await prisma.restaurant.create({
    data: {
      name: "Spice Garden",
      country: Country.INDIA,
      menuItems: {
        create: [
          {
            name: "Butter Chicken",
            price: 250,
            description: "Creamy tomato curry",
          },
          {
            name: "Paneer Tikka",
            price: 180,
            description: "Grilled cottage cheese",
          },
          { name: "Biryani", price: 300, description: "Fragrant rice dish" },
        ],
      },
    },
  });

  const americaRest = await prisma.restaurant.create({
    data: {
      name: "Burger Palace",
      country: Country.AMERICA,
      menuItems: {
        create: [
          {
            name: "Classic Burger",
            price: 12,
            description: "Beef patty with lettuce",
          },
          {
            name: "Cheese Fries",
            price: 6,
            description: "Crispy fries with cheese",
          },
          { name: "Milkshake", price: 5, description: "Thick creamy shake" },
        ],
      },
    },
  });

  console.log("Seeded successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
