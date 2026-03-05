import request from "supertest"
import app from "../src/app"

describe("Patient Queue", () => {

  test("AT-16 get queue by VN", async () => {

    const res = await request(app)
      .get("/api/queue/VN260305-0001")

    expect(res.statusCode).toBe(200)

  })
test("AT-17 invalid VN", async () => {

   const res = await request(app)
     .get("/api/queue/VN000000")

   expect(res.statusCode).toBe(404)

 })
})