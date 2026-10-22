/* Arggon Learn, AI track — concept data (part 1: math & ML foundations) */
addConcept({
  id: "model", title: "What is a model?", es: "¿qué es un modelo?",
  group: "foundations", prereqs: ["vars_functions", "math_basics"], minutes: 15,
  summary: "A model is a function with adjustable numbers (parameters). Training finds good numbers; inference is calling the function.",
  why: "Everything in AI is a model. Once you see a model as a function with learned numbers, the rest of this track is about how those numbers are learned and used.",
  body: `
<h3>The idea in one sentence</h3>
<p>A <b>model</b> is a function with some adjustable numbers inside. We choose the numbers so that the function gives good answers on examples.</p>
<h3>Explanation</h3>
<p>Imagine predicting an apartment price from its size: <code>price = w · m2 + b</code>. The function shape is fixed (a line), but <code>w</code> and <code>b</code> are [[parameters|parámetros]].
To know if the numbers are good, we compare predictions with real prices and compute the [[error|error]]. A common score is the
[[mean squared error (MSE)|error cuadrático medio]]: square each error, then average.</p>
<ul>
<li>[[Training|entrenamiento]] = searching for the parameters that make the error small.</li>
<li>[[Inference|inferencia]] = using the model with fixed parameters to answer new inputs. When you call an LLM API, you are doing inference.</li>
</ul>
<p>An LLM is the same idea, scaled up: the function input is text, the output is a guess for the next piece of text, and there are <b>billions</b> of parameters instead of two.</p>
<h3>Analogy</h3>
<p>Think of a recipe with adjustable amounts (how much salt, how long in the oven). Training is a cook who tries the recipe thousands of times, tastes the result against examples of the perfect dish, and adjusts the amounts automatically until it comes out right.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Think of an <code>appsettings.json</code> full of magic numbers that change the behavior of a function. Training is an automatic process that tunes those numbers by testing against thousands of examples — like a CI loop that keeps adjusting config until the tests pass.</div>
<p class="tip">Try the visualization: move <code>w</code> and <code>b</code> to make the error as small as you can. You are doing "training" by hand.</p>`,
  viz: "linefit",
  resources: [
    { t: "Linear regression — Google Machine Learning Crash Course", u: "https://developers.google.com/machine-learning/crash-course/linear-regression", type: "reading", note: "Short, visual, simple English." },
    { t: "Large Language Models explained briefly — 3Blue1Brown", u: "https://www.youtube.com/watch?v=LPZh9BOjkQs", type: "video", note: "8 minutes. See how an LLM is \"a function with billions of parameters\"." }
  ],
  quiz: [
    { q: "What is the difference between training and inference?", options: ["They are the same", "Training finds the parameters; inference uses fixed parameters to answer", "Inference finds parameters; training answers users", "Training only happens on phones"], a: 1, why: "Calling ChatGPT or Claude is inference. Training happened before, at the lab." },
    { q: "Why do we square errors in MSE?", options: ["To make big mistakes count more and remove negative signs", "Because computers prefer squares", "To make numbers smaller", "It is required by the programming language"], a: 0, why: "Squaring makes every error positive and punishes big errors more." },
    { q: "In price = w·m2 + b, which are the parameters?", options: ["price and m2", "w and b", "Only m2", "Only price"], a: 1, why: "m2 is the input, price is the output, w and b are learned." },
    { q: "An LLM is best described as…", options: ["A database of answers", "A function with billions of learned parameters", "A search engine", "A rules engine written by hand"], a: 1, why: "It stores knowledge implicitly in its parameters, not as rows of answers." }
  ],
  exercise: { lang: "C#", task: "Implement <code>LinearModel</code> with <code>Predict</code> and a static <code>Mse</code> that measures error over a dataset. Then try 3 different (w, b) pairs by hand and print which one has the lowest MSE.",
    code: R`var data = new List<(double, double)> { (30, 65000), (45, 88000), (60, 110000), (80, 140000) };
foreach (var m in new[] { new LinearModel(1000, 30000), new LinearModel(1500, 20000), new LinearModel(1400, 23000) })
    Console.WriteLine($"{m} -> MSE {LinearModel.Mse(m, data):N0}");

public sealed record LinearModel(double W, double B)
{
    public double Predict(double x) => W * x + B;

    public static double Mse(LinearModel m, IReadOnlyList<(double X, double Y)> data)
    {
        double sum = 0;
        foreach (var (x, y) in data)
        {
            var err = m.Predict(x) - y;
            sum += err * err;
        }
        return sum / data.Count;
    }
}`, solution: "" }
});

