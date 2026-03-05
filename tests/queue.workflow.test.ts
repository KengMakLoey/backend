import request from "supertest"
import app from "../src/app"

describe("Queue Workflow", () => {

    test("AT-09 get queues", async () => {
  const res = await request(app)
    .get("/api/staff/queues/7")

  expect(res.statusCode).toBe(200)
})

test("AT-10 invalid department", async () => {
  const res = await request(app)
    .get("/api/staff/queues/999")

  expect(res.statusCode).toBe(200)
  expect(res.body).toEqual([])
})

  test("AT-11 call queue", async () => {

    const res = await request(app)
      .post("/api/staff/queue/1/call")
      .send({ staffName: "doctor" })

    expect(res.statusCode).toBe(200)

  })
 test("AT-12 arrived", async () => {

   const res = await request(app)
     .post("/api/staff/queue/1/arrived")
     .send({ staffName: "doctor" })

   expect(res.body.success).toBe(true)

 })

 test("AT-13 complete queue", async () => {

   const res = await request(app)
     .post("/api/staff/queue/1/complete")
     .send({ staffName: "doctor" })

   expect(res.body.success).toBe(true)

 })
test("AT-14 skip queue", async () => {
  const res = await request(app)
    .post("/api/staff/queue/1/skip")
    .send({
      staffName: "med"
    })

  expect(res.statusCode).toBe(200)
})

test("AT-15 recall queue", async () => {
  const res = await request(app)
    .post("/api/staff/queue/1/recall")
    .send({ staffName: "med" })

  expect(res.statusCode).toBe(200)
})

})