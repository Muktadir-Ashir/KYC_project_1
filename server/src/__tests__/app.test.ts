import request from "supertest";
import app from "../app";

describe("App routes", () => {
  it("returns health message on GET /", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "KYC API is running" });
  });
});
