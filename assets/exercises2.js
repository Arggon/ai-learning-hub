/* Exercises part 2: apps, agents, ops. */
window.EXERCISES = window.EXERCISES || {};
Object.assign(window.EXERCISES, {
reasoning: { task: "Build a tiny experiment: run the same 10 multi-step word problems with two prompts (\"answer directly\" vs \"think step by step, then give the final answer after ANSWER:\"), extract the answer, and compare accuracy and total output tokens. Use any LLM API; the examples call the Anthropic Messages API.",
  code: {
    pseudo: R`problems = [(question, expectedAnswer), ...]          // 10 word problems
for each prompt in ["Answer directly.", "Think step by step, then write ANSWER: <answer>"]:
    correct = 0; tokens = 0
    for each (q, expected) in problems:
        response = call LLM API with prompt + q
        answer = text after "ANSWER:" (or the whole text)
        if answer starts with expected: correct = correct + 1
        tokens = tokens + response.usage.output_tokens
    print prompt, correct, tokens`,
    python: R`import anthropic  # pip install anthropic; set ANTHROPIC_API_KEY

client = anthropic.Anthropic()
MODEL = "<model-id>"  # take the current model id from the provider docs

def run(prompt, question, expected):
    r = client.messages.create(model=MODEL, max_tokens=1024,
                               messages=[{"role": "user", "content": prompt + "\n\n" + question}])
    text = r.content[0].text
    answer = text.split("ANSWER:")[-1].strip()
    return answer.startswith(expected), r.usage.output_tokens

problems = [("A shirt costs 20 after a 20% discount. What was the original price?", "25")]  # add 9 more
for prompt in ["Answer with just the number after ANSWER:",
               "Think step by step, then give the final number after ANSWER:"]:
    results = [run(prompt, q, e) for q, e in problems]
    print(prompt[:30], "accuracy", sum(ok for ok, _ in results) / len(results),
          "output tokens", sum(t for _, t in results))`,
    ts: R`// Node 18+. Set ANTHROPIC_API_KEY. Take the current model id from the provider docs.
const MODEL = "<model-id>";
async function run(prompt: string, question: string, expected: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 1024, messages: [{ role: "user", content: prompt + "\n\n" + question }] }),
  });
  const json = await res.json();
  const answer = json.content[0].text.split("ANSWER:").at(-1).trim();
  return { ok: answer.startsWith(expected), tokens: json.usage.output_tokens as number };
}
const problems: [string, string][] = [["A shirt costs 20 after a 20% discount. What was the original price?", "25"]];
for (const prompt of ["Answer with just the number after ANSWER:", "Think step by step, then give the final number after ANSWER:"]) {
  const results = await Promise.all(problems.map(([q, e]) => run(prompt, q, e)));
  console.log(prompt.slice(0, 30), results.filter((r) => r.ok).length / results.length, results.reduce((s, r) => s + r.tokens, 0));
}`
  } },
llm_api: { task: "Write a minimal chat program in the terminal: keep a list of messages, append the user input and the assistant reply each turn, and print the token usage after each reply. Watch the input tokens grow as the conversation gets longer. (Take the current model id from the provider docs; the examples use the Anthropic Messages API, and OpenAI's API works the same way.)",
  code: {
    pseudo: R`history = []
loop:
    input = read a line from the user; stop if empty
    add {role: "user", content: input} to history
    response = HTTP POST https://api.anthropic.com/v1/messages
        headers: x-api-key, anthropic-version, content-type: application/json
        body: { model, max_tokens: 512, system: "Answer briefly.", messages: history }
    reply = response.content[0].text
    add {role: "assistant", content: reply} to history
    print reply, response.usage.input_tokens, response.usage.output_tokens
// The API remembers nothing: the whole history is sent every time.`,
    python: R`import anthropic  # pip install anthropic; set ANTHROPIC_API_KEY

client = anthropic.Anthropic()
history = []
while (text := input("> ")):
    history.append({"role": "user", "content": text})
    r = client.messages.create(model="<model-id>", max_tokens=512,
                               system="Answer briefly.", messages=history)
    reply = r.content[0].text
    history.append({"role": "assistant", "content": reply})
    print(reply, f"\n[in {r.usage.input_tokens} / out {r.usage.output_tokens}]")`,
    ts: R`// Node 18+. Set ANTHROPIC_API_KEY.
import * as readline from "node:readline/promises";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const history: { role: "user" | "assistant"; content: string }[] = [];
while (true) {
  const text = await rl.question("> ");
  if (!text) break;
  history.push({ role: "user", content: text });
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "<model-id>", max_tokens: 512, system: "Answer briefly.", messages: history }),
  });
  const json = await res.json();
  const reply = json.content[0].text;
  history.push({ role: "assistant", content: reply });
  console.log(reply + "\n[in " + json.usage.input_tokens + " / out " + json.usage.output_tokens + "]");
}
rl.close();`
  } },
prompting: { task: "Write a small prompt builder with parts for role, context, task, examples and output format that renders XML-tagged sections. Use it to build a prompt that classifies support tickets into billing, bug or feature.",
  code: {
    pseudo: R`parts = []
add "You are a support triage assistant for Acme Store."
add "<task>Classify the ticket into exactly one of: billing, bug, feature. If unsure, answer: unsure.</task>"
add "<example><input>I was charged twice</input><output>billing</output></example>"
add "<example><input>The export button crashes</input><output>bug</output></example>"
add "<format>Answer with one lowercase word only.</format>"
prompt = join parts with blank lines
print prompt`,
    python: R`class PromptBuilder:
    def __init__(self): self.parts = []
    def role(self, r): self.parts.append(f"You are {r}."); return self
    def context(self, c): self.parts.append(f"<context>\n{c}\n</context>"); return self
    def task(self, t): self.parts.append(f"<task>\n{t}\n</task>"); return self
    def example(self, i, o): self.parts.append(f"<example>\n<input>{i}</input>\n<output>{o}</output>\n</example>"); return self
    def format(self, f): self.parts.append(f"<format>\n{f}\n</format>"); return self
    def build(self): return "\n\n".join(self.parts)

prompt = (PromptBuilder()
          .role("a support triage assistant for Acme Store")
          .task("Classify the ticket into exactly one of: billing, bug, feature. If unsure, answer: unsure.")
          .example("I was charged twice", "billing")
          .example("The export button crashes", "bug")
          .format("Answer with one lowercase word only.")
          .build())
print(prompt)`,
    ts: R`class PromptBuilder {
  private parts: string[] = [];
  role(r: string) { this.parts.push("You are " + r + "."); return this; }
  context(c: string) { this.parts.push("<context>\n" + c + "\n</context>"); return this; }
  task(t: string) { this.parts.push("<task>\n" + t + "\n</task>"); return this; }
  example(i: string, o: string) { this.parts.push("<example>\n<input>" + i + "</input>\n<output>" + o + "</output>\n</example>"); return this; }
  format(f: string) { this.parts.push("<format>\n" + f + "\n</format>"); return this; }
  build() { return this.parts.join("\n\n"); }
}
console.log(new PromptBuilder()
  .role("a support triage assistant for Acme Store")
  .task("Classify the ticket into exactly one of: billing, bug, feature. If unsure, answer: unsure.")
  .example("I was charged twice", "billing")
  .example("The export button crashes", "bug")
  .format("Answer with one lowercase word only.")
  .build());`
  } },
vector_db: { task: "Build an in-memory vector store with <code>upsert(id, vector, metadata)</code> and <code>search(query, k, filter)</code> using cosine similarity. Then write the same query for Postgres with the pgvector extension.",
  code: {
    pseudo: R`rows = empty dictionary                       // id → (vector, metadata)
function upsert(id, vector, metadata): rows[id] = (vector, metadata)
function search(query, k, filter):
    candidates = rows where filter(metadata) is true (or all rows if no filter)
    score each candidate with cosine(query, vector)
    return the k ids with the highest scores
// SQL with pgvector:
// SELECT id FROM chunks WHERE tenant_id = 42 ORDER BY embedding <=> :q LIMIT 5;`,
    python: R`import math

class InMemoryVectorStore:
    def __init__(self): self.rows = {}
    def upsert(self, id, vec, meta): self.rows[id] = (vec, meta)
    def search(self, q, k, filter=None):
        scored = [(id, _cos(q, v)) for id, (v, m) in self.rows.items() if filter is None or filter(m)]
        return sorted(scored, key=lambda t: t[1], reverse=True)[:k]

def _cos(a, b):
    d = sum(x * y for x, y in zip(a, b))
    return d / math.sqrt(sum(x * x for x in a) * sum(y * y for y in b))

store = InMemoryVectorStore()
store.upsert("doc1", [0.9, 0.1], {"lang": "en"})
store.upsert("doc2", [0.2, 0.8], {"lang": "es"})
print(store.search([1, 0], k=1, filter=lambda m: m["lang"] == "en"))
# pgvector:  SELECT id FROM chunks WHERE tenant_id = 42 ORDER BY embedding <=> %s LIMIT 5;`,
    ts: R`type Meta = Record<string, string>;
class InMemoryVectorStore {
  private rows = new Map<string, { vec: number[]; meta: Meta }>();
  upsert(id: string, vec: number[], meta: Meta) { this.rows.set(id, { vec, meta }); }
  search(q: number[], k: number, filter?: (m: Meta) => boolean) {
    return [...this.rows].filter(([, r]) => !filter || filter(r.meta))
      .map(([id, r]) => [id, cos(q, r.vec)] as const).sort((a, b) => b[1] - a[1]).slice(0, k);
  }
}
function cos(a: number[], b: number[]) {
  let d = 0, na = 0, nb = 0;
  a.forEach((x, i) => { d += x * b[i]; na += x * x; nb += b[i] * b[i]; });
  return d / Math.sqrt(na * nb);
}
const store = new InMemoryVectorStore();
store.upsert("doc1", [0.9, 0.1], { lang: "en" });
store.upsert("doc2", [0.2, 0.8], { lang: "es" });
console.log(store.search([1, 0], 1, (m) => m.lang === "en"));
// pgvector:  SELECT id FROM chunks WHERE tenant_id = 42 ORDER BY embedding <=> $1 LIMIT 5;`
  } },
rag: { task: "Write <code>chunk(text, size, overlap)</code> that splits text into overlapping groups of words, and <code>buildRagPrompt(question, chunks)</code> that numbers the chunks as [1], [2]… inside <code>&lt;documents&gt;</code> and tells the model to cite them and say \"I don't know\" if the answer is not there.",
  code: {
    pseudo: R`function chunk(text, size, overlap):
    words = split text by spaces
    start = 0
    while start < number of words:
        yield words[start .. start + size] joined with spaces
        if start + size >= number of words: stop
        start = start + size - overlap

function buildRagPrompt(question, chunks):
    docs = for each chunk i: "[i] " + chunk    (numbered from 1)
    return "Answer using ONLY the documents. Cite sources like [1]. If the answer is not in them, say \"I don't know\"."
           + "<documents>" + docs + "</documents>" + "<question>" + question + "</question>"`,
    python: R`def chunk(text, size, overlap):
    words = text.split()
    start = 0
    while start < len(words):
        yield " ".join(words[start:start + size])
        if start + size >= len(words):
            break
        start += size - overlap

def build_rag_prompt(question, chunks):
    docs = "\n".join(f"[{i + 1}] {c}" for i, c in enumerate(chunks))
    return ("Answer using ONLY the documents. Cite sources like [1]. "
            "If the answer is not in them, say \"I don't know\".\n"
            f"<documents>\n{docs}\n</documents>\n<question>{question}</question>")

chunks = list(chunk("one two three four five six seven eight nine ten", size=4, overlap=1))
print(build_rag_prompt("What comes after three?", chunks))`,
    ts: R`function* chunk(text: string, size: number, overlap: number) {
  const words = text.split(/\s+/).filter(Boolean);
  for (let start = 0; start < words.length; start += size - overlap) {
    yield words.slice(start, start + size).join(" ");
    if (start + size >= words.length) return;
  }
}
function buildRagPrompt(question: string, chunks: string[]) {
  const docs = chunks.map((c, i) => "[" + (i + 1) + "] " + c).join("\n");
  return "Answer using ONLY the documents. Cite sources like [1]. If the answer is not in them, say \"I don't know\".\n" +
    "<documents>\n" + docs + "\n</documents>\n<question>" + question + "</question>";
}
console.log(buildRagPrompt("What comes after three?", [...chunk("one two three four five six seven eight nine ten", 4, 1)]));`
  } },
tool_use: { task: "Write a tool registry: each tool has a name, a description, a JSON Schema for its input and a function that runs it. Register <code>get_order</code> and <code>search_docs</code>. Write <code>dispatch(name, inputJson)</code> that runs the tool, or returns a helpful error message if the tool doesn't exist or the input is wrong.",
  code: {
    pseudo: R`tools = {
  get_order:   { description: "Get one order by numeric id. Use when the user mentions an order number.",
                 schema: {type: object, properties: {id: {type: integer}}, required: [id]},
                 run: input → '{"id": input.id, "status": "shipped"}' },
  search_docs: { description: "Search help-center articles. Returns titles and short snippets.",
                 schema: {type: object, properties: {query: {type: string}}, required: [query]},
                 run: input → '["Reset password", "Export invoices"]' } }

function dispatch(name, inputJson):
    if name not in tools: return "ERROR: unknown tool " + name + ". Available: " + list of tool names
    try: return tools[name].run(parse JSON(inputJson))
    on error e: return "ERROR: " + e + ". Check the input schema."
// The error text goes back to the model, so make it helpful.`,
    python: R`import json

tools = {
    "get_order": {
        "description": "Get one order by numeric id. Use when the user mentions an order number.",
        "input_schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]},
        "run": lambda inp: json.dumps({"id": inp["id"], "status": "shipped"}),
    },
    "search_docs": {
        "description": "Search help-center articles. Returns titles and short snippets.",
        "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
        "run": lambda inp: json.dumps(["Reset password", "Export invoices"]),
    },
}

def dispatch(name, input_json):
    tool = tools.get(name)
    if tool is None:
        return f"ERROR: unknown tool '{name}'. Available: {', '.join(tools)}"
    try:
        return tool["run"](json.loads(input_json))
    except Exception as e:
        return f"ERROR: {e!r}. Check the input schema: {json.dumps(tool['input_schema'])}"

print(dispatch("get_order", '{"id": 42}'))
print(dispatch("get_order", '{}'))
print(dispatch("delete_everything", '{}'))`,
    ts: R`type Tool = { description: string; inputSchema: object; run: (input: any) => Promise<string> };
const tools: Record<string, Tool> = {
  get_order: {
    description: "Get one order by numeric id. Use when the user mentions an order number.",
    inputSchema: { type: "object", properties: { id: { type: "integer" } }, required: ["id"] },
    run: async (input) => { if (typeof input.id !== "number") throw new Error("id must be a number"); return JSON.stringify({ id: input.id, status: "shipped" }); },
  },
  search_docs: {
    description: "Search help-center articles. Returns titles and short snippets.",
    inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    run: async () => JSON.stringify(["Reset password", "Export invoices"]),
  },
};
async function dispatch(name: string, inputJson: string): Promise<string> {
  const tool = tools[name];
  if (!tool) return "ERROR: unknown tool '" + name + "'. Available: " + Object.keys(tools).join(", ");
  try { return await tool.run(JSON.parse(inputJson)); }
  catch (e) { return "ERROR: " + (e as Error).message + ". Check the input schema: " + JSON.stringify(tool.inputSchema); }
}
console.log(await dispatch("get_order", '{"id": 42}'));
console.log(await dispatch("get_order", "{}"));`
  } },
agents: { task: "Implement a minimal agent loop with a <b>mock</b> model (so it runs offline): the model returns either a tool call or a final answer. Loop up to <code>maxSteps</code>, run tools, add each result to the history, and stop on a final answer or when the limit is reached. Then swap the mock for a real API.",
  code: {
    pseudo: R`script = [call run_tests, call read_file("cart.py"), call edit_file("use >= instead of >"),
          call run_tests, final "Fixed an off-by-one bug in the cart total."]   // the mock model

function runAgent(goal, maxSteps = 10):
    history = ["GOAL: " + goal]
    for step from 1 to maxSteps:
        decision = model.next(history)                  // mock: next item of script
        if decision is final: return decision.answer
        result = runTool(decision.name, decision.input)
        add "CALL " + decision.name + " -> " + result to history
    return "Stopped: max steps reached."`,
    python: R`script = [("tool", "run_tests", ""), ("tool", "read_file", "cart.py"),
          ("tool", "edit_file", "cart.py: use >= instead of >"), ("tool", "run_tests", ""),
          ("final", "Fixed an off-by-one bug in the cart total.", None)]

class ScriptedModel:  # mock LLM: pretends to fix a failing test
    def __init__(self): self.i = 0
    def next(self, history):
        step = script[min(self.i, len(script) - 1)]
        self.i += 1
        return step

runs = 0
def run_tool(name, inp):
    global runs
    if name == "run_tests":
        runs += 1
        return "1 failed: test_total_includes_last_item" if runs == 1 else "all 12 passed"
    return {"read_file": "for i in range(0, n - 1): ...", "edit_file": "ok"}.get(name, f"ERROR unknown tool {name}")

def run_agent(model, goal, max_steps=10):
    history = [f"GOAL: {goal}"]
    for step in range(1, max_steps + 1):
        kind, name, inp = model.next(history)
        if kind == "final":
            return name
        obs = run_tool(name, inp)
        history.append(f"CALL {name}({inp}) -> {obs}")
        print(f"step {step}: {name} -> {obs}")
    return "Stopped: max steps reached."

print(run_agent(ScriptedModel(), "Make the tests pass"))`,
    ts: R`type Step = { kind: "tool"; name: string; input: string } | { kind: "final"; answer: string };
const script: Step[] = [
  { kind: "tool", name: "run_tests", input: "" }, { kind: "tool", name: "read_file", input: "cart.ts" },
  { kind: "tool", name: "edit_file", input: "cart.ts: use >= instead of >" }, { kind: "tool", name: "run_tests", input: "" },
  { kind: "final", answer: "Fixed an off-by-one bug in the cart total." },
];
let i = 0;
const mockModel = async (_history: string[]): Promise<Step> => script[Math.min(i++, script.length - 1)];

let runs = 0;
function runTool(name: string, _input: string): string {
  if (name === "run_tests") return ++runs === 1 ? "1 failed: total includes last item" : "all 12 passed";
  return ({ read_file: "for (let i = 0; i > items.length; i++) ...", edit_file: "ok" } as Record<string, string>)[name] ?? "ERROR unknown tool " + name;
}
async function runAgent(goal: string, maxSteps = 10): Promise<string> {
  const history = ["GOAL: " + goal];
  for (let step = 1; step <= maxSteps; step++) {
    const s = await mockModel(history);
    if (s.kind === "final") return s.answer;
    const obs = runTool(s.name, s.input);
    history.push("CALL " + s.name + "(" + s.input + ") -> " + obs);
    console.log("step " + step + ": " + s.name + " -> " + obs);
  }
  return "Stopped: max steps reached.";
}
console.log(await runAgent("Make the tests pass"));`
  } },
multi_agent: { task: "Implement fan-out/fan-in: an orchestrator splits 6 research questions across subagents, runs at most 3 at the same time, each a mock task that waits 0.5 s, then combines the results. Compare the total time with running them one after another.",
  code: {
    pseudo: R`questions = ["Question 1", ..., "Question 6"]
limit = 3                                   // at most 3 subagents at once
function subagent(q): wait 0.5 seconds; return "answer to " + q     // replace with a real agent
start timer
results = run subagent(q) for all questions in parallel, max 3 at a time
print number of results, elapsed time      // ~1 s instead of ~3 s sequentially
synthesis = combine results (in reality: another LLM call that merges and cites)`,
    python: R`import asyncio, time

async def subagent(q, gate):
    async with gate:              # at most 3 at once
        await asyncio.sleep(0.5)  # replace with a real agent call
        return f"answer to {q}"

async def main():
    gate = asyncio.Semaphore(3)
    questions = [f"Question {i}" for i in range(1, 7)]
    t = time.perf_counter()
    results = await asyncio.gather(*(subagent(q, gate) for q in questions))
    print(len(results), "results in", round(time.perf_counter() - t, 2), "s (sequential ≈ 3 s)")
    synthesis = "\n".join(results)  # in reality: another LLM call that merges and cites

asyncio.run(main())`,
    ts: R`const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => { while (next < items.length) { const i = next++; results[i] = await fn(items[i]); } };
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}
const questions = Array.from({ length: 6 }, (_, i) => "Question " + (i + 1));
const t = Date.now();
const results = await mapLimit(questions, 3, async (q) => { await sleep(500); return "answer to " + q; }); // replace with real agents
console.log(results.length + " results in " + (Date.now() - t) + " ms (sequential ≈ 3000 ms)");`
  } },
mcp: { task: "Build a local (stdio) MCP server with one tool <code>count_todos(path)</code> that counts TODO comments in the code files under a folder. Register it in an MCP-capable app (for example Claude Code, Claude Desktop, VS Code or Cursor) and ask the assistant to use it. SDK APIs change between versions, so copy the exact imports from the SDK README.",
  code: {
    pseudo: R`server = new MCP server named "todo-counter"
register tool "count_todos":
    description: "Counts TODO comments in all code files under a folder. Returns 'file: count' lines."
    input: { path: string }        // described with a JSON Schema
    run: for each code file under path: count lines containing "TODO"; return "file: count" lines
start the server on stdio          // the AI app launches it and talks JSON-RPC over stdin/stdout
// Never print logs to stdout: stdout is reserved for protocol messages.`,
    python: R`# pip install mcp   (Python SDK 2.x; see the SDK README for your version)
from pathlib import Path
from mcp.server import MCPServer

mcp = MCPServer("todo-counter")

@mcp.tool()
def count_todos(path: str) -> str:
    """Counts TODO comments in all code files under a folder. Returns 'file: count' lines."""
    lines = []
    for f in Path(path).rglob("*"):
        if f.suffix in {".py", ".ts", ".js", ".cs", ".java", ".go"} and f.is_file():
            n = sum("TODO" in line for line in f.read_text(errors="ignore").splitlines())
            if n:
                lines.append(f"{f}: {n}")
    return "\n".join(lines) or "No TODOs found."

if __name__ == "__main__":
    mcp.run()  # stdio by default`,
    ts: R`// npm install @modelcontextprotocol/server zod   (TypeScript SDK 2.x; see the SDK README for your version)
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const server = new McpServer({ name: "todo-counter", version: "1.0.0" });
server.registerTool("count_todos", {
  description: "Counts TODO comments in all code files under a folder. Returns 'file: count' lines.",
  inputSchema: z.object({ path: z.string() }),
}, async ({ path }) => {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if ([".py", ".ts", ".js", ".cs"].includes(extname(p))) {
        const n = readFileSync(p, "utf8").split("\n").filter((l) => l.includes("TODO")).length;
        if (n) out.push(p + ": " + n);
      }
    }
  };
  walk(path);
  return { content: [{ type: "text", text: out.join("\n") || "No TODOs found." }] };
});
await server.connect(new StdioServerTransport()); // logs must go to stderr, never stdout`
  } },
evals: { task: "Write an eval runner: a list of cases (input + a check function), run the system under test 3 times per case, and print the pass rate with a 95% margin of error <code>±1.96·√(p(1−p)/n)</code>. Use the ticket classifier prompt from \"Prompting\" as the system (a fake classifier is shown so it runs offline).",
  code: {
    pseudo: R`cases = [("I was charged twice", expect "billing"), ("App crashes on export", expect "bug"),
         ("Please add dark mode", expect "feature")]
pass = 0; total = 0
for each case: repeat 3 times:
    output = system(case.input)          // the real LLM call
    total = total + 1
    if case.check(output): pass = pass + 1 else print "FAIL", case.input, output
p = pass / total
margin = 1.96 * square root of (p * (1 - p) / total)
print "pass rate", p, "±", margin`,
    python: R`import math

cases = [("I was charged twice", lambda o: o.strip() == "billing"),
         ("App crashes on export", lambda o: o.strip() == "bug"),
         ("Please add dark mode", lambda o: o.strip() == "feature")]

def system(text):  # fake classifier; replace with the real LLM call
    return "billing" if "charged" in text else "bug"

def report(system, cases, runs=3):
    passed = total = 0
    for inp, check in cases:
        for _ in range(runs):
            out = system(inp)
            total += 1
            if check(out): passed += 1
            else: print("FAIL:", inp, "->", out)
    p = passed / total
    margin = 1.96 * math.sqrt(p * (1 - p) / total)
    print(f"pass rate {p:.0%} ± {margin:.0%} (n={total})")

report(system, cases)`,
    ts: R`type EvalCase = { input: string; check: (output: string) => boolean };
const cases: EvalCase[] = [
  { input: "I was charged twice", check: (o) => o.trim() === "billing" },
  { input: "App crashes on export", check: (o) => o.trim() === "bug" },
  { input: "Please add dark mode", check: (o) => o.trim() === "feature" },
];
const system = async (text: string) => (text.includes("charged") ? "billing" : "bug"); // replace with the real LLM call

async function report(runs = 3) {
  let pass = 0, total = 0;
  for (const c of cases) for (let r = 0; r < runs; r++) {
    const out = await system(c.input);
    total++;
    if (c.check(out)) pass++; else console.log("FAIL: " + c.input + " -> " + out);
  }
  const p = pass / total, margin = 1.96 * Math.sqrt((p * (1 - p)) / total);
  console.log("pass rate " + (p * 100).toFixed(0) + "% ± " + (margin * 100).toFixed(0) + "% (n=" + total + ")");
}
await report();`
  } },
safety: { task: "Write a tool policy. Each tool has capability flags: reads private data, reads untrusted content, sends data externally, irreversible. Track what the current session has touched. Block an external-send tool if the session already touched both private data and untrusted content (the \"lethal trifecta\"), and require human approval for irreversible or external actions.",
  code: {
    pseudo: R`seen = empty set                                // capabilities this session has touched
function check(tool, caps):
    after = seen + caps
    if after contains private AND untrusted AND external: return BLOCK     // lethal trifecta
    if caps contains irreversible or external: return REQUIRE_APPROVAL
    seen = after
    return ALLOW
check("read_inbox", {private})      // ALLOW
check("fetch_url", {untrusted})     // ALLOW
check("send_email", {external})     // BLOCK`,
    python: R`from enum import Flag, auto

class Cap(Flag):
    NONE = 0
    PRIVATE = auto()
    UNTRUSTED = auto()
    EXTERNAL = auto()
    IRREVERSIBLE = auto()

class ToolPolicy:
    def __init__(self): self.seen = Cap.NONE
    def check(self, tool, caps):
        after = self.seen | caps
        trifecta = Cap.PRIVATE in after and Cap.UNTRUSTED in after and Cap.EXTERNAL in after
        if trifecta:
            return "BLOCK"
        if Cap.IRREVERSIBLE in caps or Cap.EXTERNAL in caps:
            return "REQUIRE_APPROVAL"
        self.seen = after
        return "ALLOW"

policy = ToolPolicy()
print(policy.check("read_inbox", Cap.PRIVATE))    # ALLOW
print(policy.check("fetch_url", Cap.UNTRUSTED))   # ALLOW
print(policy.check("send_email", Cap.EXTERNAL))   # BLOCK (trifecta)`,
    ts: R`const Cap = { Private: 1, Untrusted: 2, External: 4, Irreversible: 8 } as const;
type Decision = "ALLOW" | "REQUIRE_APPROVAL" | "BLOCK";

class ToolPolicy {
  private seen = 0;
  check(tool: string, caps: number): Decision {
    const after = this.seen | caps;
    const trifecta = (after & Cap.Private) && (after & Cap.Untrusted) && (after & Cap.External);
    if (trifecta) return "BLOCK";
    if (caps & (Cap.Irreversible | Cap.External)) return "REQUIRE_APPROVAL";
    this.seen = after;
    return "ALLOW";
  }
}
const policy = new ToolPolicy();
console.log(policy.check("read_inbox", Cap.Private));   // ALLOW
console.log(policy.check("fetch_url", Cap.Untrusted));  // ALLOW
console.log(policy.check("send_email", Cap.External));  // BLOCK (trifecta)`
  } },
cost: { task: "Write a usage meter that records (feature, input tokens, output tokens, cached tokens) from each API response and computes cost using configurable prices per million tokens. Print the cost per feature at the end of a run.",
  code: {
    pseudo: R`prices = { input: 3, output: 15, cachedInput: 0.3 }   // USD per million tokens (example only)
byFeature = empty dictionary
function record(feature, input, output, cached):
    cost = (input - cached) * prices.input / 1,000,000
         + cached * prices.cachedInput / 1,000,000
         + output * prices.output / 1,000,000
    byFeature[feature] = byFeature[feature] + cost
record("triage", 1200, 5, 1000)
record("agent-fix", 45000, 2500, 30000)
print byFeature`,
    python: R`from collections import defaultdict

class UsageMeter:
    def __init__(self, input_per_m, output_per_m, cached_per_m):
        self.p = (input_per_m, output_per_m, cached_per_m)
        self.by_feature = defaultdict(float)

    def record(self, feature, inp, out, cached=0):
        pin, pout, pcache = self.p
        self.by_feature[feature] += ((inp - cached) * pin + cached * pcache + out * pout) / 1_000_000

    def print(self):
        for f, c in self.by_feature.items():
            print(f"{f}: {c:.4f} USD")

meter = UsageMeter(3, 15, 0.3)  # example prices only; check your provider's pricing page
meter.record("triage", 1200, 5, cached=1000)
meter.record("agent-fix", 45000, 2500, cached=30000)
meter.print()`,
    ts: R`class UsageMeter {
  private byFeature = new Map<string, number>();
  constructor(private inputPerM: number, private outputPerM: number, private cachedPerM: number) {}
  record(feature: string, input: number, output: number, cached = 0) {
    const cost = ((input - cached) * this.inputPerM + cached * this.cachedPerM + output * this.outputPerM) / 1_000_000;
    this.byFeature.set(feature, (this.byFeature.get(feature) ?? 0) + cost);
  }
  print() { for (const [f, c] of this.byFeature) console.log(f + ": " + c.toFixed(4) + " USD"); }
}
const meter = new UsageMeter(3, 15, 0.3); // example prices only
meter.record("triage", 1200, 5, 1000);
meter.record("agent-fix", 45000, 2500, 30000);
meter.print();`
  } }
});
