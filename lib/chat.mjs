export const defaultChatModel = "gpt-5.6-luna";
export const chatStorageKey = "vellumridge.chats.v1";
export const maxHistory = 12;

export function parseChatRequest(value) {
  if (
    !value ||
    !Array.isArray(value.messages) ||
    !value.messages.length ||
    value.messages.length > maxHistory
  )
    throw new Error("Send between 1 and 12 recent messages.");
  const messages = value.messages.map((message) => {
    if (
      !message ||
      !["user", "assistant"].includes(message.role) ||
      typeof message.content !== "string" ||
      !message.content.trim() ||
      message.content.length > (message.role === "user" ? 2000 : 12000)
    )
      throw new Error(
        "Use user or assistant messages. Questions can contain up to 2,000 characters.",
      );
    return { role: message.role, content: message.content.trim() };
  });
  if (messages.at(-1).role !== "user")
    throw new Error("The last message must be a question.");
  if (
    messages.reduce((sum, message) => sum + message.content.length, 0) > 32000
  )
    throw new Error("This conversation is too long. Start a new chat.");
  const page =
    typeof value.page === "string" &&
    /^\/docs(?:\/[a-z0-9-]+)*$/.test(value.page)
      ? value.page
      : null;
  return { messages, page };
}

export const searchTool = {
  type: "function",
  name: "search_knowledge",
  description:
    "Search the company handbook and employee directory, including roles and responsibilities. Turn the user's question into a standalone query using the conversation to resolve follow-ups. Use exact policy terms when helpful. Do not include the answer or unrelated topics.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "A standalone question of at most 240 characters.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  strict: true,
};

// Parses provider SSE and our NDJSON response without assuming network chunk boundaries.
export async function* readLines(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done
        ? decoder.decode()
        : decoder.decode(value, { stream: true });
      let end;
      while ((end = buffer.indexOf("\n")) >= 0) {
        yield buffer.slice(0, end).replace(/\r$/, "");
        buffer = buffer.slice(end + 1);
      }
      if (done) break;
    }
    if (buffer) yield buffer;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function readSavedChats(raw) {
  try {
    const value = JSON.parse(raw || "[]");
    if (!Array.isArray(value)) return [];
    return value
      .slice(0, 10)
      .filter(
        (chat) =>
          chat &&
          typeof chat.id === "string" &&
          typeof chat.title === "string" &&
          Array.isArray(chat.messages),
      )
      .map((chat) => ({
        id: chat.id.slice(0, 100),
        title: chat.title.slice(0, 80),
        messages: chat.messages
          .slice(-40)
          .filter(
            (message) =>
              message &&
              typeof message.id === "string" &&
              ["user", "assistant"].includes(message.role) &&
              typeof message.content === "string",
          )
          .map((message) => ({
            id: message.id.slice(0, 100),
            role: message.role,
            content: message.content.slice(0, 12000),
            state: message.state === "complete" ? "complete" : "stopped",
            sources: Array.isArray(message.sources)
              ? message.sources
                  .slice(0, 5)
                  .filter(
                    (source) =>
                      source &&
                      typeof source.id === "string" &&
                      typeof source.title === "string" &&
                      typeof source.url === "string" &&
                      /^\/docs(?:\/[a-z0-9-]+)*$/.test(source.url),
                  )
                  .map((source) => ({
                    id: source.id.slice(0, 100),
                    title: source.title.slice(0, 200),
                    url: source.url,
                  }))
              : [],
            query:
              typeof message.query === "string"
                ? message.query.slice(0, 240)
                : undefined,
          })),
      }));
  } catch {
    return [];
  }
}
