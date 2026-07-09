import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { User } from "../../models/User.js";

describe("Auth routes", () => {
  describe("POST /api/auth/register", () => {
    it("creates a new user and returns an access token", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Jane Student",
        email: "jane@example.com",
        password: "SecurePass123!",
      });

      expect(res.status).toBe(201);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe("jane@example.com");
      expect(res.body.user.passwordHash).toBeUndefined(); // toSafeJSON must strip it
    });

    it("rejects a duplicate email with 409", async () => {
      await request(app).post("/api/auth/register").send({
        name: "First",
        email: "dupe@example.com",
        password: "SecurePass123!",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Second",
        email: "dupe@example.com",
        password: "AnotherPass123!",
      });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe("EMAIL_TAKEN");
    });

    it("rejects a password under 8 characters", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Short Pass",
        email: "short@example.com",
        password: "abc",
      });

      expect(res.status).toBe(422);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with correct credentials", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Login Test",
        email: "login@example.com",
        password: "CorrectPass123!",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "CorrectPass123!",
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });

    it("rejects a wrong password with 401 and a generic message", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Wrong Pass Test",
        email: "wrongpass@example.com",
        password: "CorrectPass123!",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "wrongpass@example.com",
        password: "IncorrectPass123!",
      });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("INVALID_CREDENTIALS");
    });

    it("rejects a non-existent email with the same generic error", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "doesnotexist@example.com",
        password: "SomePassword123!",
      });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe("INVALID_CREDENTIALS");
      // deliberately checking this is the SAME error/code as a wrong
      // password above — confirms no user-enumeration leak via message
    });
  });

  describe("GET /api/auth/me", () => {
    it("rejects requests with no token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("returns the current user when authenticated", async () => {
      const registerRes = await request(app).post("/api/auth/register").send({
        name: "Me Test",
        email: "metest@example.com",
        password: "SomePassword123!",
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${registerRes.body.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("metest@example.com");
    });
  });

  describe("POST /api/auth/forgot-password", () => {
    it("returns the same generic message whether or not the email exists", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Forgot Test",
        email: "forgottest@example.com",
        password: "SomePassword123!",
      });

      const resExisting = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "forgottest@example.com" });

      const resMissing = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "neverexisted@example.com" });

      expect(resExisting.status).toBe(200);
      expect(resMissing.status).toBe(200);
      expect(resExisting.body.message).toBe(resMissing.body.message);
    });

    it("actually sets a passwordResetToken on the real user", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Reset Token Test",
        email: "resettoken@example.com",
        password: "SomePassword123!",
      });

      await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "resettoken@example.com" });

      const user = await User.findOne({ email: "resettoken@example.com" }).select(
        "+passwordResetToken +passwordResetExpires"
      );
      expect(user.passwordResetToken).toBeTruthy();
      expect(user.passwordResetExpires).toBeTruthy();
    });
  });
});