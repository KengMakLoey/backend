import { execSync } from "child_process"
import { pool } from "../src/config/database"

afterAll(async () => {
  await pool.end()
})
beforeAll(() => {
  console.log("🌱 Running seed before tests...")
  execSync("pnpm run seed", { stdio: "inherit" })
})