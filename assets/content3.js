/* part 3: training LLMs + using LLMs + retrieval */
addConcept({
  id: "pretraining", title: "Pretraining", es: "preentrenamiento",
  group: "training", prereqs: ["transformers"], minutes: 25,
  summary: "Train a transformer to predict the next token on trillions of tokens of text. The result is a base model: a powerful 'document completer', not yet an assistant.",
  why: "Pretraining is where a model's knowledge and abilities come from — and why it has a knowledge cutoff.",
  body: `
<h3>The idea in one sentence</h3>
<p>[[Pretraining|preentrenamiento]] = show a transformer trillions of tokens of text and, with gradient descent, make it better and better at predicting the next token.</p>
<h3>Explanation</h3>
<ul>
<li><b>Data:</b> filtered web pages, books, code, papers. Quality filtering and deduplication matter a lot (see FineWeb).</li>
<li><b>Loss:</b> [[cross-entropy|entropía cruzada]] = −log(probability the model gave to the correct next token). If the model gave the right token 0.9 → loss 0.1; if 0.01 → loss 4.6. Average over all tokens.</li>
<li><b>Compute:</b> thousands of GPUs for weeks or months; costs from millions to hundreds of millions of dollars. A useful rule: training FLOPs ≈ 6 × parameters × training tokens.</li>
<li>[[Scaling laws|leyes de escala]]: loss goes down smoothly and predictably as you add parameters, data and compute. That predictability is why labs keep scaling.</li>
<li>The result is a [[base model|modelo base]]: it continues documents. Ask it a question and it may continue with more questions. Making it an assistant is the next step (finetuning).</li>
</ul>
<h3>Analogy</h3>
<p>Karpathy calls the parameters a "lossy zip file of the internet". Pretraining is like a student reading a huge library once, at enormous cost; everything after it (finetuning, prompting) is teaching that well-read student how to behave in a job.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Karpathy calls the parameters a "lossy zip file of the internet". Pretraining is the very expensive <i>compile</i> step; everything after it (finetuning, prompting) is configuration on top of that binary.</div>`,
  viz: "losscurve",
  diagram: `flowchart LR
  W["Web, books, code<br/>(trillions of tokens)"] --> F["Filter + dedupe"] --> TK["Tokenize"] --> TR["Train transformer<br/>predict next token<br/>(weeks on GPUs)"] --> BM["Base model<br/>(document completer)"]`,
  resources: [
    { t: "[1hr Talk] Intro to Large Language Models — Andrej Karpathy", u: "https://www.youtube.com/watch?v=zjkBMFhNj_g", type: "video", note: "The best 1-hour overview of how LLMs are made." },
    { t: "Deep Dive into LLMs like ChatGPT — Andrej Karpathy", u: "https://www.youtube.com/watch?v=7xTGNNLPyMI", type: "video", note: "3.5 h, no code needed. Pretraining → SFT → RL, in detail." },
    { t: "FineWeb: decanting the web for the finest text data at scale — Hugging Face", u: "https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1", type: "reading", note: "How real pretraining data is built." }
  ],
  quiz: [
    { q: "What does pretraining optimize?", options: ["User satisfaction", "Next-token prediction loss on huge text data", "Number of tools", "Response length"], a: 1, why: "Cross-entropy on next-token prediction." },
    { q: "The model gives the correct token probability 1.0. The cross-entropy loss for that token is…", options: ["1", "0", "Infinity", "−1"], a: 1, why: "−log(1) = 0: perfect." },
    { q: "A base model, asked 'What is the capital of France?', might…", options: ["Always answer perfectly like ChatGPT", "Continue the text, e.g. with more quiz questions", "Refuse", "Call a tool"], a: 1, why: "It completes documents; it is not yet trained to be an assistant." },
    { q: "Scaling laws say that…", options: ["Bigger models are always worse", "Loss falls predictably as parameters, data and compute grow", "Data does not matter", "Only GPUs matter"], a: 1, why: "Smooth power-law curves." }
  ],
  exercise: { lang: "C#", task: "(1) Write <code>CrossEntropy(double pCorrect)</code> and average it over a list of predictions. (2) Estimate training compute with <code>6·N·D</code> for N = 7e9 parameters and D = 2e12 tokens, and convert to GPU-days assuming 4e14 useful FLOP/s per GPU.",
    code: R`static double CrossEntropy(double pCorrect) => -Math.Log(pCorrect);

var preds = new[] { 0.9, 0.5, 0.05, 0.7 };
Console.WriteLine($"avg loss = {preds.Average(CrossEntropy):F3}");

double N = 7e9, D = 2e12, flops = 6 * N * D;           // ≈ 8.4e22
double gpuDays = flops / 4e14 / 86_400;
Console.WriteLine($"{flops:E2} FLOPs ≈ {gpuDays:N0} GPU-days");`, solution: "" }
});

