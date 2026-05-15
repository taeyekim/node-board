import { useEffect, useMemo, useState } from "react";
import {
  clearStoredToken,
  createComment,
  createPost,
  deleteComment,
  deletePost,
  fetchComments,
  fetchMe,
  fetchPost,
  fetchPosts,
  getStoredToken,
  login,
  register,
  updatePost,
} from "./api.js";

const emptyForm = { title: "", content: "", category: "free" };
const emptyAuthForm = { email: "", name: "", password: "" };
const pageSize = 10;

const categories = [
  { label: "전체", value: "all" },
  { label: "공지", value: "notice" },
  { label: "자유", value: "free" },
  { label: "질문", value: "question" },
  { label: "정보", value: "info" },
];

const sortOptions = [
  { label: "최신순", value: "latest" },
  { label: "오래된순", value: "oldest" },
  { label: "제목순", value: "title" },
  { label: "조회순", value: "views" },
];

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getCategoryLabel(value) {
  return categories.find((category) => category.value === value)?.label || "자유";
}

function getAuthor(post) {
  return post.author?.name || "익명";
}

function isNewPost(post) {
  if (!post.createdAt) {
    return false;
  }

  const createdAt = new Date(post.createdAt).getTime();
  return Date.now() - createdAt < 1000 * 60 * 60 * 24;
}

function getPreview(content) {
  if (!content) {
    return "내용 없음";
  }

  return content.length > 90 ? `${content.slice(0, 90)}...` : content;
}

function getErrorMessage(error) {
  return error.details ? Object.values(error.details).join(" ") : error.message;
}

function SiteHeader({ currentUser, onCreate, onOpenAuth, onLogout }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-900 text-xs font-bold text-white">
            NB
          </div>
          <span className="text-base font-bold text-gray-900">Node Board</span>
        </div>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <span className="hidden text-sm text-gray-600 sm:inline">{currentUser.name}</span>
              <button
                type="button"
                onClick={onLogout}
                className="h-9 rounded border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                로그아웃
              </button>
              <button
                type="button"
                onClick={onCreate}
                className="h-9 rounded border border-gray-900 bg-gray-900 px-3 text-sm font-semibold text-white hover:bg-gray-700"
              >
                글쓰기
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth("login")}
                className="h-9 rounded border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth("register")}
                className="h-9 rounded border border-gray-900 bg-gray-900 px-3 text-sm font-semibold text-white hover:bg-gray-700"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function AuthPanel({ mode, form, saving, onModeChange, onChange, onSubmit, onClose }) {
  if (!mode) {
    return null;
  }

  const isRegister = mode === "register";

  return (
    <section className="mb-4 border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {isRegister ? "회원가입" : "로그인"}
        </h2>
        <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">
          닫기
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_auto]">
        <input
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-gray-900"
          placeholder="이메일"
          type="email"
        />
        {isRegister ? (
          <input
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
            className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-gray-900"
            placeholder="닉네임"
          />
        ) : null}
        <input
          value={form.password}
          onChange={(event) => onChange({ ...form, password: event.target.value })}
          className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-gray-900"
          placeholder="비밀번호"
          type="password"
        />
        <button
          type="submit"
          disabled={saving}
          className="h-10 rounded border border-gray-900 bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {saving ? "처리 중..." : isRegister ? "가입" : "로그인"}
        </button>
      </form>
      <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
        {isRegister ? "이미 계정이 있나요?" : "아직 계정이 없나요?"}{" "}
        <button
          type="button"
          onClick={() => onModeChange(isRegister ? "login" : "register")}
          className="font-medium text-gray-900 underline"
        >
          {isRegister ? "로그인" : "회원가입"}
        </button>
      </div>
    </section>
  );
}

