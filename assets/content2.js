/* part 2: ML basics, neural networks, embeddings, tokens, transformers */
addConcept({
  id: "ml_basics", title: "Machine learning basics", es: "fundamentos de aprendizaje automático",
  group: "ml", prereqs: ["model", "probability", "optimization"], minutes: 20,
  summary: "Learn from examples, check on data the model never saw. Train/validation/test splits, overfitting vs underfitting, and the three big families of ML.",
  why: "Training vs test data and overfitting explain why models fail in the real world and how to measure them honestly.",
  body: `
<h3>The idea in one sentence</h3>
<p>[[Machine learning|aprendizaje automático]] = choose a model shape, train its parameters on examples, and check it on <b>new</b> examples to make sure it learned the pattern, not the answers.</p>
<h3>Three families</h3>
<ul>
<li>[[Supervised learning|aprendizaje supervisado]]: examples have the correct answer (label). "This email → spam". LLM pretraining is a kind of this: the label is simply the next token.</li>
<li>[[Unsupervised learning|aprendizaje no supervisado]]: no labels; find structure (clusters, similar items).</li>
<li>[[Reinforcement learning|aprendizaje por refuerzo]]: an agent acts and receives rewards. Used in RLHF and reasoning models.</li>
</ul>
<h3>Splits and overfitting</h3>
<p>Split the data: [[training set|conjunto de entrenamiento]] (to learn), [[validation set|conjunto de validación]] (to choose settings), [[test set|conjunto de prueba]] (final honest score, used once).</p>
<p>[[Overfitting|sobreajuste]]: the model memorizes training examples, including noise, and fails on new ones. [[Underfitting|subajuste]]: the model is too simple to capture the pattern. Move the slider: a very flexible curve has tiny training error but big test error.</p>
<h3>Analogy</h3>
<p>Overfitting is a student who memorizes the answers to last year's exam instead of learning the subject: perfect on the practice test, lost on the real one. The test set is the real exam the model has never seen.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Overfitting is like writing code that passes the unit tests by hard-coding the expected values (<code>if (input == 42) return 7;</code>). The test set is the hidden integration test suite your code has never seen.</div>`,
  viz: "overfit",
  resources: [
    { t: "Getting started with scikit-learn (official)", u: "https://scikit-learn.org/stable/getting_started.html", type: "docs", note: "Python's standard ML library: fit, predict, train/test split in a few lines." },
    { t: "Datasets, generalization, and overfitting — Google ML Crash Course", u: "https://developers.google.com/machine-learning/crash-course/overfitting", type: "reading", note: "Clear diagrams of train/test curves." },
    { t: "ML.NET documentation (Microsoft Learn)", u: "https://learn.microsoft.com/en-us/dotnet/machine-learning/", lang: "csharp", type: "docs", note: "Classic ML in C#: regression, classification, AutoML." }
  ],
  quiz: [
    { q: "Training error is very low but test error is high. This is…", options: ["Underfitting", "Overfitting", "Perfect learning", "A bug in the GPU"], a: 1, why: "The model memorized training data and does not generalize." },
    { q: "Why keep a test set the model never sees during training?", options: ["To save memory", "To get an honest estimate of performance on new data", "Because it is required by law", "To make training faster"], a: 1, why: "Scoring on training data is like grading students on questions they already saw." },
    { q: "Learning to play a game from wins and losses is…", options: ["Supervised", "Unsupervised", "Reinforcement learning", "Tokenization"], a: 2, why: "Rewards instead of labels." },
    { q: "LLM pretraining (predict the next token) is closest to…", options: ["Supervised learning with labels taken from the text itself", "Pure rules", "Unsupervised clustering", "Manual labeling of every sentence"], a: 0, why: "Often called self-supervised: the text provides its own labels." }
  ],
  exercise: { lang: "C#", task: "Write <code>Split&lt;T&gt;(IList&lt;T&gt; data, double testFraction, int seed)</code> that shuffles and returns (train, test). Then, with ML.NET (optional, <code>dotnet add package Microsoft.ML</code>), train a regression on the apartment data and print R² on the test set.",
    code: R`static (List<T> Train, List<T> Test) Split<T>(IList<T> data, double testFraction, int seed)
{
    var rng = new Random(seed);
    var shuffled = data.OrderBy(_ => rng.Next()).ToList();
    int testCount = (int)Math.Round(shuffled.Count * testFraction);
    return (shuffled.Skip(testCount).ToList(), shuffled.Take(testCount).ToList());
}

// Optional ML.NET:
// var ml = new MLContext(seed: 1);
// var split = ml.Data.TrainTestSplit(dataView, testFraction: 0.2);
// var pipeline = ml.Transforms.Concatenate("Features", "Size").Append(ml.Regression.Trainers.Sdca());
// var model = pipeline.Fit(split.TrainSet);
// var metrics = ml.Regression.Evaluate(model.Transform(split.TestSet));
// Console.WriteLine(metrics.RSquared);`, solution: "" }
});