addConcept({
  id: "probability", title: "Basic probability & distributions", es: "probabilidad básica y distribuciones",
  group: "foundations", prereqs: ["math_basics"], minutes: 15,
  summary: "A probability is a number from 0 to 1. A distribution gives a probability to every possible outcome and they add up to 1. An LLM outputs a distribution over the next token.",
  why: "Language models don't output answers, they output probabilities over the next token. Temperature, sampling and evals all need this idea.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[probability|probabilidad]] is a number between 0 (never) and 1 (always); a [[distribution|distribución]] lists all possible outcomes with their probabilities, and they add up to 1.</p>
<h3>Explanation</h3>
<ul>
<li><b>Example:</b> a fair die: each face has probability 1/6 ≈ 0.167. All six add up to 1.</li>
<li>[[Sampling|muestrear: elegir al azar según las probabilidades]]: picking an outcome at random, respecting the probabilities. Do it many times and the counts approach the probabilities.</li>
<li>[[Conditional probability|probabilidad condicional]]: P(A | B) = "probability of A, given that we know B". Example: P(word = "mat" | text so far = "The cat sat on the").</li>
<li>[[Expected value|valor esperado]]: the average result if you repeat many times (sum of value × probability).</li>
</ul>
<p><b>Why this matters for AI:</b> an LLM does not output one word. It outputs a distribution over all possible next tokens, then the system <b>samples</b> one. That is why the same prompt can give different answers, and why evals need many runs.</p>
<h3>Analogy</h3>
<p>A probability distribution is a bag of colored marbles: 6 red, 3 blue, 1 green. Sampling is closing your eyes and picking one — red is likely, green is rare but possible.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> A distribution is like a <code>Dictionary&lt;string, double&gt;</code> where the values add up to 1. Sampling is <code>Random.Shared.NextDouble()</code> plus walking through the dictionary until the running sum passes that number.</div>`,
  viz: "sampler",
  resources: [
    { t: "Seeing Theory — a visual introduction to probability (Brown University)", u: "https://seeing-theory.brown.edu/", type: "reading", note: "Interactive. Do chapters 1 (Basic Probability) and 2 (Compound Probability)." },
    { t: "What Is ChatGPT Doing … and Why Does It Work? — Stephen Wolfram", u: "https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/", type: "reading", note: "Read the first section: how probabilities of next words drive generation." }
  ],
  quiz: [
    { q: "The probabilities of all outcomes in a distribution add up to…", options: ["0", "1", "100", "It depends"], a: 1, why: "Something must happen, so the total is 1 (100%)." },
    { q: "P(\"mat\" | \"The cat sat on the\") is an example of…", options: ["Conditional probability", "A matrix", "A loss function", "A database query"], a: 0, why: "Probability of the next word, given the previous words." },
    { q: "You sample 10 times from {A: 0.9, B: 0.1}. Is it possible to get B 3 times?", options: ["No, never", "Yes, it is possible, just unlikely", "Only on Linux", "Only if B = 0.5"], a: 1, why: "Sampling is random; small samples can differ from the true probabilities." },
    { q: "Why can the same prompt give different LLM answers?", options: ["The model samples from a distribution", "The servers are broken", "Tokens are encrypted", "It never happens"], a: 0, why: "With temperature > 0 the next token is sampled, not always the top one." }
  ],
  exercise: { lang: "C#", task: "Write <code>Sample(Dictionary&lt;string,double&gt; dist)</code> that returns a key at random respecting the probabilities. Run it 10,000 times on <code>{mat:0.6, floor:0.25, sofa:0.15}</code> and print the counts.",
    code: R`static string Sample(IReadOnlyDictionary<string, double> dist, Random rng)
{
    double r = rng.NextDouble(), running = 0;
    foreach (var (key, p) in dist)
    {
        running += p;
        if (r < running) return key;
    }
    return dist.Keys.Last(); // guard for rounding
}

var dist = new Dictionary<string, double> { ["mat"] = 0.6, ["floor"] = 0.25, ["sofa"] = 0.15 };
var counts = new Dictionary<string, int>();
var rng = new Random(42);
for (int i = 0; i < 10_000; i++) { var k = Sample(dist, rng); counts[k] = counts.GetValueOrDefault(k) + 1; }
foreach (var (k, c) in counts) Console.WriteLine($"{k}: {c}");`, solution: "" }
});

addConcept({
  id: "vectors", title: "Vectors & matrices (intuition)", es: "vectores y matrices",
  group: "foundations", prereqs: ["math_basics", "vars_functions"], minutes: 20,
  summary: "A vector is a float[]: a point or an arrow. The dot product measures how much two vectors point the same way. A matrix is a float[,] that transforms vectors.",
  why: "Computers represent meaning as lists of numbers. Embeddings, attention and search all come down to comparing and multiplying vectors.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[vector|vector]] is a list of numbers (a <code>float[]</code>); a [[matrix|matriz]] is a table of numbers that turns one vector into another.</p>
<h3>Vectors</h3>
<p>The vector <code>[3, 2]</code> is an arrow from (0,0) to the point (3,2). With 2 numbers you can draw it; AI uses vectors with 768 or 3072 numbers — impossible to draw, but the same rules apply.</p>
<ul>
<li><b>Length</b> (norm): √(3² + 2²) ≈ 3.6 — Pythagoras.</li>
<li>[[Dot product|producto escalar / producto punto]]: multiply position by position and add: <code>[3,2]·[1,4] = 3·1 + 2·4 = 11</code>. Big positive = pointing the same way; 0 = perpendicular; negative = opposite.</li>
<li>[[Cosine similarity|similitud coseno]]: the dot product divided by both lengths. Always between −1 and 1. This is THE measure used to compare embeddings.</li>
</ul>
<h3>Matrices</h3>
<p>A matrix with 2 rows and 3 columns, multiplied by a vector of 3 numbers, gives a vector of 2 numbers. Each output number is the dot product of one row with the input. So a matrix is a <b>function from vectors to vectors</b>, and neural networks are mostly many matrix multiplications.</p>
<h3>Analogy</h3>
<p>A vector is a list of scores, like a movie rated on [action, romance, comedy]. A matrix is a whole table of such rules; multiplying a matrix by a vector is filling in a spreadsheet of multiply-and-add formulas. GPUs are popular in AI because they do millions of these in parallel.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> Matrix × vector is just a nested <code>for</code> loop. GPUs are popular in AI because they run millions of these multiply-and-add operations in parallel.</div>`,
  viz: "vectors",
  resources: [
    { t: "Vectors | Chapter 1, Essence of linear algebra — 3Blue1Brown", u: "https://www.youtube.com/watch?v=fNk_zzaMoSs", type: "video", note: "10 min, pure intuition." },
    { t: "Linear transformations and matrices | Chapter 3 — 3Blue1Brown", u: "https://www.youtube.com/watch?v=kYB8IZa5AuE", type: "video", note: "Why a matrix is a function that moves space." }
  ],
  quiz: [
    { q: "[1, 2] · [3, 4] = ?", options: ["10", "11", "14", "[3, 8]"], a: 1, why: "1·3 + 2·4 = 3 + 8 = 11." },
    { q: "Two vectors are perpendicular. Their cosine similarity is…", options: ["1", "0", "−1", "Infinity"], a: 1, why: "Perpendicular means no shared direction: cosine 0." },
    { q: "A 2×3 matrix times a 3-number vector gives…", options: ["A 3-number vector", "A 2-number vector", "A single number", "An error always"], a: 1, why: "One output per row: 2 rows → 2 numbers." },
    { q: "Why are GPUs used for AI?", options: ["They have more RAM than CPUs", "They do huge numbers of multiply-add operations in parallel", "They are cheaper", "They run ordinary programs faster"], a: 1, why: "Matrix multiplication is massively parallel." }
  ],
  exercise: { lang: "C#", task: "Implement <code>Dot</code>, <code>Norm</code>, <code>Cosine</code> and <code>MatVec</code>. Test: <code>Cosine([1,0],[0,1]) == 0</code> and <code>Cosine([1,1],[2,2]) == 1</code>.",
    code: R`static double Dot(double[] a, double[] b) { double s = 0; for (int i = 0; i < a.Length; i++) s += a[i] * b[i]; return s; }
static double Norm(double[] a) => Math.Sqrt(Dot(a, a));
static double Cosine(double[] a, double[] b) => Dot(a, b) / (Norm(a) * Norm(b));
static double[] MatVec(double[,] m, double[] v)
{
    int rows = m.GetLength(0), cols = m.GetLength(1);
    var result = new double[rows];
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            result[r] += m[r, c] * v[c];
    return result;
}
Console.WriteLine(Cosine(new[] { 1.0, 1 }, new[] { 2.0, 2 })); // 1`, solution: "" }
});

