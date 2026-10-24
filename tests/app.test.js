import request from "supertest";
import app from "../src/app.js";

describe("CRM API", () => {
  test("returns 404 for an unknown route", async () => {
    const response = await request(app).get("/this-route-does-not-exist");

    expect(response.status).toBe(404);
  });
});