addConcept({
  id: "neural_nets", title: "Neural networks", es: "redes neuronales",
  group: "ml", prereqs: ["ml_basics", "vectors"], minutes: 25,
  summary: "A neuron = weighted sum + bias + a simple bend (activation). Stack many in layers (matrix multiplications) and you can approximate almost any function.",
  why: "Neural networks are the building block of all modern AI, including language models.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[neural network|red neuronal]] is many tiny functions (neurons) connected in layers; each neuron computes a weighted sum of its inputs and then bends it with an activation function.</p>
<h3>One neuron</h3>
<pre class="formula">output = activation( w1·x1 + w2·x2 + … + b )</pre>
<p>That weighted sum is a dot product (from "Vectors"). The [[bias|sesgo]] <code>b</code> shifts it. The [[activation function|función de activación]] adds a bend: <b>ReLU</b> = <code>max(0, z)</code>, <b>sigmoid</b> squashes to 0..1. Without bends, many layers would collapse into one straight line.</p>
<h3>Layers</h3>
<p>A [[layer|capa]] is many neurons reading the same inputs = one matrix × vector, then activation. A [[deep|profunda]] network has many layers: early layers find simple patterns, later layers combine them into complex ones. Every weight is a parameter that training adjusts with gradient descent.</p>
<h3>Analogy</h3>
<p>A neural network is an assembly line: each station (layer) takes the previous station's output, transforms it a little using its own adjustable settings, and passes it on. Nobody writes the rules; the settings are learned.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> A network is a LINQ pipeline: <code>input.Select(layer1).Select(layer2).Select(layer3)</code>, where each layer's lambda has learned numbers inside. The program is in the weights, not in the code.</div>
<p class="tip">Open the <a href="https://playground.tensorflow.org/" target="_blank" rel="noopener">TensorFlow Playground</a> and train a tiny network in your browser.</p>`,
  viz: "neuron",
  resources: [
    { t: "But what is a neural network? | Deep learning chapter 1 — 3Blue1Brown", u: "https://www.youtube.com/watch?v=aircAruvnKk", type: "video", note: "The classic. Watch the whole series playlist later." },
    { t: "A Neural Network Playground (TensorFlow)", u: "https://playground.tensorflow.org/", type: "reading", note: "Interactive: add layers, see it learn." },
    { t: "Neural networks playlist — 3Blue1Brown", u: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", type: "video", note: "Chapters 1–7, from neurons to transformers." }
  ],
  quiz: [
    { q: "What does one neuron compute?", options: ["A database lookup", "activation(weighted sum of inputs + bias)", "The average of all weights", "A random number"], a: 1, why: "Dot product + bias, then a non-linear bend." },
    { q: "Why do we need activation functions like ReLU?", options: ["To make the network faster", "Without them, stacked layers collapse into one linear function", "To store data", "To tokenize text"], a: 1, why: "Linear of linear is still linear; the bends give expressive power." },
    { q: "A whole layer of neurons is computed as…", options: ["A matrix × vector, then activation", "A SQL join", "A sorting algorithm", "A hash table"], a: 0, why: "Each row of the weight matrix is one neuron." },
    { q: "ReLU(−2) = ?", options: ["−2", "0", "2", "1"], a: 1, why: "ReLU(z) = max(0, z)." }
  ],
  exercise: { lang: "C#", task: "Implement a 2-2-1 network that computes XOR using these hand-picked weights. Check all four inputs. (Training would find weights like these automatically.)",
    code: R`static double Relu(double z) => Math.Max(0, z);
static double Neuron(double[] x, double[] w, double b) => Relu(x[0] * w[0] + x[1] * w[1] + b);

static double Xor(double a, double b)
{
    var x = new[] { a, b };
    double h1 = Neuron(x, new[] { 1.0, 1.0 }, 0);    // a + b
    double h2 = Neuron(x, new[] { 1.0, 1.0 }, -1);   // only fires when both are 1
    return h1 - 2 * h2;                              // output layer (no activation)
}

foreach (var (a, b) in new[] { (0, 0), (0, 1), (1, 0), (1, 1) })
    Console.WriteLine($"{a} XOR {b} = {Xor(a, b)}");`, solution: "" }
});

addConcept({
  id: "backprop", title: "Backpropagation", es: "retropropagación",
  group: "ml", prereqs: ["neural_nets", "optimization"], minutes: 30,
  summary: "Backprop computes the slope of the loss for every weight in one backward pass, by passing 'blame' from the output back through each operation (the chain rule).",
  why: "Backpropagation is the algorithm that makes training big networks possible. Understanding it demystifies \"learning\".",
  body: `
<h3>The idea in one sentence</h3>
<p>[[Backpropagation|retropropagación]] is an efficient way to compute the gradient: run the network forward, then walk backward and tell each weight how much it contributed to the error.</p>
<h3>Explanation</h3>
<p>Nudging every weight one at a time (like in "Optimization") would need billions of forward passes. Instead we record the [[computation graph|grafo de cómputo]] — every +, ×, ReLU — during the forward pass. Then we go backward with one simple rule for each operation:</p>
<ul>
<li>For <code>c = a + b</code>: the gradient of c flows unchanged to a and to b.</li>
<li>For <code>c = a × b</code>: a receives <code>b × grad(c)</code>, b receives <code>a × grad(c)</code>.</li>
<li>Chain them: the [[chain rule|regla de la cadena]] says "multiply the local slopes along the path". If a path splits, add the contributions.</li>
</ul>
<p>Libraries like PyTorch do this automatically ([[autograd|diferenciación automática]]). You almost never write it by hand — but knowing it explains things like "vanishing gradients" and why training needs so much memory (it keeps the forward values).</p>
<h3>Analogy</h3>
<p>A team project scored badly. Working backwards from the final grade, you work out how much each person's part contributed to the problem and tell each one how to adjust. Backprop does this for every weight in the network, all at once.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Think of a distributed trace of a slow request: total latency is known at the top, and you attribute it back to each span. Backprop attributes the <i>error</i> back to each weight.</div>`,
  viz: "compgraph",
  resources: [
    { t: "Backpropagation, intuitively | Deep Learning Chapter 3 — 3Blue1Brown", u: "https://www.youtube.com/watch?v=Ilg3gGewQ5U", type: "video", note: "Intuition first; chapter 4 has the calculus (optional)." },
    { t: "The spelled-out intro to neural networks and backpropagation: building micrograd — Andrej Karpathy", u: "https://www.youtube.com/watch?v=VMj-3S1tku0", type: "video", note: "2.5 h, Python. The best hands-on explanation; port it to C# as you watch." },
    { t: "Calculus on Computational Graphs: Backpropagation — colah's blog", u: "https://colah.github.io/posts/2015-08-Backprop/", type: "reading", note: "Short, with diagrams of the graph." }
  ],
  quiz: [
    { q: "For c = a × b with a = 3, b = 4, and grad(c) = 1, what is grad(a)?", options: ["3", "4", "12", "1"], a: 1, why: "grad(a) = b × grad(c) = 4." },
    { q: "For c = a + b, how does the gradient flow?", options: ["It is split in half", "It is copied unchanged to both a and b", "Only to a", "It becomes zero"], a: 1, why: "Addition is a 'gradient distributor'." },
    { q: "Why is backprop better than nudging each weight separately?", options: ["It gets all gradients in one backward pass", "It uses less data", "It does not need a loss", "It avoids GPUs"], a: 0, why: "Cost ≈ one extra pass instead of one pass per weight." },
    { q: "What does PyTorch's autograd do?", options: ["Writes your prompts", "Builds the computation graph and computes gradients automatically", "Downloads data", "Tokenizes text"], a: 1, why: "You define the forward pass; .backward() does the rest." }
  ],
  exercise: { lang: "C#", task: "Port Karpathy's micrograd idea: a <code>Value</code> class that supports + and × and a <code>Backward()</code>. Verify for <code>L = (a*b + c) * f</code> with a=2, b=−3, c=10, f=−2 that grad(a) = 6. (Python note: the original micrograd is Python; this C# version is the same idea.)",
    code: R`var a = new Value(2); var b = new Value(-3); var c = new Value(10); var f = new Value(-2);
var L = (a * b + c) * f; L.Backward();
Console.WriteLine($"L={L.Data} da={a.Grad} db={b.Grad} dc={c.Grad} df={f.Grad}"); // da=6 db=-4 dc=-2 df=4

public sealed class Value
{
    public double Data; public double Grad;
    private readonly Value[] _parents; private Action _backward = () => { };
    public Value(double data, params Value[] parents) { Data = data; _parents = parents; }

    public static Value operator +(Value a, Value b)
    { var o = new Value(a.Data + b.Data, a, b); o._backward = () => { a.Grad += o.Grad; b.Grad += o.Grad; }; return o; }
    public static Value operator *(Value a, Value b)
    { var o = new Value(a.Data * b.Data, a, b); o._backward = () => { a.Grad += b.Data * o.Grad; b.Grad += a.Data * o.Grad; }; return o; }

    public void Backward()
    {
        var order = new List<Value>(); var seen = new HashSet<Value>();
        void Visit(Value v) { if (!seen.Add(v)) return; foreach (var p in v._parents) Visit(p); order.Add(v); }
        Visit(this); Grad = 1;
        for (int i = order.Count - 1; i >= 0; i--) order[i]._backward();
    }
}`, solution: "" }
});

