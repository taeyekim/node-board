import { useEffect, useMemo, useState } from "react";
import { createPost, deletePost, fetchPosts, updatePost } from "./api.js";

const emptyForm = { title: "", content: "" };

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("create");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedId) || null,
    [posts, selectedId],
  );

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    setError("");

    try {
      const nextPosts = await fetchPosts();
      setPosts(nextPosts);

      if (!selectedId && nextPosts.length > 0) {
        setSelectedId(nextPosts[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setMode("create");
    setSelectedId(null);
    setForm(emptyForm);
    setError("");
  }

  function startEdit(post) {
    setMode("edit");
    setSelectedId(post.id);
    setForm({ title: post.title, content: post.content });
    setError("");
  }

  function selectPost(post) {
    setMode("view");
    setSelectedId(post.id);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const savedPost =
        mode === "edit" && selectedPost
          ? await updatePost(selectedPost.id, form)
          : await createPost(form);

      await loadPosts();
      setMode("view");
      setSelectedId(savedPost.id);
      setForm(emptyForm);
    } catch (err) {
      if (err.details) {
        setError(Object.values(err.details).join(" "));
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(post) {
    const confirmed = window.confirm(`"${post.title}" 게시글을 삭제할까요?`);
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deletePost(post.id);
      const nextPosts = posts.filter((item) => item.id !== post.id);
      setPosts(nextPosts);
      setSelectedId(nextPosts[0]?.id || null);
      setMode(nextPosts.length > 0 ? "view" : "create");
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const isFormMode = mode === "create" || mode === "edit";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">게시판 연습</h1>
            <p className="mt-1 text-sm text-slate-600">
              Vite, React, Express, PostgreSQL로 만든 CRUD 실습 앱
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            새 글
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(280px,360px)_1fr] lg:px-8">
        <section className="min-h-[360px] rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">게시글</h2>
            <span className="text-xs text-slate-500">{posts.length}개</span>
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-slate-500">불러오는 중...</p>
          ) : posts.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-slate-900">아직 게시글이 없습니다.</p>
              <p className="mt-1 text-sm text-slate-500">첫 글을 작성해보세요.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {posts.map((post) => (
                <li key={post.id}>
                  <button
                    type="button"
                    onClick={() => selectPost(post)}
                    className={`block w-full px-4 py-4 text-left transition hover:bg-slate-50 ${
                      selectedId === post.id ? "bg-emerald-50" : "bg-white"
                    }`}
                  >
                    <span className="block truncate text-sm font-medium text-slate-950">
                      {post.title}
                    </span>
                    <span className="mt-1 block truncate text-sm text-slate-500">
                      {post.content}
                    </span>
                    <span className="mt-2 block text-xs text-slate-400">
                      {formatDate(post.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="min-h-[520px] rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              {isFormMode ? (mode === "edit" ? "게시글 수정" : "게시글 작성") : "게시글 상세"}
            </h2>
          </div>

          {error ? (
            <div className="mx-5 mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isFormMode ? (
            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-900">
                  제목
                </label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  maxLength={200}
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-900">
                  내용
                </label>
                <textarea
                  id="content"
                  value={form.content}
                  onChange={(event) => setForm({ ...form, content: event.target.value })}
                  className="mt-2 min-h-56 w-full resize-y rounded-md border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode(selectedPost ? "view" : "create");
                    setForm(emptyForm);
                    setError("");
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  취소
                </button>
              </div>
            </form>
          ) : selectedPost ? (
            <article className="p-5">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">{selectedPost.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    작성 {formatDate(selectedPost.createdAt)}
                    {selectedPost.updatedAt !== selectedPost.createdAt
                      ? ` · 수정 ${formatDate(selectedPost.updatedAt)}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(selectedPost)}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedPost)}
                    disabled={saving}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap pt-5 text-sm leading-7 text-slate-700">
                {selectedPost.content}
              </p>
            </article>
          ) : (
            <div className="px-5 py-16 text-center">
              <p className="text-sm font-medium text-slate-900">선택된 게시글이 없습니다.</p>
              <p className="mt-1 text-sm text-slate-500">새 글을 작성하거나 목록에서 선택하세요.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
