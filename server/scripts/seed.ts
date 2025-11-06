import { seed } from "../../scripts/seed";

void seed()
  .then(() => {
    console.log("Server seed completed.");
  })
  .catch((error) => {
    console.error("Server seed failed:", error);
    process.exitCode = 1;
  });
