import { spawn, spawnSync } from "node:child_process";
import { chromium } from "playwright";

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const children = [];

function cleanEnv(extra = {}) {
  const env = {
    Path: process.env.Path || process.env.PATH || "",
    SystemRoot: process.env.SystemRoot || "C:\\Windows",
    TEMP: process.env.TEMP || process.env.TMP || ".",
    TMP: process.env.TMP || process.env.TEMP || ".",
    USERPROFILE: process.env.USERPROFILE || "",
    APPDATA: process.env.APPDATA || "",
    LOCALAPPDATA: process.env.LOCALAPPDATA || "",
  };

  return { ...env, ...extra };
}

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd || process.cwd(),
    env: cleanEnv(options.env),
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  child.stdout.on("data", (data) => process.stdout.write(data));
  child.stderr.on("data", (data) => process.stderr.write(data));
  children.push(child);
  return child;
}

async function waitForUrl(url, timeoutMs = 30_000) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError || new Error(`${url} was not ready`);
}

async function expectVisible(locator, label) {
  await locator.waitFor({ state: "visible", timeout: 5_000 }).catch((error) => {
    throw new Error(`Expected visible: ${label}. ${error.message}`);
  });
}

async function expectCount(locator, count, label) {
  const actual = await locator.count();
  if (actual !== count) {
    throw new Error(`Expected ${label} count ${count}, got ${actual}`);
  }
}

async function expectHidden(locator, label) {
  await locator.waitFor({ state: "hidden", timeout: 5_000 }).catch((error) => {
    throw new Error(`Expected hidden: ${label}. ${error.message}`);
  });
}

function cleanup() {
  for (const child of children.reverse()) {
    if (!child.killed) {
      if (isWindows && child.pid) {
        spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
          stdio: "ignore",
          env: cleanEnv(),
        });
      } else {
        child.kill();
      }
    }
  }
}

async function runBrowserFlow() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const suffix = Date.now();
  const email = `e2e-${suffix}@example.com`;
  const nickname = `이투이${suffix}`;
  const title = `E2E 게시글 ${suffix}`;
  const updatedTitle = `E2E 수정 ${suffix}`;

  try {
    await page.goto("http://localhost:5173");
    await expectVisible(page.getByRole("heading", { name: "자유게시판" }), "board heading");

    await page.getByRole("button", { name: "회원가입" }).click();
    await page.getByPlaceholder("이메일").fill(email);
    await page.getByPlaceholder("닉네임").fill(nickname);
    await page.getByPlaceholder("비밀번호").fill("password123");
    await page.getByRole("button", { name: "가입", exact: true }).click();
    await expectVisible(page.getByText(nickname), "registered nickname");

    await page.getByRole("button", { name: "글쓰기" }).click();
    await page.getByLabel("카테고리", { exact: true }).selectOption("question");
    await page.getByLabel("제목", { exact: true }).fill(title);
    await page.getByLabel("내용", { exact: true }).fill("검색과 댓글 검증을 위한 본문입니다.");
    await page.getByRole("button", { name: "저장", exact: true }).click();

    await expectVisible(page.getByRole("heading", { name: title }), "created post heading");
    await expectVisible(page.getByRole("article").getByText("질문"), "post category");
    await expectVisible(page.getByRole("article").getByText("조회 1"), "view count");

    await page.getByPlaceholder("댓글을 입력하세요").fill("첫 댓글입니다.");
    await page.getByRole("button", { name: "댓글 등록" }).click();
    await expectVisible(page.getByText("첫 댓글입니다."), "created comment");
    await expectVisible(page.getByText("댓글 [1]"), "comment count");

    await page.getByRole("button", { name: "수정", exact: true }).click();
    await page.getByLabel("제목", { exact: true }).fill(updatedTitle);
    await page.getByRole("button", { name: "저장", exact: true }).click();
    await expectVisible(page.getByRole("heading", { name: updatedTitle }), "updated post heading");

    await page.getByPlaceholder("제목 또는 내용을 검색하세요").fill(String(suffix));
    await expectVisible(page.getByRole("button", { name: new RegExp(updatedTitle) }), "search result");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "삭제", exact: true }).click();
    await expectHidden(page.getByText(updatedTitle), "deleted post text");
  } finally {
    await browser.close();
  }
}

process.on("exit", cleanup);
process.on("SIGINT", () => {
  cleanup();
  process.exit(130);
});

let exitCode = 0;

try {
  start(`"${process.execPath}"`, ["src/index.js"], { cwd: "apps/server" });
  start(npmCommand, ["--workspace", "apps/web", "run", "dev", "--", "--host", "127.0.0.1"]);
  await waitForUrl("http://localhost:3001/api/health");
  await waitForUrl("http://localhost:5173");
  await runBrowserFlow();
  console.log("E2E browser flow passed.");
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  cleanup();
  process.exit(exitCode);
}