addConcept({
  id: "embeddings", title: "Embeddings", es: "embeddings (representaciones vectoriales)",
  group: "llm", prereqs: ["vectors", "model"], minutes: 20,
  summary: "An embedding turns text (or code, images) into a vector so that similar meanings are close together. Compare them with cosine similarity.",
  why: "Embeddings power semantic search, recommendations and RAG, and they are the first thing a language model does with text.",
  body: `
<h3>The idea in one sentence</h3>
<p>An [[embedding|embedding: vector que representa el significado]] is a list of numbers that represents the meaning of something; things with similar meaning get vectors that point in similar directions.</p>
<h3>Explanation</h3>
<ul>
<li>An [[embedding model|modelo de embeddings]] is a neural network trained so that related texts end up close. "How do I reset my password?" and "I forgot my login" get high cosine similarity even with no shared words.</li>
<li>Typical sizes: 384 to 3072 dimensions. The visualization shows a 2D toy so you can see it; real ones have hundreds of axes and no axis has a simple human name.</li>
<li>Inside LLMs, the first step turns each token ID into an embedding vector (a lookup table of learned vectors).</li>
<li>Famous word2vec example: <code>king − man + woman ≈ queen</code>. Directions can carry meaning.</li>
</ul>
<p><b>Uses:</b> semantic search, RAG, deduplication, clustering, recommendation, classification with few examples.</p>
<h3>Analogy</h3>
<p>Embeddings are coordinates on a map of meaning: words or sentences with similar meanings get placed near each other, like cities in the same region. Distance on the map ≈ difference in meaning.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> It's like <code>GetHashCode()</code>, but the opposite goal: a hash spreads similar inputs far apart; an embedding puts similar inputs close together. In .NET, <code>IEmbeddingGenerator&lt;string, Embedding&lt;float&gt;&gt;</code> from Microsoft.Extensions.AI produces them.</div>`,
  viz: "embed",
  resources: [
    { t: "The Illustrated Word2vec — Jay Alammar", u: "https://jalammar.github.io/illustrated-word2vec/", type: "reading", note: "The best visual intro to embeddings." },
    { t: "Embeddings — Google ML Crash Course", u: "https://developers.google.com/machine-learning/crash-course/embeddings", type: "reading", note: "Short modules with exercises." },
    { t: "How embeddings extend your AI model's reach — .NET (Microsoft Learn)", u: "https://learn.microsoft.com/en-us/dotnet/ai/conceptual/embeddings", lang: "csharp", type: "docs", note: "The .NET point of view." }
  ],
  quiz: [
    { q: "Two texts have embeddings with cosine similarity 0.92. This means…", options: ["They are probably about very similar things", "They share 92% of words", "One is 92% longer", "Nothing"], a: 0, why: "High cosine = vectors point the same way = similar meaning." },
    { q: "Can two sentences with no common words have similar embeddings?", options: ["No, never", "Yes — embeddings capture meaning, not exact words", "Only in English", "Only if they have the same length"], a: 1, why: "That is the main advantage over keyword search." },
    { q: "king − man + woman ≈ ?", options: ["prince", "queen", "man", "kingdom"], a: 1, why: "The classic word2vec analogy." },
    { q: "How is an embedding different from a hash code?", options: ["Hashes keep similar inputs close; embeddings spread them", "Embeddings keep similar meanings close; hashes spread similar inputs apart", "They are the same", "Embeddings are always 32-bit"], a: 1, why: "Opposite goals." }
  ],
  exercise: { lang: "C#", task: "Given a small dictionary of toy word vectors, write <code>Nearest(string word, int k)</code> using cosine similarity, and an <code>Analogy(a, b, c)</code> that returns the word closest to <code>b − a + c</code>. Bonus: replace the toy vectors with a real embedding API call.",
    code: R`var vecs = new Dictionary<string, double[]>
{
    ["king"] = new[] { 0.9, 0.8, 0.1 }, ["queen"] = new[] { 0.9, 0.1, 0.8 },
    ["man"]  = new[] { 0.1, 0.9, 0.1 }, ["woman"] = new[] { 0.1, 0.1, 0.9 },
    ["apple"] = new[] { -0.8, 0.1, 0.1 },
};
static double Cos(double[] a, double[] b) { double d = 0, na = 0, nb = 0; for (int i = 0; i < a.Length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; } return d / Math.Sqrt(na * nb); }

IEnumerable<(string Word, double Score)> Nearest(double[] q, int k, params string[] exclude) =>
    vecs.Where(kv => !exclude.Contains(kv.Key)).Select(kv => (kv.Key, Cos(q, kv.Value))).OrderByDescending(t => t.Item2).Take(k);

double[] Sub(double[] a, double[] b) => a.Zip(b, (x, y) => x - y).ToArray();
double[] Add(double[] a, double[] b) => a.Zip(b, (x, y) => x + y).ToArray();
var target = Add(Sub(vecs["king"], vecs["man"]), vecs["woman"]);
Console.WriteLine(Nearest(target, 1, "king", "man", "woman").First()); // (queen, ...)`, solution: "" }
});