function BoardHeader({
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
  postCount,
  loading,
}) {
  return (
    <section className="border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-gray-950">자유게시판</h1>
            <p className="mt-2 text-sm text-gray-600">
              Express, Prisma, PostgreSQL, JWT 기반 CRUD 게시판
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>게시글 {postCount}개</span>
            <span className="h-3 w-px bg-gray-200" />
            <span>{loading ? "불러오는 중" : "DB 연결됨"}</span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 px-4 sm:px-6">
        <nav className="-mb-px flex gap-5 overflow-x-auto" aria-label="게시판 카테고리">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => onCategoryChange(category.value)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium ${
                activeCategory === category.value
                  ? "border-gray-900 text-gray-950"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              {category.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_160px] sm:px-6">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="h-10 w-full rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900"
          placeholder="제목 또는 내용을 검색하세요"
        />
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

function PostTitleButton({ post, onSelect }) {
  return (
    <button type="button" onClick={() => onSelect(post)} className="text-left hover:underline">
      <span className="font-medium text-gray-900">{post.title}</span>
      <span className="ml-1 text-gray-400">[{post.commentCount}]</span>
      {isNewPost(post) ? (
        <span className="ml-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          N
        </span>
      ) : null}
    </button>
  );
}

function DesktopPostTable({ posts, selectedId, onSelect }) {
  return (
    <div className="hidden overflow-x-auto border-x border-gray-200 bg-white md:block">
      <table className="min-w-full table-fixed divide-y divide-gray-200 text-sm">
        <colgroup>
          <col className="w-16" />
          <col className="w-20" />
          <col />
          <col className="w-24" />
          <col className="w-32" />
          <col className="w-20" />
        </colgroup>
        <thead className="bg-gray-50 text-xs font-semibold text-gray-600">
          <tr>
            <th className="px-3 py-2 text-center">번호</th>
            <th className="px-3 py-2 text-center">분류</th>
            <th className="px-3 py-2 text-left">제목</th>
            <th className="px-3 py-2 text-center">작성자</th>
            <th className="px-3 py-2 text-center">작성일</th>
            <th className="px-3 py-2 text-center">조회</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {posts.map((post) => (
            <tr key={post.id} className={post.id === selectedId ? "bg-gray-50" : "hover:bg-gray-50"}>
              <td className="px-3 py-2 text-center text-xs text-gray-500">{post.id}</td>
              <td className="px-3 py-2 text-center text-xs text-gray-500">
                {getCategoryLabel(post.category)}
              </td>
              <td className="px-3 py-2">
                <PostTitleButton post={post} onSelect={onSelect} />
              </td>
              <td className="px-3 py-2 text-center text-xs text-gray-600">{getAuthor(post)}</td>
              <td className="px-3 py-2 text-center text-xs text-gray-500">
                {formatDate(post.createdAt)}
              </td>
              <td className="px-3 py-2 text-center text-xs text-gray-500">{post.viewCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobilePostCards({ posts, selectedId, onSelect }) {
  return (
    <ul className="divide-y divide-gray-100 border-x border-gray-200 bg-white md:hidden">
      {posts.map((post) => (
        <li key={post.id}>
          <button
            type="button"
            onClick={() => onSelect(post)}
            className={`block w-full px-4 py-4 text-left ${post.id === selectedId ? "bg-gray-50" : "bg-white"}`}
          >
            <p className="truncate text-sm font-semibold text-gray-950">
              <span className="mr-2 text-xs font-medium text-gray-500">
                {getCategoryLabel(post.category)}
              </span>
              {post.title}
              <span className="ml-1 text-gray-400">[{post.commentCount}]</span>
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-600">
              {getPreview(post.content)}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
              <span>#{post.id}</span>
              <span>{getAuthor(post)}</span>
              <span>{formatDate(post.createdAt)}</span>
              <span>조회 {post.viewCount}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function PostList({ loading, posts, selectedId, onSelect, onCreate }) {
  if (loading) {
    return (
      <div className="border-x border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
        게시글을 불러오는 중입니다.
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="border-x border-gray-200 bg-white px-4 py-16 text-center">
        <p className="text-sm font-semibold text-gray-900">조건에 맞는 게시글이 없습니다.</p>
        <p className="mt-1 text-sm text-gray-500">검색어를 바꾸거나 첫 게시글을 작성해보세요.</p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 h-9 rounded border border-gray-900 bg-gray-900 px-3 text-sm font-semibold text-white hover:bg-gray-700"
        >
          글쓰기
        </button>
      </div>
    );
  }

  return (
    <>
      <DesktopPostTable posts={posts} selectedId={selectedId} onSelect={onSelect} />
      <MobilePostCards posts={posts} selectedId={selectedId} onSelect={onSelect} />
    </>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1 border border-gray-200 bg-white px-4 py-4">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-8 rounded border border-gray-300 px-3 text-sm text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
      >
        이전
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPageChange(item)}
          className={`h-8 min-w-8 rounded border px-3 text-sm ${
            item === page
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {item}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="h-8 rounded border border-gray-300 px-3 text-sm text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300"
      >
        다음
      </button>
    </div>
  );
}

function PostForm({ mode, form, saving, onChange, onSubmit, onCancel }) {
  return (
    <section className="mt-6 border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {mode === "edit" ? "게시글 수정" : "게시글 작성"}
        </h2>
      </div>
      <form onSubmit={onSubmit} className="px-4 py-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="category" className="text-sm font-medium text-gray-900">
              카테고리
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(event) => onChange({ ...form, category: event.target.value })}
              className="mt-2 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-gray-900 sm:w-48"
            >
              {categories
                .filter((category) => category.value !== "all")
                .map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="title" className="text-sm font-medium text-gray-900">
                제목
              </label>
              <span className="text-xs text-gray-500">{form.title.length}/200</span>
            </div>
            <input
              id="title"
              value={form.title}
              onChange={(event) => onChange({ ...form, title: event.target.value })}
              maxLength={200}
              placeholder="제목을 입력하세요"
              className="mt-2 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-gray-900"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="text-sm font-medium text-gray-900">
                내용
              </label>
              <span className="text-xs text-gray-500">{form.content.length}자</span>
            </div>
            <textarea
              id="content"
              value={form.content}
              onChange={(event) => onChange({ ...form, content: event.target.value })}
              placeholder="내용을 입력하세요"
              className="mt-2 min-h-64 w-full resize-y rounded border border-gray-300 px-3 py-3 text-sm leading-6 outline-none focus:border-gray-900"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-9 rounded border border-gray-900 bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-400"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Comments({ comments, currentUser, post, commentText, saving, onChange, onSubmit, onDelete, onLogin }) {
  return (
    <section className="border-t border-gray-100 px-4 py-4">
      <h4 className="text-sm font-semibold text-gray-900">댓글 {comments.length}</h4>
      <ul className="mt-3 divide-y divide-gray-100">
        {comments.map((comment) => {
          const canDelete =
            currentUser &&
            (comment.author?.id === currentUser.id || post.author?.id === currentUser.id);

          return (
            <li key={comment.id} className="py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{comment.author?.name || "익명"}</span>
                  <span className="ml-2">{formatDate(comment.createdAt)}</span>
                </div>
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(comment)}
                    disabled={saving}
                    className="text-xs font-medium text-red-600 hover:underline disabled:text-gray-400"
                  >
                    댓글 삭제
                  </button>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">{comment.content}</p>
            </li>
          );
        })}
      </ul>
      {currentUser ? (
        <form onSubmit={onSubmit} className="mt-4">
          <textarea
            value={commentText}
            onChange={(event) => onChange(event.target.value)}
            placeholder="댓글을 입력하세요"
            className="min-h-24 w-full resize-y rounded border border-gray-300 px-3 py-3 text-sm leading-6 outline-none focus:border-gray-900"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="h-9 rounded border border-gray-900 bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              댓글 등록
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={onLogin} className="mt-4 text-sm font-medium text-gray-900 underline">
          로그인하고 댓글 쓰기
        </button>
      )}
    </section>
  );
}

function PostDetail({
  post,
  comments,
  currentUser,
  commentText,
  saving,
  onEdit,
  onDelete,
  onCommentChange,
  onCommentSubmit,
  onCommentDelete,
  onLogin,
}) {
  if (!post) {
    return null;
  }

  const canMutate = currentUser && (!post.author || post.author.id === currentUser.id);

  return (
    <section className="mt-6 border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">게시글 보기</h2>
      </div>
      <article>
        <div className="border-b border-gray-200 px-4 py-4">
          <div className="mb-2 text-xs font-medium text-gray-500">{getCategoryLabel(post.category)}</div>
          <h3 className="text-lg font-semibold text-gray-950">{post.title}</h3>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span>작성자 {getAuthor(post)}</span>
            <span>작성일 {formatDate(post.createdAt)}</span>
            <span>조회 {post.viewCount}</span>
            <span>댓글 [{post.commentCount}]</span>
          </div>
        </div>
        <div className="min-h-48 whitespace-pre-wrap px-4 py-6 text-sm leading-7 text-gray-800">
          {post.content}
        </div>
        {canMutate ? (
          <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-4">
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="h-9 rounded border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => onDelete(post)}
              disabled={saving}
              className="h-9 rounded border border-red-300 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {saving ? "처리 중..." : "삭제"}
            </button>
          </div>
        ) : null}
        <Comments
          comments={comments}
          currentUser={currentUser}
          post={post}
          commentText={commentText}
          saving={saving}
          onChange={onCommentChange}
          onSubmit={onCommentSubmit}
          onDelete={onCommentDelete}
          onLogin={onLogin}
        />
      </article>
    </section>
  );
}

export default function App() {
  const [posts, setPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, pageSize, total: 0, totalPages: 1 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [mode, setMode] = useState("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [authForm, setAuthForm] = useState(emptyAuthForm);

  const isFormMode = mode === "create" || mode === "edit";
  const selectedId = selectedPost?.id || null;

  const listParams = useMemo(
    () => ({ q: query.trim(), category, sort, page, pageSize }),
    [query, category, sort, page],
  );

  useEffect(() => {
    loadPosts(listParams);
  }, [listParams]);

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, category, sort]);

  async function restoreSession() {
    if (!getStoredToken()) {
      return;
    }

    try {
      const user = await fetchMe();
      setCurrentUser(user);
    } catch (_error) {
      clearStoredToken();
      setCurrentUser(null);
    }
  }

  async function loadPosts(params = listParams) {
    setLoading(true);
    setError("");

    try {
      const data = await fetchPosts(params);
      setPosts(data.posts);
      setPageInfo(data.pageInfo);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function refreshSelectedPost(postId) {
    const [post, nextComments] = await Promise.all([fetchPost(postId), fetchComments(postId)]);
    setSelectedPost(post);
    setComments(nextComments);
    setCommentText("");
    return post;
  }

  function openAuth(nextMode) {
    setAuthMode(nextMode);
    setAuthForm(emptyAuthForm);
    setError("");
  }

  function startCreate() {
    if (!currentUser) {
      setError("글쓰기는 로그인 후 이용할 수 있습니다.");
      openAuth("login");
      return;
    }

    setMode("create");
    setSelectedPost(null);
    setComments([]);
    setForm(emptyForm);
    setError("");
  }

  function startEdit(post) {
    setMode("edit");
    setForm({ title: post.title, content: post.content, category: post.category || "free" });
    setError("");
  }

  async function selectPost(post) {
    setMode("view");
    setForm(emptyForm);
    setError("");

    try {
      await refreshSelectedPost(post.id);
      await loadPosts(listParams);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const user = authMode === "register" ? await register(authForm) : await login(authForm);
      setCurrentUser(user);
      setAuthMode(null);
      setAuthForm(emptyAuthForm);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    clearStoredToken();
    setCurrentUser(null);
    setMode("list");
    setSelectedPost(null);
    setComments([]);
    setForm(emptyForm);
    setCommentText("");
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

      await loadPosts({ ...listParams, page: 1 });
      setPage(1);
      setMode("view");
      await refreshSelectedPost(savedPost.id);
      setForm(emptyForm);
    } catch (err) {
      if (err.status === 401) {
        openAuth("login");
      }
      setError(getErrorMessage(err));
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
      await loadPosts(listParams);
      setSelectedPost(null);
      setComments([]);
      setMode("list");
      setForm(emptyForm);
    } catch (err) {
      if (err.status === 401) {
        openAuth("login");
      }
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!selectedPost) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createComment(selectedPost.id, { content: commentText });
      await refreshSelectedPost(selectedPost.id);
      await loadPosts(listParams);
    } catch (err) {
      if (err.status === 401) {
        openAuth("login");
      }
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleCommentDelete(comment) {
    if (!selectedPost) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteComment(selectedPost.id, comment.id);
      await refreshSelectedPost(selectedPost.id);
      await loadPosts(listParams);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function cancelForm() {
    setMode(selectedPost ? "view" : "list");
    setForm(emptyForm);
    setError("");
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SiteHeader
        currentUser={currentUser}
        onCreate={startCreate}
        onOpenAuth={openAuth}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <AuthPanel
          mode={authMode}
          form={authForm}
          saving={saving}
          onModeChange={openAuth}
          onChange={setAuthForm}
          onSubmit={handleAuthSubmit}
          onClose={() => setAuthMode(null)}
        />

        <BoardHeader
          activeCategory={category}
          onCategoryChange={setCategory}
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          postCount={pageInfo.total}
          loading={loading}
        />

        {error ? (
          <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4">
          <PostList
            loading={loading}
            posts={posts}
            selectedId={selectedId}
            onSelect={selectPost}
            onCreate={startCreate}
          />
          <Pagination page={page} totalPages={pageInfo.totalPages} onPageChange={setPage} />
        </div>

        {isFormMode ? (
          <PostForm
            mode={mode}
            form={form}
            saving={saving}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={cancelForm}
          />
        ) : (
          <PostDetail
            post={selectedPost}
            comments={comments}
            currentUser={currentUser}
            commentText={commentText}
            saving={saving}
            onEdit={startEdit}
            onDelete={handleDelete}
            onCommentChange={setCommentText}
            onCommentSubmit={handleCommentSubmit}
            onCommentDelete={handleCommentDelete}
            onLogin={() => openAuth("login")}
          />
        )}
      </main>
    </div>
  );
}
