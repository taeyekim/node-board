export function validatePostPayload(payload) {
  const title = String(payload?.title || "").trim();
  const content = String(payload?.content || "").trim();
  const errors = {};

  if (!title) {
    errors.title = "제목을 입력하세요.";
  } else if (title.length > 200) {
    errors.title = "제목은 200자 이하로 입력하세요.";
  }

  if (!content) {
    errors.content = "내용을 입력하세요.";
  }

  return {
    data: { title, content },
    errors,
    valid: Object.keys(errors).length === 0,
  };
}