addConcept({
  id: "tokenization", title: "Tokenization", es: "tokenización",
  group: "llm", prereqs: ["vars_functions"], minutes: 20,
  summary: "Models read tokens — frequent chunks of text — not letters or words. Token counts decide cost, speed and context limits, and explain some weird LLM mistakes.",
  why: "Models read tokens, not characters or words. Tokens decide cost, context limits and some strange model mistakes.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[tokenizer|tokenizador]] cuts text into [[tokens|tokens: pedacitos de texto]] (frequent pieces like <code>"ing"</code>, <code>" the"</code>, <code>"Console"</code>) and maps each one to an integer ID; the model only ever sees those IDs.</p>
<h3>Explanation</h3>
<ul>
<li>Most LLMs use [[Byte-Pair Encoding (BPE)|codificación por pares de bytes]]: start from single characters (bytes), find the most frequent adjacent pair in a big corpus, merge it into a new token, repeat tens of thousands of times. The visualization runs this algorithm live.</li>
<li>Rule of thumb for English: 1 token ≈ 4 characters ≈ ¾ of a word. Spanish and code often use <b>more tokens</b> per word, so they cost more.</li>
<li>Why LLMs struggle to count letters in "strawberry" or reverse strings: they see tokens like <code>"str" "aw" "berry"</code>, not letters.</li>
<li>Everything is measured in tokens: price, the [[context window|ventana de contexto]] limit, and output speed (tokens per second).</li>
</ul>
<h3>Analogy</h3>
<p>Like breaking text into LEGO bricks: common words are a single big brick, rare words are built from several small ones. The set of bricks (the vocabulary) is learned from lots of text.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Like a lexer in a compiler (Roslyn turns source into tokens before parsing), but the vocabulary is learned from data, not defined by a grammar.</div>
<p class="tip">Try real tokenizers in <a href="https://tiktokenizer.vercel.app/" target="_blank" rel="noopener">Tiktokenizer</a>. Paste a code snippet and a paragraph in another language (not English) and compare the counts.</p>`,
  viz: "tokenizer",
  resources: [
    { t: "Let's build the GPT Tokenizer — Andrej Karpathy", u: "https://www.youtube.com/watch?v=zduSFxRajkE", type: "video", note: "2 h, Python. Watch the first 30 minutes for the big picture." },
    { t: "Byte-Pair Encoding tokenization — Hugging Face LLM Course", u: "https://huggingface.co/learn/llm-course/chapter6/5", type: "reading", note: "Step-by-step BPE example." },
    { t: "Understanding tokens — .NET (Microsoft Learn)", u: "https://learn.microsoft.com/en-us/dotnet/ai/conceptual/understanding-tokens", lang: "csharp", type: "docs", note: "Tokens explained for .NET developers." }
  ],
  quiz: [
    { q: "What does the model actually receive as input?", options: ["Raw characters", "Integer token IDs", "Whole sentences", "Audio"], a: 1, why: "Text → tokens → IDs → embedding vectors." },
    { q: "Roughly how many tokens is 400 characters of English?", options: ["≈ 10", "≈ 100", "≈ 400", "≈ 1600"], a: 1, why: "≈ 4 characters per token." },
    { q: "Why can LLMs fail to count the r's in 'strawberry'?", options: ["They see multi-letter tokens, not individual letters", "They cannot do math at all", "The word is too long", "Because of temperature"], a: 0, why: "The letters are hidden inside tokens." },
    { q: "What does BPE do repeatedly?", options: ["Deletes rare words", "Merges the most frequent adjacent pair into a new token", "Translates to English", "Sorts the vocabulary alphabetically"], a: 1, why: "Each merge adds one vocabulary entry." }
  ],
  exercise: { lang: "C#", task: "Implement one BPE training step: given a list of token lists, count adjacent pairs, find the most frequent, and merge it everywhere. Run 10 steps on <code>\"low lower lowest newer wider\"</code> and print the merges.",
    code: R`static List<List<string>> MergeStep(List<List<string>> words, out (string, string)? merged)
{
    var counts = new Dictionary<(string, string), int>();
    foreach (var w in words)
        for (int i = 0; i < w.Count - 1; i++)
            counts[(w[i], w[i + 1])] = counts.GetValueOrDefault((w[i], w[i + 1])) + 1;
    if (counts.Count == 0) { merged = null; return words; }
    var best = counts.MaxBy(kv => kv.Value).Key; merged = best;
    return words.Select(w =>
    {
        var res = new List<string>();
        for (int i = 0; i < w.Count; i++)
            if (i < w.Count - 1 && (w[i], w[i + 1]) == best) { res.Add(w[i] + w[i + 1]); i++; }
            else res.Add(w[i]);
        return res;
    }).ToList();
}

var words = "low lower lowest newer wider".Split(' ').Select(w => w.Select(c => c.ToString()).ToList()).ToList();
for (int s = 0; s < 10; s++) { words = MergeStep(words, out var m); Console.WriteLine($"merge {s + 1}: {m}"); }`, solution: "" }
});

addConcept({
  id: "next_token", title: "Language models: next-token prediction", es: "modelos de lenguaje: predecir el próximo token",
  group: "llm", prereqs: ["probability", "tokenization", "model"], minutes: 20,
  summary: "An LLM takes the tokens so far and outputs a probability for every possible next token. Generation = pick one, append it, repeat. Temperature controls how adventurous the pick is.",
  why: "Every LLM answer is produced one token at a time. This explains streaming, temperature, and why models can confidently say wrong things.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[language model|modelo de lenguaje]] is a function: <code>tokens so far → probability of each possible next token</code>. To write text, you call it in a loop.</p>
<h3>Explanation</h3>
<ol>
<li>The model outputs one raw score per vocabulary token, called [[logits|logits: puntajes crudos antes de normalizar]].</li>
<li>[[Softmax|softmax: convierte puntajes en probabilidades]] turns logits into probabilities: <code>p_i = e^(logit_i / T) / sum of all e^(logit_j / T)</code>. (<code>e^x</code> just makes everything positive and exaggerates differences.)</li>
<li>Pick a token ([[decoding|decodificación]]): always the top one ([[greedy|codicioso]]), or sample. [[Temperature|temperatura]] T &lt; 1 sharpens the distribution (safer, repetitive); T &gt; 1 flattens it (creative, more errors). [[Top-p|top-p: muestrear solo entre los más probables]] keeps only the most likely tokens that add up to p.</li>
<li>Append the token and repeat until a stop token or <code>max_tokens</code>. This is [[autoregressive|autorregresivo]] generation — one token at a time, which is why output is slower and pricier than input.</li>
</ol>
<p><b>Important consequence:</b> the model produces <i>plausible</i> continuations, not checked facts. [[Hallucinations|alucinaciones: respuestas inventadas que suenan bien]] are plausible text that happens to be false.</p>
<h3>Analogy</h3>
<p>Phone keyboard autocomplete, scaled up enormously: suggest the next word, add it, suggest again. A whole essay is written one piece at a time, each piece chosen from a list of likely options.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Generation is an <code>IAsyncEnumerable&lt;string&gt;</code> with <code>yield return</code>: each iteration calls the model with everything produced so far. That is exactly what streaming APIs give you.</div>`,
  viz: "temperature",
  resources: [
    { t: "Large Language Models explained briefly — 3Blue1Brown", u: "https://www.youtube.com/watch?v=LPZh9BOjkQs", type: "video", note: "If you skipped it in 'What is a model?', watch it now." },
    { t: "How to generate text: decoding methods — Hugging Face blog", u: "https://huggingface.co/blog/how-to-generate", type: "reading", note: "Greedy, beam search, top-k, top-p, with examples." },
    { t: "What Is ChatGPT Doing … and Why Does It Work? — Stephen Wolfram", u: "https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/", type: "reading", note: "Section on temperature and 'why not always the top word'." }
  ],
  quiz: [
    { q: "What does an LLM output at each step?", options: ["A whole paragraph", "A probability for every token in the vocabulary", "A SQL query", "Only one word, deterministically"], a: 1, why: "Then a decoding strategy picks one token." },
    { q: "Temperature = 0 (or greedy) means…", options: ["Always pick the most likely token", "Pick randomly among all tokens", "The model is turned off", "Use more GPU"], a: 0, why: "Low temperature = deterministic-ish, focused output." },
    { q: "Why are output tokens slower than input tokens?", options: ["They are generated one at a time in a loop", "They are bigger", "They are encrypted", "They are not"], a: 0, why: "Input is processed in parallel; output is autoregressive." },
    { q: "A hallucination is best explained as…", options: ["A bug in the API", "Plausible-looking text that is not true", "A tokenizer error", "Too much temperature only"], a: 1, why: "The objective is 'likely text', not 'true text'." }
  ],
  exercise: { lang: "C#", task: "Implement <code>Softmax(double[] logits, double temperature)</code>, then a generation loop over a tiny bigram table (next word depends only on the previous word). Generate 8 words at T = 0.2, 1.0 and 2.0 and compare.",
    code: R`static double[] Softmax(double[] logits, double t)
{
    var max = logits.Max();
    var exps = logits.Select(l => Math.Exp((l - max) / t)).ToArray(); // subtract max for numeric stability
    var sum = exps.Sum();
    return exps.Select(e => e / sum).ToArray();
}

var table = new Dictionary<string, (string[] Next, double[] Logits)>
{
    ["the"] = (new[] { "cat", "dog", "code" }, new[] { 2.0, 1.5, 0.2 }),
    ["cat"] = (new[] { "sat", "ran", "the" }, new[] { 2.0, 1.0, 0.1 }),
    ["dog"] = (new[] { "ran", "sat", "the" }, new[] { 1.8, 0.7, 0.1 }),
    ["sat"] = (new[] { "the" }, new[] { 1.0 }), ["ran"] = (new[] { "the" }, new[] { 1.0 }), ["code"] = (new[] { "the" }, new[] { 1.0 }),
};
var rng = new Random(7);
foreach (var T in new[] { 0.2, 1.0, 2.0 })
{
    var word = "the"; var output = new List<string> { word };
    for (int i = 0; i < 8; i++)
    {
        var (next, logits) = table[word]; var p = Softmax(logits, T);
        double r = rng.NextDouble(), acc = 0; int k = 0;
        for (; k < p.Length - 1; k++) { acc += p[k]; if (r < acc) break; }
        word = next[k]; output.Add(word);
    }
    Console.WriteLine($"T={T}: {string.Join(' ', output)}");
}`, solution: "" }
});

