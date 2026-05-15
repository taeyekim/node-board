export const postCategories = ["notice", "free", "question", "info"];

export function validatePostPayload(payload) {
  const title = String(payload?.title || "").trim();
  const content = String(payload?.content || "").trim();
  const category = String(payload?.category || "free").trim();
  const errors = {};

  if (!title) {
    errors.title = "제목을 입력하세요.";
  } else if (title.length > 200) {
    errors.title = "제목은 200자 이하로 입력하세요.";
  }

  if (!content) {
    errors.content = "내용을 입력하세요.";
  }

  if (!postCategories.includes(category)) {
    errors.category = "올바른 카테고리를 선택하세요.";
  }

  return {
    data: { title, content, category },
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

export function validateCommentPayload(payload) {
  const content = String(payload?.content || "").trim();
  const errors = {};

  if (!content) {
    errors.content = "댓글 내용을 입력하세요.";
  } else if (content.length > 1000) {
    errors.content = "댓글은 1000자 이하로 입력하세요.";
  }

  return {
    data: { content },
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

export function validateRegisterPayload(payload) {
  const email = String(payload?.email || "").trim().toLowerCase();
  const name = String(payload?.name || "").trim();
  const password = String(payload?.password || "");
  const errors = {};

  if (!email) {
    errors.email = "이메일을 입력하세요.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "올바른 이메일 형식이 아닙니다.";
  }

  if (!name) {
    errors.name = "이름을 입력하세요.";
  } else if (name.length > 40) {
    errors.name = "이름은 40자 이하로 입력하세요.";
  }

  if (!password) {
    errors.password = "비밀번호를 입력하세요.";
  } else if (password.length < 6) {
    errors.password = "비밀번호는 6자 이상이어야 합니다.";
  }

  return {
    data: { email, name, password },
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

export function validateLoginPayload(payload) {
  const email = String(payload?.email || "").trim().toLowerCase();
  const password = String(payload?.password || "");
  const errors = {};

  if (!email) {
    errors.email = "이메일을 입력하세요.";
  }

  if (!password) {
    errors.password = "비밀번호를 입력하세요.";
  }

  return {
    data: { email, password },
    errors,
    valid: Object.keys(errors).length === 0,
  };
}