addConcept({
  id: "finetuning", title: "Finetuning (SFT & LoRA)", es: "ajuste fino (fine-tuning)",
  group: "training", prereqs: ["pretraining"], minutes: 25,
  summary: "Keep training a pretrained model on a smaller, curated dataset. SFT on example conversations turns a base model into an assistant. LoRA trains small add-on matrices instead of all weights.",
  why: "Finetuning is how general models become chat assistants and specialists. Knowing it helps you decide when to finetune vs prompt vs use RAG.",
  body: `
<h3>The idea in one sentence</h3>
<p>[[Finetuning|ajuste fino]] = continue training an already-pretrained model on a smaller, specific dataset, so it learns a behavior or format.</p>
<h3>Explanation</h3>
<ul>
<li>[[Supervised finetuning (SFT)|ajuste fino supervisado]]: tens of thousands of example conversations (user question → ideal assistant answer), often written by people. Same next-token loss, but now on conversations. This is what turns a base model into a helpful chat assistant.</li>
<li>[[Chat template|plantilla de chat]]: special tokens mark the roles (system / user / assistant). The API "messages" you send are converted into this format.</li>
<li>[[LoRA|LoRA: adaptación de bajo rango]]: instead of changing a big d×d weight matrix, freeze it and train two thin matrices (d×r and r×d, with small r like 8). You train under 1% of the parameters and the adapter file is tiny.</li>
<li><b>When should you finetune?</b> Usually <i>last</i>. First try better prompts, then RAG for knowledge. Finetune for consistent style/format, a narrow task at lower cost with a small model, or latency. Finetuning is bad at adding fresh facts.</li>
</ul>
<h3>Analogy</h3>
<p>Pretraining gives a broadly educated graduate. Finetuning is on-the-job training for one role. LoRA is like giving the graduate a small notebook of job-specific tips instead of retraining their whole brain — cheap, and easy to swap.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> The base model is a big sealed library. SFT is like a fork with new defaults. LoRA is a small <i>decorator</i> around a sealed class: the original stays untouched, and the thin wrapper changes its behavior.</div>`,
  viz: "lora",
  resources: [
    { t: "State of GPT — Andrej Karpathy (Microsoft Build)", u: "https://www.youtube.com/watch?v=bZQun8Y4L2A", type: "video", note: "The training pipeline: pretraining → SFT → reward model → RL." },
    { t: "LoRA: Low-Rank Adaptation of Large Language Models (paper)", u: "https://arxiv.org/abs/2106.09685", type: "reading", note: "Read only the abstract and Figure 1." },
    { t: "PEFT — Hugging Face docs", u: "https://huggingface.co/docs/peft/index", type: "docs", note: "Library for LoRA and other parameter-efficient methods (Python)." }
  ],
  quiz: [
    { q: "What turns a base model into a chat assistant first?", options: ["Tokenization", "Supervised finetuning on example conversations", "A bigger GPU", "RAG"], a: 1, why: "SFT teaches the assistant format and behavior." },
    { q: "Your bot must know company docs that change weekly. Best first approach?", options: ["Finetune every week", "RAG (retrieve the docs at query time)", "Pretrain a new model", "Increase temperature"], a: 1, why: "Finetuning is weak for fresh facts; RAG keeps them up to date." },
    { q: "LoRA trains…", options: ["All weights", "Small low-rank adapter matrices while the original weights stay frozen", "Only the tokenizer", "Nothing"], a: 1, why: "Cheap and small adapters." },
    { q: "With d = 4096 and r = 8, LoRA trains about what fraction of one d×d matrix?", options: ["50%", "≈ 0.4%", "100%", "10%"], a: 1, why: "2·d·r / d² = 2·8/4096 ≈ 0.39%." }
  ],
  exercise: { lang: "C#", task: "Write a converter that turns your support tickets (question, best answer) into a JSONL finetuning file in the common chat format: one line per example, <code>{\"messages\":[{\"role\":\"system\",...},{\"role\":\"user\",...},{\"role\":\"assistant\",...}]}</code>.",
    code: R`using System.Text.Json;
var tickets = new[] { ("How do I reset my password?", "Go to Settings → Security → Reset password."),
                      ("Can I export invoices?", "Yes: Billing → Invoices → Export CSV.") };
using var w = new StreamWriter("train.jsonl");
foreach (var (q, a) in tickets)
{
    var ex = new Example(new[] { new Msg("system", "You are Acme Store support. Be brief."), new Msg("user", q), new Msg("assistant", a) });
    w.WriteLine(JsonSerializer.Serialize(ex));
}

public record Msg(string role, string content);
public record Example(Msg[] messages);`, solution: "" }
});

