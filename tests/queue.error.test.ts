import request from "supertest"
import app from "../src/app"

describe("Queue Error Case", () => {

  test("call invalid queue", async () => {

    const res = await request(app)
      .post("/api/staff/queue/999/call")
      .send({ staffName: "doctor" })

    expect(res.statusCode).toBeGreaterThanOrEqual(400)

  })
test("AT-19 arrived without call", async () => {
  const res = await request(app)
    .post("/api/staff/queue/2/arrived")
    .send({
      staffName: "med"
    })

  expect(res.statusCode).toBe(200)
})

test("AT-20 complete without arrived", async () => {
  const res = await request(app)
    .post("/api/staff/queue/2/complete")
    .send({
      staffName: "med"
    })

  expect(res.statusCode).toBe(200)
})
})
