import request from "supertest"
import app from "../src/app"

describe("Queue Creation", () => {

  test("AT-05 create queue success", async () => {

    const res = await request(app)
      .post("/api/staff/queue/create")
      .send({
        vn: "VN260305-0012",
        staffId: 7
      })

    expect(res.statusCode).toBe(200)

  })

  test("AT-06 missing VN", async () => {

   const res = await request(app)
     .post("/api/staff/queue/create")
     .send({
       staffId: 7
     })

   expect(res.statusCode).toBe(400)

 })
test("AT-07 missing staffId", async () => {
  const res = await request(app)
    .post("/api/staff/queue/create")
    .send({
      vn: "VN260305-0012"
    })

  expect(res.statusCode).toBe(400)
})

test("AT-08 duplicate queue", async () => {
  const res = await request(app)
    .post("/api/staff/queue/create")
    .send({
      vn: "VN260305-0001",
      staffId: 1
    })

  expect(res.statusCode).toBe(400)
})
})