addConcept({
  id: "rlhf", title: "RLHF & preference tuning", es: "RLHF: refuerzo con feedback humano",
  group: "training", prereqs: ["finetuning", "probability", "ml_basics"], minutes: 25,
  summary: "People compare two answers; a reward model learns their preferences; reinforcement learning pushes the LLM toward answers with higher reward. DPO does it more simply.",
  why: "RLHF and preference tuning turn a text predictor into a helpful, safer assistant. It explains model personality and refusals.",
  body: `
<h3>The idea in one sentence</h3>
<p>[[RLHF|aprendizaje por refuerzo con feedback humano]] teaches the model what people <i>prefer</i>, using comparisons ("A is better than B") instead of perfect example answers.</p>
<h3>Steps</h3>
<ol>
<li>The SFT model writes 2+ answers to the same prompt.</li>
<li>Humans pick the better one. (It is easier to judge than to write a perfect answer.)</li>
<li>Train a [[reward model|modelo de recompensa]]: input (prompt, answer) → a score. It learns so that P(A beats B) = sigmoid(score A − score B) — the Bradley–Terry model, the same idea as Elo ratings in chess. The visualization lets you play the human.</li>
<li>Reinforcement learning (often PPO) updates the LLM to produce answers with higher reward, with a penalty ([[KL penalty|penalización KL: no alejarse mucho del modelo original]]) for drifting too far from the SFT model — otherwise it finds weird answers that "hack" the reward.</li>
</ol>
<ul>
<li>[[DPO|optimización directa de preferencias]]: skips the separate reward model and the RL loop, training directly on preferred/rejected pairs. Simpler and very popular.</li>
<li>[[RLAIF / Constitutional AI|feedback de una IA guiada por principios]]: an AI judges answers using written principles, reducing human labeling (Anthropic).</li>
<li><b>RL with verifiable rewards</b>: for math and code, the reward is simply "did the answer/tests pass?" This is how reasoning models are trained.</li>
</ul>
<h3>Analogy</h3>
<p>Like training a new employee with thousands of 👍/👎 reviews. A "reward model" learns to predict what reviewers like; the employee then practices to please it — while a rule (the KL penalty) stops them from gaming the reviews with weird tricks.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Thousands of code reviews with 👍/👎. The reward model is a linter trained on those reviews; RL is the developer slowly adapting to please the linter — and the KL penalty stops them from gaming it with ugly tricks.</div>`,
  viz: "prefs",
  resources: [
    { t: "Illustrating Reinforcement Learning from Human Feedback (RLHF) — Hugging Face", u: "https://huggingface.co/blog/rlhf", type: "reading", note: "Clear diagrams of the three steps." },
    { t: "RLHF: Reinforcement Learning from Human Feedback — Chip Huyen", u: "https://huyenchip.com/2023/05/02/rlhf.html", type: "reading", note: "Excellent engineering-oriented explanation." },
    { t: "Training language models to follow instructions with human feedback (InstructGPT paper)", u: "https://arxiv.org/abs/2203.02155", type: "reading", note: "The paper behind ChatGPT. Figure 2 is the whole pipeline." }
  ],
  quiz: [
    { q: "What do humans give in RLHF?", options: ["Full perfect answers only", "Comparisons: which of two answers is better", "Token IDs", "GPU time"], a: 1, why: "Ranking is easier and more consistent than writing." },
    { q: "What does the reward model output?", options: ["A score for how good an answer is", "The next token", "A tool call", "An embedding"], a: 0, why: "Used as the RL signal." },
    { q: "Why add a KL penalty?", options: ["To keep the model close to the SFT model and avoid reward hacking", "To speed up tokenization", "To encrypt answers", "To increase temperature"], a: 0, why: "Otherwise it drifts into strange outputs that fool the reward model." },
    { q: "DPO is…", options: ["A new GPU", "A simpler way to train on preference pairs without a separate RL loop", "A tokenizer", "A vector database"], a: 1, why: "Direct Preference Optimization." }
  ],
  exercise: { lang: "C#", task: "Implement Bradley–Terry scores like Elo: start every answer at 0; for each human comparison (winner, loser) do <code>p = sigmoid(s_w − s_l); s_w += lr·(1−p); s_l −= lr·(1−p)</code>. Feed 6 comparisons and print the ranking.",
    code: R`static double Sigmoid(double x) => 1 / (1 + Math.Exp(-x));
var scores = new Dictionary<string, double> { ["A"] = 0, ["B"] = 0, ["C"] = 0 };
var comparisons = new[] { ("A", "B"), ("A", "C"), ("B", "C"), ("A", "B"), ("C", "B"), ("A", "C") };
const double lr = 0.5;
foreach (var (win, lose) in comparisons)
{
    var p = Sigmoid(scores[win] - scores[lose]);   // predicted P(win beats lose)
    scores[win] += lr * (1 - p);
    scores[lose] -= lr * (1 - p);
}
foreach (var (k, v) in scores.OrderByDescending(kv => kv.Value)) Console.WriteLine($"{k}: {v:F2}");`, solution: "" }
});

