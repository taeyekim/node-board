import assert from "node:assert/strict";
import test from "node:test";
import { validateCommentPayload, validatePostPayload } from "../src/validators.js";

test("validates a complete post payload", () => {
  const result = validatePostPayload({
    title: "첫 게시글",
    content: "내용입니다.",
    category: "free",
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.data, {
    title: "첫 게시글",
    content: "내용입니다.",
    category: "free",
  });
});

test("uses free as the default post category", () => {
  const result = validatePostPayload({
    title: "첫 게시글",
    content: "내용입니다.",
  });

  assert.equal(result.valid, true);
  assert.equal(result.data.category, "free");
});

test("rejects blank post fields", () => {
  const result = validatePostPayload({ title: " ", content: "" });

  assert.equal(result.valid, false);
  assert.equal(result.errors.title, "제목을 입력하세요.");
  assert.equal(result.errors.content, "내용을 입력하세요.");
});

test("rejects titles longer than 200 characters", () => {
  const result = validatePostPayload({
    title: "a".repeat(201),
    content: "내용입니다.",
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.title, "제목은 200자 이하로 입력하세요.");
});

test("rejects invalid post categories", () => {
  const result = validatePostPayload({
    title: "첫 게시글",
    content: "내용입니다.",
    category: "unknown",
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.category, "올바른 카테고리를 선택하세요.");
});

test("validates comment payloads", () => {
  const result = validateCommentPayload({ content: "댓글입니다." });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.data, { content: "댓글입니다." });
});

test("rejects blank comments", () => {
  const result = validateCommentPayload({ content: " " });

  assert.equal(result.valid, false);
  assert.equal(result.errors.content, "댓글 내용을 입력하세요.");
});
