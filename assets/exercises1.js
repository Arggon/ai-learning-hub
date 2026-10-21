/* Language-neutral exercise tasks + code in pseudocode, Python and TypeScript.
   C# code stays in the concept files (exercise.code) and is merged in as code.csharp by app.js. */
window.EXERCISES = window.EXERCISES || {};
Object.assign(window.EXERCISES, {
model: { task: "Write a linear model <code>predict(x) = w·x + b</code> and a function <code>mse</code> that measures its average squared error over a dataset of (size, price) pairs. Try 3 different (w, b) pairs by hand and print which has the lowest MSE.",
  code: {
    pseudo: R`function predict(x, w, b): return w * x + b
function mse(w, b, data):
    sum = 0
    for each (x, y) in data:
        err = predict(x, w, b) - y
        sum = sum + err * err
    return sum / number of items in data

data = [(30, 65000), (45, 88000), (60, 110000), (80, 140000)]
for each (w, b) in [(1000, 30000), (1500, 20000), (1400, 23000)]:
    print w, b, mse(w, b, data)`,
    python: R`def predict(x, w, b):
    return w * x + b

def mse(w, b, data):
    return sum((predict(x, w, b) - y) ** 2 for x, y in data) / len(data)

data = [(30, 65000), (45, 88000), (60, 110000), (80, 140000)]
for w, b in [(1000, 30000), (1500, 20000), (1400, 23000)]:
    print(w, b, f"MSE {mse(w, b, data):,.0f}")`,
    ts: R`const predict = (x: number, w: number, b: number) => w * x + b;
function mse(w: number, b: number, data: [number, number][]): number {
  let sum = 0;
  for (const [x, y] of data) { const err = predict(x, w, b) - y; sum += err * err; }
  return sum / data.length;
}
const data: [number, number][] = [[30, 65000], [45, 88000], [60, 110000], [80, 140000]];
for (const [w, b] of [[1000, 30000], [1500, 20000], [1400, 23000]])
  console.log(w, b, "MSE", Math.round(mse(w, b, data)).toLocaleString());`
  } },
probability: { task: "Write <code>sample(dist)</code> that picks a key at random, respecting the probabilities in a dictionary. Run it 10,000 times on <code>{mat: 0.6, floor: 0.25, sofa: 0.15}</code> and print the counts.",
  code: {
    pseudo: R`function sample(dist):
    r = random number between 0 and 1
    running = 0
    for each (key, p) in dist:
        running = running + p
        if r < running: return key
    return last key            // guard for rounding

counts = empty dictionary
repeat 10000 times:
    k = sample({mat: 0.6, floor: 0.25, sofa: 0.15})
    counts[k] = counts[k] + 1
print counts                   // about 6000 / 2500 / 1500`,
    python: R`import random
from collections import Counter

def sample(dist, rng):
    r, running = rng.random(), 0.0
    for key, p in dist.items():
        running += p
        if r < running:
            return key
    return list(dist)[-1]  # guard for rounding

dist = {"mat": 0.6, "floor": 0.25, "sofa": 0.15}
rng = random.Random(42)
print(Counter(sample(dist, rng) for _ in range(10_000)))
# random.choices(list(dist), weights=dist.values()) does the same in one line`,
    ts: R`function sample(dist: Record<string, number>): string {
  const r = Math.random();
  let running = 0;
  for (const [key, p] of Object.entries(dist)) {
    running += p;
    if (r < running) return key;
  }
  return Object.keys(dist).at(-1)!; // guard for rounding
}
const dist = { mat: 0.6, floor: 0.25, sofa: 0.15 };
const counts: Record<string, number> = {};
for (let i = 0; i < 10_000; i++) { const k = sample(dist); counts[k] = (counts[k] ?? 0) + 1; }
console.log(counts);`
  } },
vectors: { task: "Implement <code>dot</code>, <code>norm</code>, <code>cosine</code> and <code>matVec</code> (matrix × vector). Test: <code>cosine([1,0],[0,1]) = 0</code> and <code>cosine([1,1],[2,2]) = 1</code>.",
  code: {
    pseudo: R`function dot(a, b): return sum of a[i] * b[i] for every i
function norm(a): return square root of dot(a, a)
function cosine(a, b): return dot(a, b) / (norm(a) * norm(b))
function matVec(M, v):
    result = list of zeros, one per row of M
    for each row r: for each column c:
        result[r] = result[r] + M[r][c] * v[c]
    return result
print cosine([1, 1], [2, 2])   // 1`,
    python: R`import math

def dot(a, b): return sum(x * y for x, y in zip(a, b))
def norm(a): return math.sqrt(dot(a, a))
def cosine(a, b): return dot(a, b) / (norm(a) * norm(b))
def mat_vec(m, v): return [dot(row, v) for row in m]

print(cosine([1, 0], [0, 1]), cosine([1, 1], [2, 2]))  # 0.0 1.0
print(mat_vec([[1, 2], [3, 4]], [1, 1]))               # [3, 7]
# With NumPy: import numpy as np; np.array(m) @ np.array(v)`,
    ts: R`const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
const norm = (a: number[]) => Math.sqrt(dot(a, a));
const cosine = (a: number[], b: number[]) => dot(a, b) / (norm(a) * norm(b));
const matVec = (m: number[][], v: number[]) => m.map((row) => dot(row, v));

console.log(cosine([1, 0], [0, 1]), cosine([1, 1], [2, 2])); // 0 1
console.log(matVec([[1, 2], [3, 4]], [1, 1]));               // [3, 7]`
  } },
optimization: { task: "Minimize <code>loss(w) = (w − 3)²</code> with gradient descent, starting at <code>w = −5</code>, estimating the slope numerically. Print w every 10 steps. Then fit the linear model from \"What is a model?\" the same way for both w and b (scale the sizes to hundreds first, or the steps explode).",
  code: {
    pseudo: R`function loss(w): return (w - 3)^2
function slope(f, w): return (f(w + 0.0001) - f(w)) / 0.0001

w = -5
learningRate = 0.1
repeat 50 times:
    w = w - learningRate * slope(loss, w)
    every 10 steps: print w, loss(w)
// w approaches 3`,
    python: R`def loss(w): return (w - 3) ** 2
def slope(f, w, h=1e-4): return (f(w + h) - f(w)) / h

w, lr = -5.0, 0.1
for step in range(51):
    if step % 10 == 0:
        print(f"step {step}: w={w:.4f} loss={loss(w):.6f}")
    w -= lr * slope(loss, w)
# w approaches 3`,
    ts: R`const loss = (w: number) => (w - 3) ** 2;
const slope = (f: (w: number) => number, w: number, h = 1e-4) => (f(w + h) - f(w)) / h;

let w = -5;
const lr = 0.1;
for (let step = 0; step <= 50; step++) {
  if (step % 10 === 0) console.log("step " + step + ": w=" + w.toFixed(4) + " loss=" + loss(w).toFixed(6));
  w -= lr * slope(loss, w);
}`
  } },
ml_basics: { task: "Write <code>split(data, testFraction, seed)</code> that shuffles a dataset and returns (train, test). Optional: train a regression with a real ML library (scikit-learn in Python, ML.NET in C#) and print R² on the test set.",
  code: {
    pseudo: R`function split(data, testFraction, seed):
    shuffled = shuffle(data) using a random generator with the given seed
    testCount = round(length(shuffled) * testFraction)
    test = first testCount items
    train = the rest
    return (train, test)
// Train only on train. Measure only on test.`,
    python: R`import random

def split(data, test_fraction, seed):
    rng = random.Random(seed)
    shuffled = data[:]
    rng.shuffle(shuffled)
    n_test = round(len(shuffled) * test_fraction)
    return shuffled[n_test:], shuffled[:n_test]

# Optional, with scikit-learn (pip install scikit-learn):
# from sklearn.model_selection import train_test_split
# from sklearn.linear_model import LinearRegression
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1)
# model = LinearRegression().fit(X_train, y_train)
# print(model.score(X_test, y_test))   # R² on unseen data`,
    ts: R`function split<T>(data: T[], testFraction: number, seed: number): [T[], T[]] {
  let s = seed; // tiny seeded random generator (mulberry32)
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
  const nTest = Math.round(shuffled.length * testFraction);
  return [shuffled.slice(nTest), shuffled.slice(0, nTest)];
}
console.log(split([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0.2, 42));`
  } },
neural_nets: { task: "Build a tiny 2-2-1 network that computes XOR with hand-picked weights and a ReLU activation. Check all four inputs. (Training would find weights like these automatically.)",
  code: {
    pseudo: R`function relu(z): return max(0, z)
function neuron(x1, x2, w1, w2, b): return relu(x1 * w1 + x2 * w2 + b)
function xor(a, b):
    h1 = neuron(a, b, 1, 1, 0)      // a + b
    h2 = neuron(a, b, 1, 1, -1)     // only fires when both are 1
    return h1 - 2 * h2              // output layer
for each (a, b) in (0,0), (0,1), (1,0), (1,1): print a, b, xor(a, b)`,
    python: R`def relu(z): return max(0.0, z)
def neuron(x, w, b): return relu(x[0] * w[0] + x[1] * w[1] + b)

def xor(a, b):
    h1 = neuron((a, b), (1, 1), 0)    # a + b
    h2 = neuron((a, b), (1, 1), -1)   # only fires when both are 1
    return h1 - 2 * h2                # output layer (no activation)

for a, b in [(0, 0), (0, 1), (1, 0), (1, 1)]:
    print(a, "XOR", b, "=", xor(a, b))`,
    ts: R`const relu = (z: number) => Math.max(0, z);
const neuron = (x: number[], w: number[], b: number) => relu(x[0] * w[0] + x[1] * w[1] + b);
function xor(a: number, b: number): number {
  const h1 = neuron([a, b], [1, 1], 0);   // a + b
  const h2 = neuron([a, b], [1, 1], -1);  // only fires when both are 1
  return h1 - 2 * h2;                     // output layer
}
for (const [a, b] of [[0, 0], [0, 1], [1, 0], [1, 1]]) console.log(a, "XOR", b, "=", xor(a, b));`
  } },
backprop: { task: "Rebuild the core of Karpathy's micrograd: a <code>Value</code> that supports + and × and a <code>backward()</code> that fills in gradients. Verify for <code>L = (a·b + c)·f</code> with a=2, b=−3, c=10, f=−2 that grad(a) = 6.",
  code: {
    pseudo: R`Value has: data, grad = 0, parents, backwardStep
a + b → new Value(a.data + b.data); its backwardStep adds out.grad to a.grad and to b.grad
a * b → new Value(a.data * b.data); its backwardStep adds b.data * out.grad to a.grad
                                     and a.data * out.grad to b.grad
backward(L):
    order = all values in topological order (parents before children)
    L.grad = 1
    run backwardStep for each value in reverse order
// L = (a*b + c) * f with a=2, b=-3, c=10, f=-2 → a.grad = 6`,
    python: R`class Value:
    def __init__(self, data, parents=()):
        self.data, self.grad, self._parents, self._backward = data, 0.0, parents, lambda: None

    def __add__(self, other):
        out = Value(self.data + other.data, (self, other))
        def step(): self.grad += out.grad; other.grad += out.grad
        out._backward = step
        return out

    def __mul__(self, other):
        out = Value(self.data * other.data, (self, other))
        def step(): self.grad += other.data * out.grad; other.grad += self.data * out.grad
        out._backward = step
        return out

    def backward(self):
        order, seen = [], set()
        def visit(v):
            if v in seen: return
            seen.add(v)
            for p in v._parents: visit(p)
            order.append(v)
        visit(self)
        self.grad = 1.0
        for v in reversed(order): v._backward()

a, b, c, f = Value(2), Value(-3), Value(10), Value(-2)
L = (a * b + c) * f
L.backward()
print(L.data, a.grad, b.grad, c.grad, f.grad)  # -8 6.0 -4.0 -2.0 4.0`,
    ts: R`class Value {
  grad = 0;
  backwardStep: () => void = () => {};
  constructor(public data: number, public parents: Value[] = []) {}
  add(o: Value) { const out = new Value(this.data + o.data, [this, o]); out.backwardStep = () => { this.grad += out.grad; o.grad += out.grad; }; return out; }
  mul(o: Value) { const out = new Value(this.data * o.data, [this, o]); out.backwardStep = () => { this.grad += o.data * out.grad; o.grad += this.data * out.grad; }; return out; }
  backward() {
    const order: Value[] = [], seen = new Set<Value>();
    const visit = (v: Value) => { if (seen.has(v)) return; seen.add(v); v.parents.forEach(visit); order.push(v); };
    visit(this);
    this.grad = 1;
    for (const v of order.reverse()) v.backwardStep();
  }
}
const a = new Value(2), b = new Value(-3), c = new Value(10), f = new Value(-2);
const L = a.mul(b).add(c).mul(f);
L.backward();
console.log(L.data, a.grad, b.grad, c.grad, f.grad); // -8 6 -4 -2 4`
  } },
embeddings: { task: "Given a few toy word vectors, write <code>nearest(vector, k)</code> using cosine similarity, and use it for the analogy <code>king − man + woman</code>. Bonus: replace the toy vectors with a real embedding API call.",
  code: {
    pseudo: R`vectors = { king: [0.9, 0.8, 0.1], queen: [0.9, 0.1, 0.8], man: [0.1, 0.9, 0.1],
            woman: [0.1, 0.1, 0.9], apple: [-0.8, 0.1, 0.1] }
function nearest(q, k, exclude):
    score every word not in exclude by cosine(q, vectors[word])
    return the k words with the highest scores
target = vectors.king - vectors.man + vectors.woman     // element by element
print nearest(target, 1, exclude = [king, man, woman])  // queen`,
    python: R`import math

vecs = {"king": [0.9, 0.8, 0.1], "queen": [0.9, 0.1, 0.8], "man": [0.1, 0.9, 0.1],
        "woman": [0.1, 0.1, 0.9], "apple": [-0.8, 0.1, 0.1]}

def cos(a, b):
    d = sum(x * y for x, y in zip(a, b))
    return d / math.sqrt(sum(x * x for x in a) * sum(y * y for y in b))

def nearest(q, k, exclude=()):
    scored = [(w, cos(q, v)) for w, v in vecs.items() if w not in exclude]
    return sorted(scored, key=lambda t: t[1], reverse=True)[:k]

target = [k - m + w for k, m, w in zip(vecs["king"], vecs["man"], vecs["woman"])]
print(nearest(target, 1, exclude=("king", "man", "woman")))  # [('queen', ...)]`,
    ts: R`const vecs: Record<string, number[]> = {
  king: [0.9, 0.8, 0.1], queen: [0.9, 0.1, 0.8], man: [0.1, 0.9, 0.1], woman: [0.1, 0.1, 0.9], apple: [-0.8, 0.1, 0.1],
};
const cos = (a: number[], b: number[]) => {
  let d = 0, na = 0, nb = 0;
  a.forEach((x, i) => { d += x * b[i]; na += x * x; nb += b[i] * b[i]; });
  return d / Math.sqrt(na * nb);
};
const nearest = (q: number[], k: number, exclude: string[] = []) =>
  Object.entries(vecs).filter(([w]) => !exclude.includes(w))
    .map(([w, v]) => [w, cos(q, v)] as const).sort((x, y) => y[1] - x[1]).slice(0, k);

const target = vecs.king.map((x, i) => x - vecs.man[i] + vecs.woman[i]);
console.log(nearest(target, 1, ["king", "man", "woman"])); // [["queen", ...]]`
  } },
tokenization: { task: "Implement one step of BPE training: count adjacent token pairs across all words, find the most frequent pair, and merge it everywhere. Run 10 steps on <code>\"low lower lowest newer wider\"</code> and print each merge.",
  code: {
    pseudo: R`words = each word split into single characters
repeat 10 times:
    counts = for every word, count each adjacent pair (left, right)
    if no pairs: stop
    best = the pair with the highest count
    in every word, replace each occurrence of best with one joined token
    print "merge:", best`,
    python: R`from collections import Counter

def merge_step(words):
    counts = Counter((w[i], w[i + 1]) for w in words for i in range(len(w) - 1))
    if not counts:
        return words, None
    best = counts.most_common(1)[0][0]
    merged = []
    for w in words:
        out, i = [], 0
        while i < len(w):
            if i < len(w) - 1 and (w[i], w[i + 1]) == best:
                out.append(w[i] + w[i + 1]); i += 2
            else:
                out.append(w[i]); i += 1
        merged.append(out)
    return merged, best

words = [list(w) for w in "low lower lowest newer wider".split()]
for s in range(10):
    words, m = merge_step(words)
    print(f"merge {s + 1}: {m}")`,
    ts: R`function mergeStep(words: string[][]): [string[][], string | null] {
  const counts = new Map<string, number>();
  for (const w of words) for (let i = 0; i < w.length - 1; i++) {
    const key = w[i] + "\u0000" + w[i + 1];
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size === 0) return [words, null];
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const [l, r] = best.split("\u0000");
  const merged = words.map((w) => {
    const out: string[] = [];
    for (let i = 0; i < w.length; i++) {
      if (i < w.length - 1 && w[i] === l && w[i + 1] === r) { out.push(l + r); i++; } else out.push(w[i]);
    }
    return out;
  });
  return [merged, l + " + " + r];
}
let words = "low lower lowest newer wider".split(" ").map((w) => [...w]);
for (let s = 0; s < 10; s++) { const [next, m] = mergeStep(words); words = next; console.log("merge " + (s + 1) + ": " + m); }`
  } },
next_token: { task: "Implement <code>softmax(logits, temperature)</code>, then a generation loop over a tiny bigram table (the next word depends only on the previous word). Generate 8 words at temperature 0.2, 1.0 and 2.0 and compare.",
  code: {
    pseudo: R`function softmax(logits, T):
    m = max(logits)
    exps = [e^((l - m) / T) for each l in logits]   // subtract max for stability
    return [x / sum(exps) for each x in exps]

table = { the: ([cat, dog, code], [2.0, 1.5, 0.2]), cat: ([sat, ran, the], [2.0, 1.0, 0.1]), ... }
for T in [0.2, 1.0, 2.0]:
    word = "the"; output = [word]
    repeat 8 times:
        (options, logits) = table[word]
        word = pick from options with probabilities softmax(logits, T)
        add word to output
    print T, output`,
    python: R`import math, random

def softmax(logits, t):
    m = max(logits)
    exps = [math.exp((l - m) / t) for l in logits]  # subtract max for numeric stability
    s = sum(exps)
    return [e / s for e in exps]

table = {
    "the": (["cat", "dog", "code"], [2.0, 1.5, 0.2]),
    "cat": (["sat", "ran", "the"], [2.0, 1.0, 0.1]),
    "dog": (["ran", "sat", "the"], [1.8, 0.7, 0.1]),
    "sat": (["the"], [1.0]), "ran": (["the"], [1.0]), "code": (["the"], [1.0]),
}
rng = random.Random(7)
for T in (0.2, 1.0, 2.0):
    word, out = "the", ["the"]
    for _ in range(8):
        options, logits = table[word]
        word = rng.choices(options, weights=softmax(logits, T))[0]
        out.append(word)
    print(f"T={T}: {' '.join(out)}")`,
    ts: R`function softmax(logits: number[], t: number): number[] {
  const m = Math.max(...logits);
  const exps = logits.map((l) => Math.exp((l - m) / t)); // subtract max for numeric stability
  const s = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / s);
}
const table: Record<string, [string[], number[]]> = {
  the: [["cat", "dog", "code"], [2.0, 1.5, 0.2]], cat: [["sat", "ran", "the"], [2.0, 1.0, 0.1]],
  dog: [["ran", "sat", "the"], [1.8, 0.7, 0.1]], sat: [["the"], [1]], ran: [["the"], [1]], code: [["the"], [1]],
};
for (const T of [0.2, 1.0, 2.0]) {
  let word = "the"; const out = [word];
  for (let i = 0; i < 8; i++) {
    const [options, logits] = table[word]; const p = softmax(logits, T);
    let r = Math.random(), k = 0;
    while (k < p.length - 1 && r >= p[k]) { r -= p[k]; k++; }
    word = options[k]; out.push(word);
  }
  console.log("T=" + T + ": " + out.join(" "));
}`
  } },
attention: { task: "Implement scaled dot-product attention for small arrays: <code>attend(Q, K, V, causal)</code>. Print the weight matrix for 3 tokens and check that each row adds up to 1 and that causal rows have zeros above the diagonal.",
  code: {
    pseudo: R`function attend(Q, K, V, causal):
    d = length of one query vector
    for each token i:
        for each token j:
            if causal and j > i: score[j] = minus infinity      // can't look at the future
            else: score[j] = dot(Q[i], K[j]) / square root of d
        weights[i] = softmax(score)                             // row adds up to 1
        output[i] = sum over j of weights[i][j] * V[j]
    return output, weights`,
    python: R`import math

def softmax(xs):
    m = max(xs)
    e = [math.exp(x - m) for x in xs]
    return [v / sum(e) for v in e]

def attend(Q, K, V, causal=True):
    d = len(Q[0])
    weights, output = [], []
    for i, q in enumerate(Q):
        scores = [(-math.inf if causal and j > i else sum(a * b for a, b in zip(q, k)) / math.sqrt(d))
                  for j, k in enumerate(K)]
        w = softmax(scores)
        weights.append(w)
        output.append([sum(w[j] * V[j][t] for j in range(len(V))) for t in range(len(V[0]))])
    return output, weights

Q = K = V = [[1, 0], [0, 1], [1, 1]]
_, W = attend(Q, K, V, causal=True)
for row in W:
    print([round(x, 3) for x in row], "sum =", round(sum(row), 6))`,
    ts: R`function softmax(xs: number[]): number[] {
  const m = Math.max(...xs); const e = xs.map((x) => Math.exp(x - m)); const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}
function attend(Q: number[][], K: number[][], V: number[][], causal = true) {
  const d = Q[0].length;
  const weights = Q.map((q, i) => softmax(K.map((k, j) =>
    causal && j > i ? -Infinity : q.reduce((s, x, t) => s + x * k[t], 0) / Math.sqrt(d))));
  const output = weights.map((w) => V[0].map((_, t) => w.reduce((s, wj, j) => s + wj * V[j][t], 0)));
  return { output, weights };
}
const X = [[1, 0], [0, 1], [1, 1]];
for (const row of attend(X, X, X, true).weights) console.log(row.map((x) => x.toFixed(3)), "sum =", row.reduce((a, b) => a + b, 0));`
  } },
transformers: { task: "Write a function that estimates the parameter count of a decoder-only transformer: <code>params ≈ 12·L·d² + V·d</code> (L = layers, d = model width, V = vocabulary size). Check: L=12, d=768, V=50257 should give about 124M (GPT-2 small).",
  code: {
    pseudo: R`function estimateParams(layers, dModel, vocab):
    perBlock = 12 * dModel * dModel      // about 4·d² for attention + 8·d² for the MLP
    return layers * perBlock + vocab * dModel   // + the token embedding table
print estimateParams(12, 768, 50257) / 1,000,000   // about 124 (million)`,
    python: R`def estimate_params(layers, d_model, vocab):
    per_block = 12 * d_model * d_model   # ≈ 4d² attention + 8d² MLP
    return layers * per_block + vocab * d_model  # + token embedding table

print(f"{estimate_params(12, 768, 50257) / 1e6:.0f}M")  # ≈ 124M`,
    csharp: R`static long EstimateParams(long layers, long dModel, long vocab)
{
    var perBlock = 12 * dModel * dModel;       // ≈ 4d² attention + 8d² MLP
    return layers * perBlock + vocab * dModel; // + token embedding table
}

Console.WriteLine($"{EstimateParams(12, 768, 50257) / 1e6:F0}M"); // ≈ 124M`
  } },
pretraining: { task: "(1) Write <code>crossEntropy(pCorrect) = −log(pCorrect)</code> and average it over a list of predictions. (2) Estimate training compute with <code>6·N·D</code> for N = 7e9 parameters and D = 2e12 tokens, and convert it to GPU-days assuming 4e14 useful FLOP/s per GPU.",
  code: {
    pseudo: R`function crossEntropy(p): return -log(p)
predictions = [0.9, 0.5, 0.05, 0.7]
print average of crossEntropy(p) for p in predictions

N = 7e9; D = 2e12
flops = 6 * N * D                 // about 8.4e22
gpuDays = flops / 4e14 / 86400    // seconds per day
print flops, gpuDays`,
    python: R`import math

def cross_entropy(p_correct): return -math.log(p_correct)

preds = [0.9, 0.5, 0.05, 0.7]
print(f"avg loss = {sum(map(cross_entropy, preds)) / len(preds):.3f}")

N, D = 7e9, 2e12
flops = 6 * N * D                     # ≈ 8.4e22
gpu_days = flops / 4e14 / 86_400
print(f"{flops:.2e} FLOPs ≈ {gpu_days:,.0f} GPU-days")`,
    ts: R`const crossEntropy = (pCorrect: number) => -Math.log(pCorrect);
const preds = [0.9, 0.5, 0.05, 0.7];
console.log("avg loss =", (preds.map(crossEntropy).reduce((a, b) => a + b, 0) / preds.length).toFixed(3));

const N = 7e9, D = 2e12, flops = 6 * N * D; // ≈ 8.4e22
const gpuDays = flops / 4e14 / 86_400;
console.log(flops.toExponential(2) + " FLOPs ≈ " + Math.round(gpuDays).toLocaleString() + " GPU-days");`
  } },
finetuning: { task: "Write a converter that turns support tickets (question, best answer) into a JSONL finetuning file in the common chat format: one JSON object per line, <code>{\"messages\":[{\"role\":\"system\",...},{\"role\":\"user\",...},{\"role\":\"assistant\",...}]}</code>.",
  code: {
    pseudo: R`tickets = [("How do I reset my password?", "Go to Settings → Security → Reset password."),
           ("Can I export invoices?", "Yes: Billing → Invoices → Export CSV.")]
open file "train.jsonl" for writing
for each (question, answer) in tickets:
    example = { messages: [ {role: "system", content: "You are Acme Store support. Be brief."},
                            {role: "user", content: question},
                            {role: "assistant", content: answer} ] }
    write to JSON(example) + newline     // one JSON object per line`,
    python: R`import json

tickets = [("How do I reset my password?", "Go to Settings → Security → Reset password."),
           ("Can I export invoices?", "Yes: Billing → Invoices → Export CSV.")]
with open("train.jsonl", "w", encoding="utf-8") as f:
    for q, a in tickets:
        example = {"messages": [{"role": "system", "content": "You are Acme Store support. Be brief."},
                                {"role": "user", "content": q},
                                {"role": "assistant", "content": a}]}
        f.write(json.dumps(example, ensure_ascii=False) + "\n")`,
    ts: R`import { writeFileSync } from "node:fs";

const tickets: [string, string][] = [
  ["How do I reset my password?", "Go to Settings → Security → Reset password."],
  ["Can I export invoices?", "Yes: Billing → Invoices → Export CSV."],
];
const lines = tickets.map(([q, a]) => JSON.stringify({ messages: [
  { role: "system", content: "You are Acme Store support. Be brief." },
  { role: "user", content: q }, { role: "assistant", content: a }] }));
writeFileSync("train.jsonl", lines.join("\n") + "\n");`
  } },
rlhf: { task: "Implement Bradley–Terry scores, similar to Elo ratings: start every answer at 0; for each human comparison (winner, loser) do <code>p = sigmoid(s_w − s_l); s_w += lr·(1−p); s_l −= lr·(1−p)</code>. Feed 6 comparisons and print the ranking.",
  code: {
    pseudo: R`function sigmoid(x): return 1 / (1 + e^(-x))
scores = { A: 0, B: 0, C: 0 }
comparisons = [(A,B), (A,C), (B,C), (A,B), (C,B), (A,C)]   // (winner, loser)
lr = 0.5
for each (win, lose) in comparisons:
    p = sigmoid(scores[win] - scores[lose])   // predicted chance that win beats lose
    scores[win] = scores[win] + lr * (1 - p)
    scores[lose] = scores[lose] - lr * (1 - p)
print scores sorted from high to low`,
    python: R`import math

def sigmoid(x): return 1 / (1 + math.exp(-x))

scores = {"A": 0.0, "B": 0.0, "C": 0.0}
comparisons = [("A", "B"), ("A", "C"), ("B", "C"), ("A", "B"), ("C", "B"), ("A", "C")]
lr = 0.5
for win, lose in comparisons:
    p = sigmoid(scores[win] - scores[lose])  # predicted P(win beats lose)
    scores[win] += lr * (1 - p)
    scores[lose] -= lr * (1 - p)
for k, v in sorted(scores.items(), key=lambda kv: -kv[1]):
    print(f"{k}: {v:.2f}")`,
    ts: R`const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const scores: Record<string, number> = { A: 0, B: 0, C: 0 };
const comparisons = [["A", "B"], ["A", "C"], ["B", "C"], ["A", "B"], ["C", "B"], ["A", "C"]];
const lr = 0.5;
for (const [win, lose] of comparisons) {
  const p = sigmoid(scores[win] - scores[lose]); // predicted P(win beats lose)
  scores[win] += lr * (1 - p);
  scores[lose] -= lr * (1 - p);
}
Object.entries(scores).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(k + ": " + v.toFixed(2)));`
  } }
});
