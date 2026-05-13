"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Message = { role: "user" | "assistant"; content: string };

const CHIPS = [
  "what do you bring to the table?",
  "what have you shipped recently?",
  "how do you approach building systems?",
  "tell me about your biggest impact",
  "what drives you as an engineer?",
];

function TypingIndicator() {
  return (
    <div className="flex gap-1 px-4 py-3" style={{ background: "var(--bubble-ai)", color: "var(--bubble-ai-text)", borderRadius: "20px 20px 20px 4px", width: "fit-content" }}>
      <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--muted)" }} />
      <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--muted)" }} />
      <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--muted)" }} />
    </div>
  );
}

function ResumeView() {
  return (
    <div className="max-w-xl mx-auto px-6 py-10 animate-fade-up">
      {[
        { title: "HSBC", sub: "Senior Consultant — CCaaS Platform · Jun 2025 – Present", items: [
          "Lead architect — 10+ microservices, WebSocket gateway, React micro frontends (Module Federation)",
          "Built internal skills portal for coding assistants — 1,000+ engineers",
          "Replaced RAG with Agentic RAG using LangGraph",
          "Deployed AI agents (Flue + LangChain) with LangSmith tracing",
          "Contract-first API dev via OpenAPI Generator — ~40% fewer defects",
        ]},
        { title: "Citi Bank", sub: "AVP · Oct 2022 – May 2025", items: [
          "Spring Boot + gRPC + GraphQL on OpenShift — sub-50ms latency",
          "Kafka event-driven pipelines across 10+ microservices",
          "Cut API payloads 60% with Avro, query perf 50% via indexing + Hazelcast",
        ]},
        { title: "TCS", sub: "Software Developer · Jun 2019 – Oct 2022", items: [
          "SOAP → REST migration — 35% faster",
          "API gateway, MongoDB tuning 10s → 2s",
        ]},
      ].map((job) => (
        <div key={job.title} className="mb-8">
          <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>{job.title}</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{job.sub}</p>
          <ul className="mt-2 space-y-1">
            {job.items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed pl-4 relative" style={{ color: "var(--muted)" }}>
                <span className="absolute left-0">·</span>{item}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Projects</h2>
        <div className="mt-3 space-y-3">
          <a href="https://github.com/gothamdev244/lease-shield-web" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg cursor-pointer transition-opacity hover:opacity-80" style={{ border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Lease Shield</h3>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>AI rental lease analyzer — Flue agent + Gemini flags illegal clauses in Indian leases, cites laws, generates pushback scripts</p>
          </a>
          <a href="https://github.com/gothamdev244/docgraph-web" target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg cursor-pointer transition-opacity hover:opacity-80" style={{ border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>DocGraph</h3>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Upload docs → AI extracts entities → interactive knowledge graph + Agentic RAG Q&A with citations. Flue + PostgreSQL/pgvector</p>
          </a>
          <div className="block p-3 rounded-lg" style={{ border: "1px solid var(--border)" }}>
            <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>AI Personal Assistant <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>(private)</span></h3>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Multi-agent system on Telegram — email, finance, health, coding. 100+ autonomous daily interactions</p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Skills</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Java", "Python", "TypeScript", "Spring Boot", "React", "LangChain", "LangGraph", "Flue", "Kafka", "gRPC", "Docker", "OpenShift", "MongoDB", "pgvector"].map((s) => (
            <span key={s} className="px-2.5 py-1 text-xs rounded-full" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"ask" | "resume">("ask");
  const [dark, setDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages([...newMessages, { role: "assistant", content: assistantText }]);
      }
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "something broke. try again?" }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="flex justify-between items-center px-5 py-3">
        <div className="flex gap-0.5 p-0.5 rounded-full" style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}>
          {(["ask", "resume"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className="px-4 py-1.5 text-xs rounded-full transition-all duration-200"
              style={{ background: mode === m ? "var(--fg)" : "transparent", color: mode === m ? "var(--bg)" : "var(--muted)", fontWeight: mode === m ? 600 : 400 }}>
              {m === "ask" ? "ask me" : "résumé"}
            </button>
          ))}
        </div>
        <div className="flex gap-4 items-center text-xs" style={{ color: "var(--muted)" }}>
          <a href="https://github.com/adarshp14" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">github</a>
          <a href="https://linkedin.com/in/adarsh-pandey-2017" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">linkedin</a>
          <button onClick={() => setDark(!dark)} className="hover:opacity-70 transition-opacity" aria-label="Toggle theme">
            {dark ? "☀" : "☾"}
          </button>
        </div>
      </nav>

      {mode === "resume" ? (
        <ResumeView />
      ) : (
        <div className="flex-1 flex flex-col max-w-xl w-full mx-auto px-5">
          <div className={`transition-all duration-500 ${hasMessages ? "pt-4 pb-3" : "flex-1 flex flex-col justify-center"}`}>
            {!hasMessages && <p className="text-7xl font-extralight tracking-tight select-none" style={{ color: "var(--border)" }}>hi!</p>}
            <h1 className={`font-semibold tracking-tight ${hasMessages ? "text-base" : "text-2xl mt-1"}`}>
              {hasMessages ? "Adarsh Pandey" : <>I&apos;m Adarsh, senior engineer at <span className="text-blue-500">HSBC</span></>}
            </h1>
            {!hasMessages && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                I break systems to understand them, then rebuild them better. this is my digital twin — ask anything.
              </p>
            )}
          </div>

          {!hasMessages && (
            <div className="flex flex-wrap gap-2 mb-6 animate-fade-up">
              {CHIPS.map((chip) => (
                <button key={chip} onClick={() => sendMessage(chip)}
                  className="px-3 py-1.5 text-xs rounded-full transition-all duration-200 hover:scale-[1.02]"
                  style={{ border: "1px solid var(--chip-border)", color: "var(--muted)" }}>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {hasMessages && (
            <div className="flex-1 overflow-y-auto space-y-2 pb-2">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
                  <div className="max-w-[85%] px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      background: m.role === "user" ? "var(--bubble-user)" : "var(--bubble-ai)",
                      color: m.role === "user" ? "var(--bubble-user-text)" : "var(--bubble-ai-text)",
                      borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    }}>
                    {m.content || <TypingIndicator />}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="sticky bottom-0 pb-3 pt-2" style={{ background: `linear-gradient(transparent, var(--bg) 30%)` }}>
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full"
              style={{ background: "var(--input-bg)", border: "1px solid var(--border)" }}>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="ask me anything..." className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--fg)" }} disabled={loading} />
              <button type="submit" disabled={loading || !input.trim()}
                className="transition-opacity disabled:opacity-20" style={{ color: "var(--muted)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </form>
            <p className="text-center text-[10px] mt-2" style={{ color: "var(--muted)", opacity: 0.5 }}>ai experiment · responses may not reflect actual views</p>
          </div>
        </div>
      )}
    </div>
  );
}
