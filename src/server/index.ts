import {
  type Connection,
  Server,
  type WSMessage,
  routePartykitRequest,
} from "partyserver";

import type { ChatMessage, Message } from "../shared";

export class Chat extends Server<Env> {
  static options = { hibernate: true };

  messages = [] as ChatMessage[];

  broadcastMessage(message: Message, exclude?: string[]) {
    this.broadcast(JSON.stringify(message), exclude);
  }

  onStart() {
    // // 删除现有表以重置结构
    // this.ctx.storage.sql.exec(`DROP TABLE IF EXISTS messages`);

    // 创建包含时间戳的新表
    this.ctx.storage.sql.exec(
      `CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, user TEXT, role TEXT, content TEXT, time INTEGER)`,
    );

    // 从现在为空的数据库中加载消息
    this.messages = this.ctx.storage.sql
      .exec(`SELECT * FROM messages ORDER BY time ASC`)
      .toArray() as ChatMessage[];
  }

  onConnect(connection: Connection) {
    connection.send(
      JSON.stringify({
        type: "all",
        messages: this.messages,
      } satisfies Message),
    );
  }

  saveMessage(message: ChatMessage) {
    // 检查消息是否已存在
    const existingMessage = this.messages.find((m) => m.id === message.id);
    if (existingMessage) {
      this.messages = this.messages.map((m) => {
        if (m.id === message.id) {
          return message;
        }
        return m;
      });
    } else {
      this.messages.push(message);
    }

    // 使用参数化查询来防止SQL注入并保存消息
    this.ctx.storage.sql.exec(
      `INSERT INTO messages (id, user, role, content, time) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT (id) DO UPDATE SET content = excluded.content, time = excluded.time`,
      message.id,
      message.user,
      message.role,
      message.content,
      message.time,
    );
  }

  onMessage(connection: Connection, message: WSMessage) {
    this.broadcast(message);
    const parsed = JSON.parse(message as string) as Message;
    if (parsed.type === "add" || parsed.type === "update") {
      this.saveMessage(parsed);
    }
  }
}

export default {
  async fetch(request, env) {
    return (
      (await routePartykitRequest(request, { ...env })) ||
      env.ASSETS.fetch(request)
    );
  },
} satisfies ExportedHandler<Env>;