addConcept({
  id: "reasoning", title: "Reasoning models & chain-of-thought", es: "modelos de razonamiento y cadena de pensamiento",
  group: "training", prereqs: ["rlhf", "prompting"], minutes: 20,
  summary: "Letting a model write out intermediate steps before answering improves hard multi-step tasks. Reasoning models are trained with RL to do this well; you trade tokens, cost and latency for accuracy.",
  why: "Reasoning models think before answering. Knowing when they help (and what they cost) lets you choose the right model.",
  body: `
<h3>The idea in one sentence</h3>
<p>Each token is a fixed amount of computation, so giving the model room to "think in tokens" before the final answer lets it solve harder problems.</p>
<h3>Explanation</h3>
<ul>
<li>[[Chain-of-thought (CoT)|cadena de pensamiento]] prompting (2022): asking for step-by-step reasoning improved math and logic results a lot.</li>
<li><b>Reasoning models</b> (OpenAI o-series, DeepSeek-R1, Claude with extended thinking…) are trained with RL on problems with checkable answers. They learn on their own to plan, check, backtrack and try again inside a long hidden or visible "thinking" section.</li>
<li>A [[thinking budget|presupuesto de pensamiento]] (in tokens) is often a setting. More thinking → usually better on hard tasks, but more cost and latency. For simple tasks it is waste.</li>
<li>For agents: reasoning helps with planning and debugging; a cheap fast model is often better for simple steps (routing, extraction).</li>
</ul>
<h3>Analogy</h3>
<p>The difference between answering a hard math problem in your head instantly and working it out on scratch paper first. Same brain, more steps, better result for hard questions — but slower and more expensive.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> It's the difference between answering in a code review from memory versus writing a small scratch program and running it before answering. Same brain, more steps, better result for hard questions.</div>
<p class="warn">The accuracy curve in the visualization is illustrative (diminishing returns), not a measured benchmark. Cost and latency are real arithmetic from your inputs.</p>`,
  viz: "thinking",
  resources: [
    { t: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (paper)", u: "https://arxiv.org/abs/2201.11903", type: "reading", note: "Read the abstract and Figure 1." },
    { t: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning (paper)", u: "https://arxiv.org/abs/2501.12948", type: "reading", note: "How RL with verifiable rewards creates reasoning behavior." },
    { t: "Deep Dive into LLMs like ChatGPT — Andrej Karpathy", u: "https://www.youtube.com/watch?v=7xTGNNLPyMI", type: "video", note: "The last hour covers RL and 'thinking' models." }
  ],
  quiz: [
    { q: "Why does 'thinking in tokens' help?", options: ["Each token adds computation, so more steps = more compute for the problem", "It makes the model bigger", "It changes the tokenizer", "It doesn't"], a: 0, why: "The model can use earlier tokens as scratch work." },
    { q: "How are reasoning models mainly trained to reason?", options: ["Only by bigger pretraining", "RL with rewards for correct, checkable answers", "By RAG", "By MCP"], a: 1, why: "Verifiable rewards: math answers, passing tests." },
    { q: "When is a large thinking budget a bad idea?", options: ["Hard math proofs", "Simple classification or extraction steps where speed and cost matter", "Complex debugging", "Planning a migration"], a: 1, why: "You pay for every thinking token." }
  ],
  exercise: { lang: "C#", task: "Build a tiny experiment harness: run the same 10 multi-step word problems with two prompts (direct answer vs. 'think step by step, then give the final answer after ANSWER:'), parse the answer, and compare accuracy and total output tokens. Use any LLM API (HttpClient example shown).",
    code: R`// Plug in your API key and a model id from the provider docs.
using System.Net.Http.Json;
using System.Text.Json;

using var http = new HttpClient();
http.DefaultRequestHeaders.Add("x-api-key", Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY"));
http.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
var problems = new[] { new Problem("A shirt costs 20 after a 20% discount. What was the original price?", "25") }; // add 9 more
foreach (var prompt in new[] { "Answer with just the number after ANSWER:", "Think step by step, then give the final number after ANSWER:" })
{
    var results = await Task.WhenAll(problems.Select(p => Run(http, "<model-id>", prompt, p)));
    Console.WriteLine($"{prompt[..30]}  accuracy {results.Count(r => r.ok) / (double)results.Length:P0}  output tokens {results.Sum(r => r.outTokens)}");
}

static async Task<(bool ok, int outTokens)> Run(HttpClient http, string model, string prompt, Problem p)
{
    var body = new { model, max_tokens = 1024, messages = new[] { new { role = "user", content = prompt + "\n\n" + p.Question } } };
    var res = await http.PostAsJsonAsync("https://api.anthropic.com/v1/messages", body);
    var json = await res.Content.ReadFromJsonAsync<JsonElement>();
    var text = json.GetProperty("content")[0].GetProperty("text").GetString() ?? "";
    var answer = text.Split("ANSWER:").Last().Trim();
    return (answer.StartsWith(p.Expected), json.GetProperty("usage").GetProperty("output_tokens").GetInt32());
}

record Problem(string Question, string Expected);`, solution: "" }
});

addConcept({
  id: "llm_api", title: "Calling LLM APIs", es: "llamar a APIs de LLM",
  group: "apps", prereqs: ["web_apis", "next_token"], minutes: 20,
  summary: "Send a list of messages (system, user, assistant) and settings; get text, tool calls and token usage back. The API is stateless: you resend the whole conversation every time.",
  why: "Calling a model from code is the first step from using AI to building with AI.",
  body: `
<h3>The idea in one sentence</h3>
<p>An LLM API is a [[stateless|sin estado]] HTTP endpoint: you send the full conversation plus settings, it returns the next assistant message and how many tokens you used.</p>
<h3>The main pieces</h3>
<ul>
<li><b>Messages with roles:</b> <code>system</code> (rules and persona), <code>user</code>, <code>assistant</code> (previous model answers), plus tool messages.</li>
<li><b>Stateless:</b> the model does not remember anything between calls. "Memory" = your code resending the history. Long chats get slower and pricier every turn.</li>
<li>[[Context window|ventana de contexto]]: max tokens of input + output per call (for example 200k). System prompt + history + tool results + retrieved docs + the answer must all fit.</li>
<li><b>Settings:</b> <code>max_tokens</code>, <code>temperature</code>, stop sequences, [[structured output|salida estructurada en JSON]].</li>
<li><b>Response:</b> content blocks, a [[stop reason|motivo de parada]] (end_turn, max_tokens, tool_use), and <code>usage</code> (input/output tokens) — log these!</li>
<li>[[Streaming|transmisión en vivo]]: get tokens as they are generated (SSE) to show progress.</li>
</ul>
<h3>Analogy</h3>
<p>Every request is a letter to a pen-pal with amnesia: the model remembers nothing between letters, so each letter must include the whole conversation so far. Longer conversations mean longer (and more expensive) letters.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Like a REST API secured with a JWT that carries all the state: the server is stateless, so every request must include everything. In .NET, <code>IChatClient</code> (Microsoft.Extensions.AI) gives you <code>GetResponseAsync</code> / <code>GetStreamingResponseAsync</code> over many providers, with middleware (logging, caching, telemetry) like an <code>HttpClient</code> pipeline.</div>`,
  viz: "context",
  diagram: `sequenceDiagram
  participant App
  participant LLM as LLM API
  App->>LLM: [system, user1]
  LLM-->>App: assistant1 (usage: 120 in / 80 out)
  App->>LLM: [system, user1, assistant1, user2]
  Note over App,LLM: You resend the whole history: input grows every turn
  LLM-->>App: assistant2 (usage: 230 in / 95 out)`,
  resources: [
    { t: "Messages API reference — Claude", u: "https://platform.claude.com/docs/en/api/messages", type: "docs", note: "The request and response format: model, max_tokens, messages, usage." },
    { t: "Developer quickstart — OpenAI API", u: "https://developers.openai.com/api/docs/quickstart", type: "docs", note: "Your first API call in Python, JavaScript or curl." },
    { t: "Anthropic Python SDK", u: "https://github.com/anthropics/anthropic-sdk-python", type: "docs", lang: "python", note: "Official Python client." },
    { t: "OpenAI Node/TypeScript SDK", u: "https://github.com/openai/openai-node", type: "docs", lang: "ts", note: "Official JavaScript/TypeScript client." },
    { t: "Microsoft.Extensions.AI libraries — IChatClient (Microsoft Learn)", u: "https://learn.microsoft.com/en-us/dotnet/ai/microsoft-extensions-ai", lang: "csharp", type: "docs", note: "The idiomatic .NET way to call any LLM." },
    { t: "How I use LLMs — Andrej Karpathy", u: "https://www.youtube.com/watch?v=EWvNQjAaOHw", type: "video", note: "Explains context windows and 'starting a new chat' from the user side." },
    ],
  quiz: [
    { q: "Does the LLM API remember your previous request?", options: ["Yes, always", "No — it is stateless; your code resends the history", "Only on weekends", "Only with temperature 0"], a: 1, why: "Some products add server-side state, but the core model call is stateless." },
    { q: "What must fit inside the context window?", options: ["Only the user's last message", "Input (system + history + tools + docs) plus the output", "Only the output", "The model weights"], a: 1, why: "Everything the model reads and writes in that call." },
    { q: "stop_reason = 'max_tokens' means…", options: ["The answer finished naturally", "The answer was cut off at your limit", "A tool was called", "An error"], a: 1, why: "Raise max_tokens or ask for shorter output." },
    { q: "Why log usage.input_tokens and output_tokens?", options: ["For cost and latency tracking", "It's required by HTTP", "For tokenization", "For nothing"], a: 0, why: "Tokens = money and time." }
  ],
  exercise: { lang: "C#", task: "Write a minimal chat console app with <code>HttpClient</code> against the Anthropic Messages API: keep a <code>List</code> of messages, append the user input and the assistant reply each turn, and print <code>usage</code> after each reply. Watch input tokens grow. (Take the current model id from the provider docs.)",
    code: R`using System.Net.Http.Json; using System.Text.Json;

var http = new HttpClient();
http.DefaultRequestHeaders.Add("x-api-key", Environment.GetEnvironmentVariable("ANTHROPIC_API_KEY"));
http.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
var history = new List<object>();
while (Console.ReadLine() is { Length: > 0 } input)
{
    history.Add(new { role = "user", content = input });
    var res = await http.PostAsJsonAsync("https://api.anthropic.com/v1/messages",
        new { model = "<model-id>", max_tokens = 512, system = "Answer briefly.", messages = history });
    var json = await res.Content.ReadFromJsonAsync<JsonElement>();
    var text = json.GetProperty("content")[0].GetProperty("text").GetString();
    history.Add(new { role = "assistant", content = text });
    var u = json.GetProperty("usage");
    Console.WriteLine($"{text}\n[in {u.GetProperty("input_tokens")} / out {u.GetProperty("output_tokens")}]");
}`, solution: "" }
});

addConcept({
  id: "prompting", title: "Prompting & context engineering", es: "prompting e ingeniería de contexto",
  group: "apps", prereqs: ["llm_api", "chatbot_use"], minutes: 25,
  summary: "Write prompts like a precise spec for a smart new colleague with zero context. Context engineering = choosing the smallest set of high-signal tokens for each call.",
  why: "The prompt and context you send are the biggest lever on output quality — often more than switching models.",
  body: `
<h3>The idea in one sentence</h3>
<p>A good [[prompt|instrucción / consigna]] is a clear spec: who the model is, the context, the exact task, examples, and the output format — and [[context engineering|ingeniería de contexto]] is deciding what information goes into the window at each step.</p>
<h3>Techniques that work</h3>
<ul>
<li><b>Be clear and direct.</b> Say what you want, why, and for whom. Ambiguity → average answers.</li>
<li><b>Give context:</b> the audience, constraints, what "good" looks like.</li>
<li>[[Few-shot examples|ejemplos de muestra]]: 2–5 examples of input → ideal output. Very powerful for format.</li>
<li><b>Structure with tags</b> (e.g. <code>&lt;document&gt;</code>, <code>&lt;rules&gt;</code>) so the model can tell instructions from data.</li>
<li><b>Ask for reasoning</b> before the answer on hard tasks; specify the <b>output format</b> (JSON schema, headings).</li>
<li><b>Give an exit:</b> "If the information is not in the documents, say you don't know."</li>
</ul>
<h3>Context engineering (for agents)</h3>
<p>The context window is a limited budget and models get worse with too much noise. Keep system prompts focused, tools few and well-described, retrieve just-in-time instead of dumping everything, and compact or summarize long histories.</p>
<h3>Analogy</h3>
<p>Writing a prompt is like briefing a brilliant contractor who joined today: they know a lot in general but nothing about your situation. A clear brief with context, examples and the expected format gets great work. And prompts are code: version them and test them.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Writing a prompt is writing a great Jira ticket for a brilliant contractor who joined today. And prompts are code: keep them in version control, review them, and test them with evals.</div>`,
  viz: "promptbuilder",
  resources: [
    { t: "Prompt engineering overview — Claude docs", u: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview", type: "docs", note: "Follow the techniques in order." },
    { t: "Prompt engineering — OpenAI API docs", u: "https://developers.openai.com/api/docs/guides/prompt-engineering", type: "docs", note: "Same ideas, different vocabulary." },
    { t: "Effective context engineering for AI agents — Anthropic", u: "https://www.anthropic.com/research/effective-context-engineering-for-ai-agents", type: "reading", note: "Key reading for agent engineers." }
  ],
  quiz: [
    { q: "What are few-shot examples?", options: ["Short prompts", "A few input→output examples inside the prompt", "A small model", "Fast GPUs"], a: 1, why: "They show the format and style you want." },
    { q: "Why wrap a pasted document in tags like <document>…</document>?", options: ["It looks nice", "It separates data from instructions, helping the model and reducing confusion", "It's required by HTTP", "It compresses tokens"], a: 1, why: "Clear structure, and a first defense against injected text." },
    { q: "Context engineering mainly means…", options: ["Buying a bigger context window", "Choosing the smallest set of high-signal tokens for each step", "Rewriting the tokenizer", "Training the model"], a: 1, why: "Quality over quantity in the window." },
    { q: "Best way to know if a prompt change is better?", options: ["It feels better", "Run an eval set before and after", "Ask the model", "Use more capital letters"], a: 1, why: "See the Evals concept." }
  ],
  exercise: { lang: "C#", task: "Write a <code>PromptBuilder</code> with methods <code>Role()</code>, <code>Context()</code>, <code>Task()</code>, <code>Example(input, output)</code>, <code>Format()</code> and <code>Build()</code> that renders XML-tagged sections. Use it to build a prompt that classifies support tickets into {billing, bug, feature}.",
    code: R`var prompt = new PromptBuilder()
    .Role("a support triage assistant for Acme Store")
    .Task("Classify the ticket into exactly one of: billing, bug, feature. If unsure, answer: unsure.")
    .Example("I was charged twice", "billing")
    .Example("The export button crashes", "bug")
    .Format("Answer with one lowercase word only.")
    .Build();
Console.WriteLine(prompt);

public sealed class PromptBuilder
{
    private readonly List<string> _parts = new();
    public PromptBuilder Role(string r) { _parts.Add($"You are {r}."); return this; }
    public PromptBuilder Context(string c) { _parts.Add($"<context>\n{c}\n</context>"); return this; }
    public PromptBuilder Task(string t) { _parts.Add($"<task>\n{t}\n</task>"); return this; }
    public PromptBuilder Example(string input, string output) { _parts.Add($"<example>\n<input>{input}</input>\n<output>{output}</output>\n</example>"); return this; }
    public PromptBuilder Format(string f) { _parts.Add($"<format>\n{f}\n</format>"); return this; }
    public string Build() => string.Join("\n\n", _parts);
}`, solution: "" }
});

addConcept({
  id: "vector_db", title: "Vector search & vector databases", es: "búsqueda vectorial y bases vectoriales",
  group: "apps", prereqs: ["embeddings", "db_basics"], minutes: 20,
  summary: "Store embeddings with metadata and find the k nearest to a query vector. Exact search compares all rows; ANN indexes like HNSW are much faster with tiny accuracy loss.",
  why: "Vector search lets an AI app find relevant information by meaning, the core of RAG and memory features.",
  body: `
<h3>The idea in one sentence</h3>
<p>[[Vector search|búsqueda vectorial]] = embed the query, then return the stored items whose embeddings are closest (highest cosine similarity).</p>
<h3>Explanation</h3>
<ul>
<li>[[k-nearest neighbors (kNN)|k vecinos más cercanos]]: the top k most similar items. Exact kNN compares the query with every row — fine up to maybe 100k rows.</li>
<li>[[Approximate nearest neighbor (ANN)|vecino más cercano aproximado]] indexes like <b>HNSW</b> (a multi-level graph you walk greedily) find almost the same results orders of magnitude faster.</li>
<li><b>Metadata filters:</b> "only documents of tenant 42, after 2025" — like a WHERE clause next to the similarity search.</li>
<li>[[Hybrid search|búsqueda híbrida]]: combine keyword search (BM25 — great for IDs, error codes, names) with vector search (great for meaning). Usually best in practice.</li>
<li><b>Options:</b> pgvector (Postgres), Azure AI Search, Qdrant, Pinecone, SQL Server's vector type, or an in-memory store for small sets.</li>
</ul>
<h3>Analogy</h3>
<p>A normal index is a phone book: great for finding an exact name. A vector index is a librarian who can find "books similar to this one" — fast, even among millions, by looking only in the right neighborhood.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> A normal B-tree index answers <code>WHERE id = 5</code>. A vector index answers <code>ORDER BY cosine_distance(embedding, @q) LIMIT 5</code>. In .NET, the <code>Microsoft.Extensions.VectorData</code> abstractions let you swap stores like you swap EF Core providers.</div>
<p class="tip">Click anywhere on the plot to move the query and see its nearest neighbors.</p>`,
  viz: "knn",
  resources: [
    { t: "What is a Vector Database & How Does it Work? — Pinecone", u: "https://www.pinecone.io/learn/vector-database/", type: "reading", note: "Covers indexes (HNSW, etc.) clearly." },
    { t: "Vector databases for .NET AI apps (Microsoft Learn)", u: "https://learn.microsoft.com/en-us/dotnet/ai/vector-stores/overview", lang: "csharp", type: "docs", note: "Microsoft.Extensions.VectorData and supported stores." },
    { t: "Qdrant documentation — overview", u: "https://qdrant.tech/documentation/overview/", type: "docs", note: "A popular open-source vector DB; good concept pages." }
  ],
  quiz: [
    { q: "What does a vector DB return for a query?", options: ["Exact keyword matches only", "The k items with the most similar embeddings", "All rows", "A summary"], a: 1, why: "Nearest neighbors by similarity." },
    { q: "Why use HNSW or another ANN index?", options: ["Exact search is impossible", "To avoid comparing the query with every vector, for speed at scale", "To encrypt vectors", "To make vectors bigger"], a: 1, why: "Trade a tiny bit of recall for big speed." },
    { q: "A user searches for error code 'E1042'. Which search is most reliable?", options: ["Pure vector search", "Keyword (or hybrid) search", "Random sampling", "None"], a: 1, why: "Exact identifiers are where keyword search shines." },
    { q: "Metadata filtering is like…", options: ["A WHERE clause combined with the similarity ranking", "A JOIN", "A GROUP BY", "A trigger"], a: 0, why: "Restrict the candidates, then rank by similarity." }
  ],
  exercise: { lang: "C#", task: "Build an <code>InMemoryVectorStore</code> with <code>Upsert(id, vector, metadata)</code> and <code>Search(query, k, Func&lt;metadata,bool&gt;? filter)</code> using cosine similarity. Then write the same query for Postgres + pgvector.",
    code: R`var store = new InMemoryVectorStore();
store.Upsert("doc1", new[] { 0.9f, 0.1f }, new() { ["lang"] = "en" });
store.Upsert("doc2", new[] { 0.2f, 0.8f }, new() { ["lang"] = "es" });
foreach (var hit in store.Search(new[] { 1f, 0f }, k: 1, filter: m => m["lang"] == "en")) Console.WriteLine(hit);
// pgvector:  SELECT id FROM chunks WHERE tenant_id = 42 ORDER BY embedding <=> @q LIMIT 5;

public sealed class InMemoryVectorStore
{
    private readonly Dictionary<string, (float[] Vec, Dictionary<string, string> Meta)> _rows = new();
    public void Upsert(string id, float[] vec, Dictionary<string, string> meta) => _rows[id] = (vec, meta);

    public IEnumerable<(string Id, double Score)> Search(float[] q, int k, Func<Dictionary<string, string>, bool>? filter = null) =>
        _rows.Where(r => filter?.Invoke(r.Value.Meta) ?? true)
             .Select(r => (r.Key, Cos(q, r.Value.Vec)))
             .OrderByDescending(t => t.Item2).Take(k);

    private static double Cos(float[] a, float[] b)
    { double d = 0, na = 0, nb = 0; for (int i = 0; i < a.Length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; } return d / Math.Sqrt(na * nb); }
}`, solution: "" }
});

addConcept({
  id: "rag", title: "RAG: retrieval-augmented generation", es: "RAG: generación aumentada con recuperación",
  group: "apps", prereqs: ["vector_db", "prompting"], minutes: 25,
  summary: "Before answering, search your documents for the relevant pieces and put them in the prompt. The model answers from that context, with citations.",
  why: "RAG lets a model answer from your own, up-to-date documents with citations — one of the most common AI app patterns.",
  body: `
<h3>The idea in one sentence</h3>
<p>[[RAG|generación aumentada con recuperación]] = <b>retrieve</b> relevant text from your data, <b>augment</b> the prompt with it, then let the model <b>generate</b> an answer grounded in it.</p>
<h3>Two pipelines</h3>
<ol>
<li><b>Ingestion (offline):</b> load documents → split into [[chunks|fragmentos]] (e.g. 300–800 tokens, with some overlap) → embed each chunk → store vectors + metadata (source, page, date).</li>
<li><b>Query (online):</b> embed the question → hybrid search top-k → optional [[reranking|reordenamiento con un modelo más preciso]] → build the prompt: rules + chunks with IDs + question → generate with citations.</li>
</ol>
<h3>Why and when</h3>
<ul>
<li>Private or fresh knowledge, without finetuning; answers can cite sources; easy to update (just re-index).</li>
<li><b>Common failures:</b> bad chunking (a table split in half), retrieving the wrong chunks, too many chunks (noise), no "I don't know" rule. Most RAG bugs are <i>retrieval</i> bugs — evaluate retrieval separately.</li>
<li><b>Contextual retrieval</b> (Anthropic): prepend a short explanation of where each chunk comes from before embedding it; improves retrieval a lot.</li>
<li><b>Agentic RAG:</b> give the agent a <code>search</code> tool and let it decide when and what to search (this is what Claude Code does with grep/glob over your repo).</li>
</ul>
<h3>Analogy</h3>
<p>An open-book exam: instead of answering from memory, the model first gets the few most relevant pages from your documents and answers from them, citing where it found the information. Most mistakes come from fetching the wrong pages.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Like a cache-aside read: before computing the answer, fetch the relevant records and pass them in. The LLM is the business logic; retrieval is the data access layer — and most bugs live in the data layer.</div>`,
  viz: "rag",
  resources: [
    { t: "Contextual retrieval — Anthropic", u: "https://www.anthropic.com/research/contextual-retrieval", type: "reading", note: "Practical RAG improvements with numbers." },
    { t: "RAG and generative AI — Azure AI Search (Microsoft Learn)", u: "https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview", type: "docs", note: "The Microsoft stack view of RAG." },
    { t: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (original RAG paper)", u: "https://arxiv.org/abs/2005.11401", type: "reading", note: "Optional: where the name comes from." }
  ],
  quiz: [
    { q: "In RAG, when are documents chunked and embedded?", options: ["During model pretraining", "In an ingestion pipeline before queries (and on updates)", "Never", "Only by the user"], a: 1, why: "Offline indexing, then online retrieval." },
    { q: "The answer is wrong but the right document exists. First thing to check?", options: ["Increase temperature", "Whether retrieval returned the right chunks", "Buy a bigger model", "Change the tokenizer"], a: 1, why: "Most RAG errors are retrieval errors." },
    { q: "Why include chunk IDs in the prompt?", options: ["So the model can cite sources and you can verify", "To save tokens", "It's required", "For encryption"], a: 0, why: "Citations make answers checkable." },
    { q: "Agentic RAG means…", options: ["RAG without an LLM", "The agent has a search tool and decides when/what to retrieve", "Training on retrieved docs", "Using two databases"], a: 1, why: "Retrieval becomes a tool in the agent loop." }
  ],
  exercise: { lang: "C#", task: "Write <code>Chunk(string text, int size, int overlap)</code> (by words) and <code>BuildRagPrompt(question, chunks)</code> that numbers the chunks as <code>[1]</code>, <code>[2]</code>… inside <code>&lt;documents&gt;</code> and tells the model to cite them and say \"I don't know\" if the answer is not there.",
    code: R`static IEnumerable<string> Chunk(string text, int size, int overlap)
{
    var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    for (int start = 0; start < words.Length; start += size - overlap)
    {
        yield return string.Join(' ', words.Skip(start).Take(size));
        if (start + size >= words.Length) yield break;
    }
}

static string BuildRagPrompt(string question, IReadOnlyList<string> chunks)
{
    var docs = string.Join("\n", chunks.Select((c, i) => $"[{i + 1}] {c}"));
    return $"""
        Answer using ONLY the documents. Cite sources like [1]. If the answer is not in them, say "I don't know".
        <documents>
        {docs}
        </documents>
        <question>{question}</question>
        """;
}`, solution: "" }
});