addConcept({
  id: "attention", title: "Attention", es: "atención (mecanismo de atención)",
  group: "llm", prereqs: ["embeddings", "next_token"], minutes: 30,
  summary: "Attention lets every token look at the other tokens and pull in the information it needs. It is a soft dictionary lookup: query vs keys → weights → blend of values.",
  why: "Attention is the key idea behind transformers — how a model uses context to decide what each word means.",
  body: `
<h3>The idea in one sentence</h3>
<p>[[Attention|atención]] lets each token ask "which earlier tokens are relevant to me?" and mix their information into its own vector.</p>
<h3>Explanation</h3>
<p>In "The animal didn't cross the street because <b>it</b> was too tired", the vector for <i>it</i> must get information from <i>animal</i>. For every token, the model computes three vectors with learned matrices:</p>
<ul>
<li>[[Query|consulta]] (Q): what am I looking for?</li>
<li>[[Key|clave]] (K): what do I contain?</li>
<li>[[Value|valor]] (V): what will I give if you pick me?</li>
</ul>
<p>Score = dot(Q of this token, K of each other token) / √d → softmax → weights that add up to 1 → output = weighted sum of the V vectors. That is the heatmap: each row is one token, each cell is how much it attends to another token.</p>
<ul>
<li>[[Causal mask|máscara causal]]: in GPT-style models a token can only look at tokens <b>before</b> it (it can't read the future it is trying to predict).</li>
<li>[[Multi-head attention|atención multi-cabeza]]: many attention "heads" run in parallel, each learning a different kind of relation (grammar, coreference, code brackets…).</li>
<li>Cost: every token compares with every other token, so cost grows with the <b>square</b> of the context length. This is one reason long contexts are expensive.</li>
</ul>
<h3>Analogy</h3>
<p>Reading the sentence "The cat sat on the mat because it was tired", you look back to figure out what "it" means. Attention lets every word look at the earlier words and decide how much each one matters to it — a soft lookup that blends information from the most relevant words.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> A <code>Dictionary&lt;K,V&gt;</code> lookup returns the value whose key matches exactly. Attention is a <i>soft</i> lookup: every key matches a little, and you get a blend of all values weighted by how well each key matches your query.</div>
<p class="warn">The heatmap weights here are hand-made to illustrate the idea, not taken from a real model.</p>`,
  viz: "attention",
  resources: [
    { t: "Attention in transformers, step-by-step | Deep Learning Chapter 6 — 3Blue1Brown", u: "https://www.youtube.com/watch?v=eMlx5fFNoYc", type: "video", note: "The clearest visual explanation of Q, K, V." },
    { t: "The Illustrated Transformer — Jay Alammar", u: "https://jalammar.github.io/illustrated-transformer/", type: "reading", note: "Famous step-by-step diagrams; read the self-attention part." },
    { t: "Transformer Explainer (interactive, Georgia Tech)", u: "https://poloclub.github.io/transformer-explainer/", type: "reading", note: "Live GPT-2 in your browser; click into the attention." }
  ],
  quiz: [
    { q: "In attention, the score between two tokens is computed from…", options: ["Query · Key", "Value · Value", "Token ID difference", "Random noise"], a: 0, why: "Dot product of the query of one token and the key of another." },
    { q: "Why does a GPT-style model use a causal mask?", options: ["To save memory only", "So a token cannot look at future tokens it must predict", "To hide private data", "To remove stop words"], a: 1, why: "Otherwise training would be 'cheating'." },
    { q: "Attention cost grows with context length n roughly as…", options: ["n", "n² (every token vs every token)", "log n", "It does not grow"], a: 1, why: "An n×n score matrix." },
    { q: "What is multi-head attention?", options: ["Several attention computations in parallel, each learning different relations", "Using several GPUs", "Several users chatting", "A bigger tokenizer"], a: 0, why: "Each head has its own Q, K, V matrices." }
  ],
  exercise: { lang: "C#", task: "Implement scaled dot-product attention for small arrays: <code>Attend(double[][] Q, double[][] K, double[][] V, bool causal)</code>. Print the weight matrix for 3 tokens and check each row adds up to 1 and that causal rows have zeros above the diagonal.",
    code: R`static double[][] Attend(double[][] Q, double[][] K, double[][] V, bool causal, out double[][] weights)
{
    int n = Q.Length, d = Q[0].Length;
    weights = new double[n][]; var output = new double[n][];
    for (int i = 0; i < n; i++)
    {
        var scores = new double[n];
        for (int j = 0; j < n; j++)
            scores[j] = (causal && j > i) ? double.NegativeInfinity
                      : Enumerable.Range(0, d).Sum(t => Q[i][t] * K[j][t]) / Math.Sqrt(d);
        var max = scores.Max(); var exps = scores.Select(s => Math.Exp(s - max)).ToArray(); var sum = exps.Sum();
        weights[i] = exps.Select(e => e / sum).ToArray();
        output[i] = new double[V[0].Length];
        for (int j = 0; j < n; j++) for (int t = 0; t < V[0].Length; t++) output[i][t] += weights[i][j] * V[j][t];
    }
    return output;
}`, solution: "" }
});

