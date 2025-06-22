export type ChatMessage = {
  id: string;
  content: string;
  user: string;
  role: "user" | "assistant";
  time: number;
};

export type Message =
  | {
  type: "add";
  id: string;
  content: string;
  user: string;
  role: "user" | "assistant";
  time: number;
}
  | {
  type: "update";
  id: string;
  content: string;
  user: string;
  role: "user" | "assistant";
  time: number;
}
  | {
  type: "all";
  messages: ChatMessage[];
};

export const names = [
  "Labubu", "Zimomo", "Mokoko", "Tycoco", "Yaya", "Pato", "Vos", "Pippo",
  "Spooky",
];