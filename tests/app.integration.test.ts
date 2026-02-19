import request from "supertest";
import app from "../src/app.js";

describe("Integration Test", () => {

  test("GET /api/health should return ok", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

});
