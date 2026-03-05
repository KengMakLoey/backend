import request from "supertest"
import app from "../src/app"

describe("Authentication API", () => {

  test("AT-01 login success", async () => {

    const res = await request(app)
      .post("/api/staff/login")
      .send({
        username: "med",
        password: "med123"
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)

  })

  test("AT-02 wrong password", async () => {

    const res = await request(app)
      .post("/api/staff/login")
      .send({
        username: "med",
        password: "wrong"
      })

    expect(res.statusCode).toBe(401)

  })

  test("AT-03 missing username", async () => {

    const res = await request(app)
      .post("/api/staff/login")
      .send({
        password: "med123"
      })

    expect(res.statusCode).toBe(400)

  })

  test("AT-04 missing password", async () => {
  const res = await request(app)
    .post("/api/staff/login")
    .send({
      username: "med"
    })

  expect(res.statusCode).toBe(400)
})

})