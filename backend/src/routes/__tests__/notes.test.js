import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import { createTestUser, createTestSubject, authHeader } from "../../test/helpers.js";

describe("Notes routes", () => {
  let user, token, subject;

  beforeEach(async () => {
    const created = await createTestUser();
    user = created.user;
    token = created.accessToken;
    subject = await createTestSubject(user._id);
  });

  describe("POST /api/notes", () => {
    it("creates a note with a default empty block", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: subject._id.toString(), title: "My First Note" });

      expect(res.status).toBe(201);
      expect(res.body.note.title).toBe("My First Note");
      expect(res.body.note.blocks).toHaveLength(1);
      expect(res.body.note.blocks[0].type).toBe("p");
    });

    it("rejects a subjectId belonging to a different user", async () => {
      const { user: otherUser } = await createTestUser();
      const otherSubject = await createTestSubject(otherUser._id);

      const res = await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: otherSubject._id.toString(), title: "Sneaky Note" });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("NOT_FOUND");
    });

    it("rejects a malformed subjectId", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: "not-a-valid-id", title: "Bad ID Note" });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe("INVALID_ID");
    });

    it("requires authentication", async () => {
      const res = await request(app)
        .post("/api/notes")
        .send({ subjectId: subject._id.toString(), title: "No Auth Note" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/notes", () => {
    it("only returns the requesting user's own notes", async () => {
      await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: subject._id.toString(), title: "Mine" });

      const { user: otherUser, accessToken: otherToken } = await createTestUser();
      const otherSubject = await createTestSubject(otherUser._id);
      await request(app)
        .post("/api/notes")
        .set(authHeader(otherToken))
        .send({ subjectId: otherSubject._id.toString(), title: "Not Mine" });

      const res = await request(app).get("/api/notes").set(authHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.notes).toHaveLength(1);
      expect(res.body.notes[0].title).toBe("Mine");
    });

    it("filters by subjectId", async () => {
      const subject2 = await createTestSubject(user._id, { name: "Second Subject" });

      await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: subject._id.toString(), title: "In Subject 1" });
      await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: subject2._id.toString(), title: "In Subject 2" });

      const res = await request(app)
        .get(`/api/notes?subjectId=${subject._id}`)
        .set(authHeader(token));

      expect(res.body.notes).toHaveLength(1);
      expect(res.body.notes[0].title).toBe("In Subject 1");
    });
  });

  describe("GET /api/notes/:id", () => {
    it("returns 404 for a note belonging to another user", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: subject._id.toString(), title: "Private Note" });

      const { accessToken: otherToken } = await createTestUser();

      const res = await request(app)
        .get(`/api/notes/${createRes.body.note._id}`)
        .set(authHeader(otherToken));

      expect(res.status).toBe(404);
    });

    it("returns 400 for a malformed id", async () => {
      const res = await request(app)
        .get("/api/notes/not-an-id")
        .set(authHeader(token));

      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/notes/:id", () => {
    it("updates title and blocks", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: subject._id.toString(), title: "Original Title" });

      const res = await request(app)
        .patch(`/api/notes/${createRes.body.note._id}`)
        .set(authHeader(token))
        .send({
          title: "Updated Title",
          blocks: [{ id: "b0", type: "h1", text: "New heading" }],
        });

      expect(res.status).toBe(200);
      expect(res.body.note.title).toBe("Updated Title");
      expect(res.body.note.blocks[0].type).toBe("h1");
    });

    it("cannot update another user's note", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: subject._id.toString(), title: "Not Yours" });

      const { accessToken: otherToken } = await createTestUser();

      const res = await request(app)
        .patch(`/api/notes/${createRes.body.note._id}`)
        .set(authHeader(otherToken))
        .send({ title: "Hijacked" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("deletes an owned note", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: subject._id.toString(), title: "To Delete" });

      const deleteRes = await request(app)
        .delete(`/api/notes/${createRes.body.note._id}`)
        .set(authHeader(token));

      expect(deleteRes.status).toBe(204);

      const getRes = await request(app)
        .get(`/api/notes/${createRes.body.note._id}`)
        .set(authHeader(token));
      expect(getRes.status).toBe(404);
    });

    it("cannot delete another user's note", async () => {
      const createRes = await request(app)
        .post("/api/notes")
        .set(authHeader(token))
        .send({ subjectId: subject._id.toString(), title: "Protected" });

      const { accessToken: otherToken } = await createTestUser();

      const res = await request(app)
        .delete(`/api/notes/${createRes.body.note._id}`)
        .set(authHeader(otherToken));

      expect(res.status).toBe(404);
    });
  });
});