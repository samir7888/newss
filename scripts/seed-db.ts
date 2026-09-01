import { closeDatabase } from "../lib/db";
import { seedDatabase } from "../lib/db/seed";

async function main() {
  await seedDatabase();
  console.log("Database seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => closeDatabase());
