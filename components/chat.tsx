"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import {
  ArrowUp,
  BookOpen,
  History,
  MessageCircle,
  Plus,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react";
import {
  chatStorageKey,
  maxHistory,
  readLines,
  readSavedChats,
} from "@/lib/chat.mjs";

type Source = { id: string; title: string; url: string };
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  state: "complete" | "pending" | "stopped" | "failed";
  sources?: Source[];
  query?: string;
};
type Chat = { id: string; title: string; messages: Message[] };
const suggestions = [
  "I lost my work laptop. What now?",
  "Who can approve a 15% discount?",
  "Who handles payment terms?",
];

export function KnowledgeChat() {
  const pathname = usePathname();
  const { setOpenSearch } = useSearchContext();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [storageError, setStorageError] = useState("");
  const [config, setConfig] = useState<{
    configured: boolean;
    source: string;
  } | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const active = chats.find((chat) => chat.id === activeId);
  const messages = active?.messages || [];
  const locked = pathname === "/login";

  useEffect(() => {
    if (locked) {
      setOpen(false);
      controller.current?.abort();
      return;
    }
    if (hydrated) return;
    try {
      const saved = readSavedChats(
        localStorage.getItem(chatStorageKey),
      ) as Chat[];
      setChats(saved);
      setActiveId(saved[0]?.id || null);
    } catch {
      setStorageError(
        "This browser can't save chats. They will last only while this page is open.",
      );
    }
    setHydrated(true);
  }, [locked, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(chatStorageKey, JSON.stringify(chats));
      } catch {
        setStorageError(
          "Chat history couldn't be saved. Delete older chats or check browser storage settings.",
        );
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [chats, hydrated]);

  useEffect(() => {
    if (!open || locked) return;
    input.current?.focus();
    const abort = new AbortController();
    fetch("/api/chat", { signal: abort.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(setConfig)
      .catch(() => {
        if (!abort.signal.aborted)
          setError("Chat is unavailable. Refresh the page and try again.");
      });
    return () => abort.abort();
  }, [open, locked]);

  useEffect(() => {
    if (open && !history) bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages, status, open, history]);

  useEffect(() => () => controller.current?.abort(), []);

  function close() {
    setOpen(false);
    requestAnimationFrame(() => launcher.current?.focus());
  }
  function patchMessage(
    chatId: string,
    messageId: string,
    patch: Partial<Message>,
  ) {
    setChats((previous) =>
      previous.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === messageId ? { ...message, ...patch } : message,
              ),
            }
          : chat,
      ),
    );
  }

  async function send(question: string, retry = false) {
    question = question.trim();
    if (!question || busy || !config?.configured) return;
    const chatId = activeId || crypto.randomUUID();
    const previous = retry ? messages.slice(0, -2) : messages;
    const user: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
      state: "complete",
    };
    const assistant: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      state: "pending",
      sources: [],
    };
    const nextMessages = [...previous, user, assistant].slice(-40);
    const nextChat = {
      id: chatId,
      title: active?.title || question.slice(0, 60),
      messages: nextMessages,
    };
    setChats((old) =>
      [nextChat, ...old.filter((chat) => chat.id !== chatId)].slice(0, 10),
    );
    setActiveId(chatId);
    setDraft("");
    setError("");
    setHistory(false);
    setBusy(true);
    setStatus("Finding the right handbook pages…");
    const abort = new AbortController();
    controller.current = abort;
    let answer = "";
    let completed = false;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abort.signal,
        body: JSON.stringify({
          messages: [
            ...previous.filter((message) => message.state === "complete"),
            user,
          ]
            .slice(-maxHistory)
            .map(({ role, content }) => ({ role, content })),
          page: pathname,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Chat could not answer. Please retry.");
      }
      if (!response.body)
        throw new Error("The answer was empty. Please retry.");
      for await (const line of readLines(response.body)) {
        if (!line) continue;
        const event = JSON.parse(line);
        if (event.type === "status") setStatus(event.message);
        if (event.type === "sources") {
          patchMessage(chatId, assistant.id, {
            sources: event.sources,
            query: event.query,
          });
          setStatus("Writing an answer from the handbook…");
        }
        if (event.type === "delta") {
          answer += event.text;
          if (answer.length > 12000)
            throw new Error("The answer is too long. Try a narrower question.");
          patchMessage(chatId, assistant.id, { content: answer });
        }
        if (event.type === "error") throw new Error(event.message);
        if (event.type === "done") completed = true;
      }
      if (!completed)
        throw new Error(
          "The connection ended before the answer finished. Please retry.",
        );
      patchMessage(chatId, assistant.id, { state: "complete" });
    } catch (cause) {
      patchMessage(chatId, assistant.id, {
        state: abort.signal.aborted ? "stopped" : "failed",
      });
      if (!abort.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "Chat is unavailable. Please retry.",
        );
      abort.abort();
    } finally {
      setBusy(false);
      setStatus("");
      controller.current = null;
    }
  }

  if (locked) return null;
  const last = messages.at(-1);
  const retryQuestion =
    last && ["failed", "stopped"].includes(last.state)
      ? messages.at(-2)?.content
      : null;
  return (
    <>
      {!open && (
        <button
          ref={launcher}
          className="chat-launcher"
          aria-label="Open handbook chat"
          onClick={() => setOpen(true)}
        >
          <MessageCircle size={20} aria-hidden /> <span>Ask the handbook</span>
        </button>
      )}
      {open && (
        <aside
          className="chat-panel"
          role="dialog"
          aria-label="Handbook chat"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              close();
            }
          }}
        >
          <header className="chat-header">
            <div className="chat-emblem">
              <MessageCircle size={20} aria-hidden />
            </div>
            <div>
              <h2>Ask the handbook</h2>
              <p>Your company knowledge, in conversation.</p>
            </div>
            <button
              className="chat-icon-button"
              aria-label="Close chat"
              onClick={close}
            >
              <X size={19} />
            </button>
          </header>
          <div className="chat-toolbar">
            <button
              aria-pressed={history}
              disabled={busy}
              onClick={() => setHistory(!history)}
            >
              <History size={15} /> Chats
              {chats.length > 0 && <span>{chats.length}</span>}
            </button>
            <button
              disabled={busy}
              onClick={() => {
                setActiveId(null);
                setHistory(false);
                setDraft("");
                setError("");
                input.current?.focus();
              }}
            >
              <Plus size={15} /> New chat
            </button>
            <button onClick={() => setOpenSearch(true)}>
              <Search size={15} /> Search site
            </button>
          </div>
          {history ? (
            <div className="chat-history">
              <div className="chat-history-heading">
                <h3>Saved in this browser</h3>
                {chats.length > 0 && (
                  <button
                    onClick={() => {
                      setChats([]);
                      setActiveId(null);
                      setError("");
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>
              {!chats.length && (
                <p>
                  No conversations yet. Start a new chat to ask your first
                  question.
                </p>
              )}
              {chats.map((chat) => (
                <div className="chat-history-item" key={chat.id}>
                  <button
                    aria-current={chat.id === activeId ? "true" : undefined}
                    onClick={() => {
                      setActiveId(chat.id);
                      setHistory(false);
                      setDraft("");
                      setError("");
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>{chat.title}</span>
                  </button>
                  <button
                    className="chat-icon-button"
                    aria-label={`Delete chat: ${chat.title}`}
                    onClick={() => {
                      setChats((old) =>
                        old.filter((item) => item.id !== chat.id),
                      );
                      if (activeId === chat.id) setActiveId(null);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="chat-messages">
              {!messages.length && (
                <div className="chat-welcome">
                  <div className="chat-welcome-icon">
                    <BookOpen size={25} strokeWidth={1.5} />
                  </div>
                  <h3>A question is a good place to start.</h3>
                  <p>
                    Ask about a policy, work through a situation, or follow up.
                    Every answer starts with the handbook.
                  </p>
                  <div className="chat-prompts">
                    {suggestions.map((question) => (
                      <button
                        key={question}
                        disabled={!config?.configured}
                        onClick={() => void send(question)}
                      >
                        {question}
                        <ArrowUp size={15} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat-message chat-message-${message.role}`}
                >
                  <span className="chat-message-label">
                    {message.role === "user" ? "You" : "Handbook assistant"}
                  </span>
                  {message.content && (
                    <div className="chat-markdown">
                      {message.role === "user" ? (
                        <p>{message.content}</p>
                      ) : (
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            img: () => null,
                            a: ({ href, children }) =>
                              message.sources?.some(
                                (source) => source.url === href,
                              ) ? (
                                <Link href={href!}>{children}</Link>
                              ) : (
                                <span>{children}</span>
                              ),
                          }}
                        >
                          {message.content}
                        </Markdown>
                      )}
                    </div>
                  )}
                  {message.state === "pending" && !message.content && (
                    <p className="chat-pending" role="status">
                      <span />
                      {status || "Working on your question…"}
                    </p>
                  )}
                  {message.state === "stopped" && (
                    <p className="chat-message-note">Answer stopped.</p>
                  )}
                  {message.state === "failed" && (
                    <p className="chat-message-note">
                      Answer incomplete. Please retry.
                    </p>
                  )}
                  {!!message.sources?.length && (
                    <details className="chat-sources">
                      <summary>
                        <BookOpen size={13} />
                        {message.sources.length} pages searched
                      </summary>
                      {message.query && <p>Search: {message.query}</p>}
                      {message.sources.map((source) => (
                        <Link key={source.id} href={source.url}>
                          <BookOpen size={13} />
                          {source.title}
                        </Link>
                      ))}
                    </details>
                  )}
                </div>
              ))}
              {error && (
                <p className="chat-error" role="alert">
                  {error}
                </p>
              )}
              {retryQuestion && !busy && (
                <button
                  className="chat-retry"
                  onClick={() => void send(retryQuestion, true)}
                >
                  Retry answer
                </button>
              )}
              <div ref={bottom} />
            </div>
          )}
          {storageError && (
            <p className="chat-notice" role="status">
              {storageError}
            </p>
          )}
          {config && !config.configured && (
            <p className="chat-notice">
              Chat isn’t connected yet. Add an OpenAI API key to enable answers.
              You can still search the handbook.
            </p>
          )}
          <form
            className="chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              void send(draft);
            }}
          >
            <label className="sr-only" htmlFor="chat-question">
              Your question
            </label>
            <div className="chat-input-wrap">
              <textarea
                ref={input}
                id="chat-question"
                value={draft}
                maxLength={2000}
                rows={2}
                placeholder="Ask a question or follow up…"
                disabled={busy}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    void send(draft);
                  }
                }}
              />
              {busy ? (
                <button
                  type="button"
                  aria-label="Stop answer"
                  onClick={() => controller.current?.abort()}
                >
                  <Square size={15} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label="Send question"
                  disabled={!draft.trim() || !config?.configured}
                >
                  <ArrowUp size={19} />
                </button>
              )}
            </div>
            <p>
              History stays in this browser. Questions and sources go to OpenAI.
            </p>
            <span>
              {config?.source === "local"
                ? "Local keyword search"
                : "Sanity semantic search"}{" "}
              <span aria-hidden>+</span> OpenAI
            </span>
          </form>
        </aside>
      )}
    </>
  );
}