addConcept({
  id: "transformers", title: "The Transformer architecture", es: "la arquitectura Transformer",
  group: "llm", prereqs: ["attention", "neural_nets", "backprop"], minutes: 30,
  summary: "Embed tokens, add position info, pass through N blocks of (attention + small neural network) with shortcuts, then turn the last vector into next-token probabilities.",
  why: "The transformer is the architecture behind ChatGPT, Claude, Gemini and nearly every modern language model.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[Transformer|Transformer]] is a stack of identical blocks; each block lets tokens share information (attention) and then lets each token "think" alone (a small neural network called the MLP).</p>
<h3>The pipeline (decoder-only, like GPT, Claude, Llama)</h3>
<ol>
<li>Token IDs → [[embedding table|tabla de embeddings]] → one vector per token, plus [[positional information|información de posición]] (otherwise "dog bites man" = "man bites dog").</li>
<li>N blocks (for example 32–100+). Each block: attention → MLP. Each sub-step adds its result to the input ([[residual connection|conexión residual: atajo que suma la entrada]]) and uses [[layer normalization|normalización de capa]] to keep numbers stable.</li>
<li>The final vector of the last token → [[unembedding|desembedding: proyección al vocabulario]] matrix → one logit per vocabulary token → softmax → next-token probabilities.</li>
</ol>
<p><b>Why it won (2017, "Attention Is All You Need"):</b> during training, all positions are processed in parallel on GPUs, unlike older recurrent networks that read one word at a time. That made huge scale possible.</p>
<p>Most parameters live in the MLP layers, which seem to store a lot of the "facts". The calculator below estimates parameter counts from the main dimensions.</p>
<h3>Analogy</h3>
<p>A transformer is a stack of identical study sessions: in each one, words first talk to each other (attention), then each word thinks on its own (feed-forward), and every session adds its notes on top of what was already there (residual connection).</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Each block is like a middleware in the ASP.NET Core pipeline: same interface in and out (a list of vectors), and <code>next()</code> plus the original input are combined — that's the residual connection.</div>`,
  viz: "transformer",
  diagram: `flowchart TB
  T["Token IDs"] --> E["Embedding + position"]
  E --> B1
  subgraph B1["Transformer block × N"]
    direction TB
    N1["LayerNorm"] --> A["Masked multi-head attention"] --> R1(("+ residual"))
    R1 --> N2["LayerNorm"] --> M["MLP (feed-forward)"] --> R2(("+ residual"))
  end
  B1 --> U["Unembedding → logits"] --> S["Softmax → P(next token)"]`,
  resources: [
    { t: "Transformers, the tech behind LLMs | Deep Learning Chapter 5 — 3Blue1Brown", u: "https://www.youtube.com/watch?v=wjZofJX0v4M", type: "video", note: "The full picture with beautiful visuals." },
    { t: "The Illustrated GPT-2 — Jay Alammar", u: "https://jalammar.github.io/illustrated-gpt2/", type: "reading", note: "Decoder-only transformers, step by step." },
    { t: "Let's build GPT: from scratch, in code, spelled out — Andrej Karpathy", u: "https://www.youtube.com/watch?v=kCc8FmEb1nY", type: "video", note: "2 h, Python/PyTorch (necessary here: the ecosystem is Python). Optional deep dive." }
  ],
  quiz: [
    { q: "What are the two main parts of each transformer block?", options: ["Tokenizer and database", "Attention and an MLP (feed-forward network)", "Encoder and compiler", "CPU and GPU"], a: 1, why: "Plus residual connections and normalization." },
    { q: "Why add positional information?", options: ["Attention alone does not know word order", "To save memory", "To make tokens shorter", "For security"], a: 0, why: "Without it, the order of tokens would be invisible." },
    { q: "The key advantage of transformers over older RNNs was…", options: ["They use less data", "Parallel training over all positions on GPUs", "They don't need training", "They are smaller"], a: 1, why: "Parallelism enabled scale." },
    { q: "What does a residual connection do?", options: ["Deletes old tokens", "Adds a block's input to its output (a shortcut)", "Encrypts vectors", "Stops training"], a: 1, why: "It helps gradients flow through very deep stacks." }
  ],
  exercise: { lang: "TypeScript", task: "Write a function that estimates the parameter count of a decoder-only transformer: <code>params ≈ 12·L·d² + V·d</code> (L = layers, d = model width, V = vocab). Check: L=12, d=768, V=50257 should be ≈ 124M (GPT-2 small).",
    code: R`function estimateParams(layers: number, dModel: number, vocab: number): number {
  const perBlock = 12 * dModel * dModel; // ≈ 4d² attention + 8d² MLP
  return layers * perBlock + vocab * dModel; // + token embedding table
}

console.log((estimateParams(12, 768, 50257) / 1e6).toFixed(0) + "M"); // ≈ 124M`, solution: "" }
});
