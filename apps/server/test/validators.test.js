import assert from "node:assert/strict";
import test from "node:test";
import { validatePostPayload } from "../src/validators.js";

test("validates a complete post payload", () => {
  const result = validatePostPayload({
    title: "첫 게시글",
    content: "내용입니다.",
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.data, {
    title: "첫 게시글",
    content: "내용입니다.",
  });
});

test("rejects blank fields", () => {
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