addConcept({
  id: "optimization", title: "Slopes & optimization (gradient descent)", es: "pendientes y optimización (descenso por gradiente)",
  group: "foundations", prereqs: ["math_basics", "model"], minutes: 20,
  summary: "To train a model, measure the error, find which direction makes it smaller (the slope), take a small step, repeat. That is gradient descent.",
  why: "Gradient descent is how every modern model learns, from a straight line to a model with billions of parameters.",
  body: `
<h3>The idea in one sentence</h3>
<p>[[Gradient descent|descenso por gradiente]] = "feel the slope under your feet and take a small step downhill, many times", where the hill is the error of the model.</p>
<h3>Explanation (no calculus needed)</h3>
<p>The [[loss function|función de pérdida / de costo]] says how wrong the model is for given parameters. Lower is better. For one parameter <code>w</code> we can estimate the [[slope|pendiente]] with a tiny nudge:</p>
<pre class="formula">slope ≈ ( loss(w + 0.001) − loss(w) ) / 0.001</pre>
<p>If the slope is positive, increasing <code>w</code> makes things worse, so we decrease it. The update rule is:</p>
<pre class="formula">w = w − learningRate × slope</pre>
<ul>
<li>[[Learning rate|tasa de aprendizaje]] too small: very slow. Too big: you jump over the valley and can even explode.</li>
<li>With millions of parameters, the list of all slopes is called the [[gradient|gradiente]]. The next pages explain how it is computed efficiently (backpropagation).</li>
<li>The landscape can have several valleys ([[local minima|mínimos locales]]); in big neural networks this is less of a problem than people expected.</li>
</ul>
<h3>Analogy</h3>
<p>You're on a foggy hill and want to reach the valley. You can't see far, but you can feel which way the ground slopes under your feet. Take a small step downhill, feel again, repeat. That is gradient descent.</p>
<div class="lang-note" data-lang="csharp"><b>If you know C#/.NET:</b> It is like tuning a retry backoff by trial: measure latency, nudge the value, keep the change if it got better — but automatic, with math telling you the direction.</div>`,
  viz: "gd",
  resources: [
    { t: "Gradient descent, how neural networks learn — 3Blue1Brown", u: "https://www.youtube.com/watch?v=IHZwWFHWa-w", type: "video", note: "Chapter 2 of the neural network series." },
    { t: "Gradient Descent, Step-by-Step — StatQuest", u: "https://www.youtube.com/watch?v=sDv4f4s2SB8", type: "video", note: "Very slow and clear; good for English listening." }
  ],
  quiz: [
    { q: "The slope at the current w is negative. To reduce the loss you should…", options: ["Increase w", "Decrease w", "Stop training", "Square w"], a: 0, why: "w = w − lr × (negative) → w goes up." },
    { q: "Learning rate is too big. What usually happens?", options: ["Training is very slow but stable", "Steps jump over the minimum and may diverge", "Nothing changes", "The model gets smaller"], a: 1, why: "Try lr = 1.1 in the visualization." },
    { q: "What is the gradient?", options: ["The list of slopes for every parameter", "The final answer", "A type of GPU", "The training data"], a: 0, why: "One slope per parameter, all together." },
    { q: "Loss measures…", options: ["How fast the model is", "How wrong the model is", "How big the dataset is", "Memory usage"], a: 1, why: "Training tries to make it as small as possible." }
  ],
  exercise: { lang: "C#", task: "Minimize <code>loss(w) = (w − 3)²</code> with numeric gradient descent starting at <code>w = −5</code>. Print w every 10 steps. Then fit the LinearModel from \"What is a model?\" with the same trick for both w and b (scale m2 to hundreds first, or the steps explode!).",
    code: R`static double Loss(double w) => (w - 3) * (w - 3);
static double Slope(Func<double, double> f, double w, double h = 1e-4) => (f(w + h) - f(w)) / h;

double w = -5, lr = 0.1;
for (int step = 0; step <= 50; step++)
{
    if (step % 10 == 0) Console.WriteLine($"step {step}: w={w:F4} loss={Loss(w):F6}");
    w -= lr * Slope(Loss, w);
}
// w approaches 3`, solution: "" }
});
