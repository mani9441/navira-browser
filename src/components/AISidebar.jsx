import { useState } from "react";

import { useAIStore } from "../store/aiStore";

import { AIChatManager } from "../ai/AIChatManager";

export default function AISidebar() {
  const [input, setInput] = useState("");

  const messages = useAIStore((s) => s.messages);

  const streaming = useAIStore((s) => s.streaming);

  const send = async () => {
    if (!input.trim()) return;

    const value = input;

    setInput("");

    await AIChatManager.send(value);
  };

  return (
    <div className="ai-sidebar">
      <div className="ai-header">Navira AI</div>

      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.role}`}>
            {m.content}
          </div>
        ))}
      </div>

      <div className="ai-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              send();
            }
          }}
          placeholder="Ask Navira..."
        />

        <button onClick={send}>Send</button>
      </div>

      {streaming && <div className="ai-streaming">Thinking...</div>}
    </div>
  );
}
