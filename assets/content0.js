/* Arggon Learn, AI track — concept data (part 0: getting-started foundations, for learners with no background)
   Markup: [[term|Spanish gloss]] renders as a glossary link (Spanish shown only when the UI language is Spanish). */
window.R = String.raw;
window.CONCEPTS = [];
window.addConcept = (c) => window.CONCEPTS.push(c);

addConcept({
  id: "prog_basics", title: "What programming is", es: "qué es programar",
  group: "basics", prereqs: [], minutes: 15,
  summary: "A program is a list of exact instructions that a computer follows, one step at a time. Programming is writing those instructions in a language the computer understands.",
  why: "Every AI system — a chatbot, an agent, a model's training — is a program. Knowing what code is lets you read examples and understand what tools do.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[program|programa]] is a recipe for a computer: precise steps, followed in order, with no guessing.</p>
<h3>Explanation</h3>
<ul>
<li>Computers are fast but literal. They do exactly what the instructions say — even when that is wrong. A [[bug|error en el código]] is an instruction that does not do what the author meant.</li>
<li>A [[programming language|lenguaje de programación]] (Python, JavaScript, C#, …) is a strict format for writing instructions that a person can read and a computer can run.</li>
<li>Three building blocks appear in almost every program: <b>sequence</b> (do this, then that), <b>decisions</b> (<code>if</code> something is true, do A, otherwise B) and <b>repetition</b> ([[loop|bucle]]: do this for every item).</li>
<li>[[Pseudocode|pseudocódigo]] is plain-language "almost code" for explaining an idea without the details of a specific language. Arggon Learn can show examples in pseudocode, Python, JavaScript/TypeScript or C# (choose in Settings).</li>
</ul>
<h3>Analogy</h3>
<p>A cooking recipe is a program for a person: ingredients (inputs), steps in order, decisions ("if the dough is sticky, add flour"), repetition ("stir until smooth") and a result (output). Programming is writing recipes for a cook who never improvises.</p>
<p class="tip">Use the step button in the visualization to "be the computer" and follow a tiny program line by line.</p>`,
  viz: "progsteps",
  resources: [
    { t: "Introduction to Programming and Computer Science — freeCodeCamp (full course)", u: "https://www.youtube.com/watch?v=zOjov-2OZ0E", type: "video", note: "Language-neutral basics. Watch the first hour." },
    { t: "CS50x — Harvard's free introduction to computer science", u: "https://cs50.harvard.edu/x/", type: "reading", note: "The most famous free beginner course. Week 0 is enough to start." },
    { t: "Crash Course Computer Science (playlist)", u: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo", type: "video", note: "Short, fun episodes on how computers work." }
  ],
  quiz: [
    { q: "What is a program?", options: ["A list of exact instructions the computer follows", "A computer that thinks for itself", "A type of website", "A file of pictures"], a: 0, why: "Computers follow instructions literally, step by step." },
    { q: "\"If the password is wrong, show an error\" is an example of…", options: ["Repetition", "A decision (if/else)", "A variable", "Hardware"], a: 1, why: "Code chooses between paths based on a condition." },
    { q: "\"For every email in the inbox, mark it as read\" is…", options: ["A loop (repetition)", "A decision", "A bug", "A database"], a: 0, why: "The same step repeated for each item." },
    { q: "What is pseudocode?", options: ["A virus", "Plain-language 'almost code' used to explain logic", "A faster programming language", "Code that only runs on phones"], a: 1, why: "It shows the idea without the exact syntax of a language." }
  ],
  exercise: { task: "Write a program that goes through a list of numbers and prints \"even\" or \"odd\" for each one. Then change it to also count how many are even.",
    code: {
      pseudo: R`numbers = [3, 8, 11, 20]
evenCount = 0
for each n in numbers:
    if n divided by 2 has remainder 0:
        print n, "even"
        evenCount = evenCount + 1
    else:
        print n, "odd"
print "even numbers:", evenCount`,
      python: R`numbers = [3, 8, 11, 20]
even_count = 0
for n in numbers:
    if n % 2 == 0:
        print(n, "even")
        even_count += 1
    else:
        print(n, "odd")
print("even numbers:", even_count)`,
      ts: R`const numbers = [3, 8, 11, 20];
let evenCount = 0;
for (const n of numbers) {
  if (n % 2 === 0) {
    console.log(n, "even");
    evenCount++;
  } else {
    console.log(n, "odd");
  }
}
console.log("even numbers:", evenCount);`,
      csharp: R`var numbers = new[] { 3, 8, 11, 20 };
var evenCount = 0;
foreach (var n in numbers)
{
    if (n % 2 == 0) { Console.WriteLine($"{n} even"); evenCount++; }
    else Console.WriteLine($"{n} odd");
}
Console.WriteLine($"even numbers: {evenCount}");`
    } }
});

addConcept({
  id: "vars_functions", title: "Variables & functions", es: "variables y funciones",
  group: "basics", prereqs: ["prog_basics"], minutes: 20,
  summary: "A variable is a named box that holds a value. A function is a named, reusable piece of code: it takes inputs, does work, and returns an output.",
  why: "An AI model is literally a function: input goes in, a prediction comes out. Its learned numbers are like variables that training changes.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[variable|variable]] stores a value under a name; a [[function|función]] turns inputs into an output, so you can reuse the same logic many times.</p>
<h3>Variables and types</h3>
<ul>
<li><code>price = 100</code> creates a box called <i>price</i> holding 100. Later, <code>price = price * 2</code> changes it to 200.</li>
<li>Values have a [[type|tipo de dato]]: numbers, text ([[string|cadena de texto]]), true/false ([[boolean|booleano]]), [[list|lista / arreglo]] (ordered values), and [[dictionary|diccionario / mapa]] (key → value pairs).</li>
</ul>
<h3>Functions</h3>
<ul>
<li>A function has a name, [[parameters|parámetros]] (its inputs) and a [[return value|valor de retorno]] (its output): <code>function total(price, qty) → price × qty</code>.</li>
<li>Calling <code>total(100, 3)</code> gives 300. Same inputs, same output — that predictability makes code testable.</li>
<li>Functions can call other functions, building big programs from small, understandable pieces.</li>
</ul>
<h3>Analogy</h3>
<p>A function is a vending machine: you put in inputs (coins and a button choice), it does the work inside, and something comes out. You don't need to know the inside to use it — you only need to know what goes in and what comes out.</p>
<p><b>Why this matters for AI:</b> in normal code, a person writes the function's body. In machine learning, the body has adjustable numbers called [[weights|pesos]] that are learned from examples. You'll see this in "What is a model?".</p>`,
  viz: "funcmachine",
  resources: [
    { t: "Storing the information you need — Variables (MDN)", u: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables", type: "reading", note: "Clear beginner article (JavaScript examples)." },
    { t: "Functions — reusable blocks of code (MDN)", u: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Functions", type: "reading", note: "Parameters, return values, calling functions." },
    { t: "An Informal Introduction to Python (official tutorial)", u: "https://docs.python.org/3/tutorial/introduction.html", type: "reading", note: "If you picked Python: numbers, text and lists." },
    { t: "A tour of the C# language (Microsoft Learn)", u: "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/", type: "docs", lang: "csharp", note: "Types, variables and methods in C#." },
    { t: "TypeScript for JavaScript programmers (in 5 minutes)", u: "https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html", type: "docs", lang: "ts", note: "How types are added to JavaScript variables and functions." }
  ],
  quiz: [
    { q: "After x = 5 and then x = x + 2, what is x?", options: ["5", "2", "7", "52"], a: 2, why: "The new value replaces the old one: 5 + 2 = 7." },
    { q: "What does a function's return value mean?", options: ["Its name", "The output it gives back", "Where the file is saved", "An error"], a: 1, why: "Inputs (parameters) go in; the return value comes out." },
    { q: "Which is a dictionary (map)?", options: ["[1, 2, 3]", "\"hello\"", "{ \"name\": \"Ana\", \"age\": 30 }", "true"], a: 2, why: "Key → value pairs." },
    { q: "Why are functions useful?", options: ["They make code slower", "They let you reuse and test the same logic many times", "They are required for every line", "They store pictures"], a: 1, why: "Write once, call many times." }
  ],
  exercise: { task: "Write a function <code>total(price, quantity, discountPercent)</code> that returns the price after discount. Call it with (100, 3, 10) and check you get 270.",
    code: {
      pseudo: R`function total(price, quantity, discountPercent):
    subtotal = price * quantity
    discount = subtotal * discountPercent / 100
    return subtotal - discount

print total(100, 3, 10)   // 270`,
      python: R`def total(price, quantity, discount_percent):
    subtotal = price * quantity
    discount = subtotal * discount_percent / 100
    return subtotal - discount

print(total(100, 3, 10))  # 270.0`,
      ts: R`function total(price: number, quantity: number, discountPercent: number): number {
  const subtotal = price * quantity;
  const discount = (subtotal * discountPercent) / 100;
  return subtotal - discount;
}

console.log(total(100, 3, 10)); // 270`,
      csharp: R`static decimal Total(decimal price, int quantity, decimal discountPercent)
{
    var subtotal = price * quantity;
    var discount = subtotal * discountPercent / 100;
    return subtotal - discount;
}

Console.WriteLine(Total(100, 3, 10)); // 270`
    } }
});

addConcept({
  id: "data_json", title: "Data & JSON", es: "datos y JSON",
  group: "basics", prereqs: ["vars_functions"], minutes: 15,
  summary: "Programs pass data around as text. JSON is the most common format: objects with named fields, lists, text, numbers, true/false and null.",
  why: "Every AI API request and response, every tool definition and every MCP message is JSON. Reading JSON is a daily skill in AI engineering.",
  body: `
<h3>The idea in one sentence</h3>
<p>[[JSON|formato de datos JSON]] (JavaScript Object Notation) is a simple text format for structured data that almost every language can read and write.</p>
<h3>The rules</h3>
<ul>
<li>An [[object|objeto]] is <code>{ "key": value, ... }</code> — keys are always in double quotes.</li>
<li>A list (array) is <code>[ value, value, ... ]</code>.</li>
<li>Values: text <code>"hello"</code>, numbers <code>42</code> or <code>3.14</code>, <code>true</code>/<code>false</code>, <code>null</code> (nothing), or nested objects and lists.</li>
<li>Common mistakes: single quotes, a trailing comma after the last item, comments (not allowed in JSON).</li>
</ul>
<p>Turning data in memory into JSON text is [[serialization|serialización]]; reading JSON text back is [[parsing|parseo / análisis]]. A [[schema|esquema]] describes which fields are allowed and their types — AI tools use [[JSON Schema|JSON Schema: estándar para describir la forma de un JSON]] to describe their inputs.</p>
<h3>Analogy</h3>
<p>JSON is like a well-labeled form: every box has a name ("customer", "items", "total"), and some boxes contain smaller forms or lists. Anyone who knows the labels can fill it or read it — in any language.</p>`,
  viz: "jsonexplorer",
  resources: [
    { t: "Working with JSON (MDN)", u: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON", type: "reading", note: "Structure, parsing and common mistakes." },
    { t: "Introducing JSON (json.org)", u: "https://www.json.org/json-en.html", type: "reading", note: "The official one-page grammar, with diagrams." }
  ],
  quiz: [
    { q: "Which is valid JSON?", options: ["{ name: 'Ana' }", "{ \"name\": \"Ana\" }", "{ \"name\": \"Ana\", }", "name = Ana"], a: 1, why: "Keys and strings need double quotes; no trailing comma." },
    { q: "What does [1, 2, 3] represent in JSON?", options: ["An object", "A list (array)", "A string", "An error"], a: 1, why: "Square brackets = ordered list." },
    { q: "Converting JSON text into data your program can use is called…", options: ["Parsing", "Compiling", "Encrypting", "Tokenizing"], a: 0, why: "Serialization is the opposite direction." },
    { q: "What does a JSON Schema describe?", options: ["Colors of a website", "Which fields a JSON value should have and their types", "A database password", "Image size"], a: 1, why: "AI tool definitions use JSON Schema for their parameters." }
  ],
  exercise: { task: "Parse this JSON order, compute the total of <code>price × qty</code> for all items, then add a new field <code>\"total\"</code> and print the JSON again.",
    code: {
      pseudo: R`text = '{"id": 42, "items": [{"name": "pen", "price": 2.5, "qty": 4}, {"name": "book", "price": 12, "qty": 1}]}'
order = parse JSON(text)
total = 0
for each item in order.items:
    total = total + item.price * item.qty
order.total = total          // 22
print to JSON(order)`,
      python: R`import json

text = '{"id": 42, "items": [{"name": "pen", "price": 2.5, "qty": 4}, {"name": "book", "price": 12, "qty": 1}]}'
order = json.loads(text)
order["total"] = sum(i["price"] * i["qty"] for i in order["items"])
print(json.dumps(order, indent=2))  # total: 22.0`,
      ts: R`const text = '{"id": 42, "items": [{"name": "pen", "price": 2.5, "qty": 4}, {"name": "book", "price": 12, "qty": 1}]}';
type Item = { name: string; price: number; qty: number };
const order: { id: number; items: Item[]; total?: number } = JSON.parse(text);
order.total = order.items.reduce((sum, i) => sum + i.price * i.qty, 0);
console.log(JSON.stringify(order, null, 2)); // total: 22`,
      csharp: R`using System.Text.Json;
using System.Text.Json.Nodes;

var text = """{"id": 42, "items": [{"name": "pen", "price": 2.5, "qty": 4}, {"name": "book", "price": 12, "qty": 1}]}""";
var order = JsonNode.Parse(text)!;
decimal total = 0;
foreach (var item in order["items"]!.AsArray())
    total += item!["price"]!.GetValue<decimal>() * item["qty"]!.GetValue<int>();
order["total"] = total;   // 22
Console.WriteLine(order.ToJsonString(new JsonSerializerOptions { WriteIndented = true }));`
    } }
});

addConcept({
  id: "web_apis", title: "How the web & APIs work", es: "cómo funcionan la web y las APIs",
  group: "basics", prereqs: ["data_json"], minutes: 20,
  summary: "A client sends an HTTP request (method, URL, headers, body) to a server, which sends back a response (status code, headers, body). An API is a set of such requests a program can make.",
  why: "Using an AI model from code means sending HTTP requests to an API. Tools, agents and MCP servers all build on this request/response idea.",
  body: `
<h3>The idea in one sentence</h3>
<p>On the web, a [[client|cliente]] asks and a [[server|servidor]] answers, using the [[HTTP|protocolo HTTP]] format; an [[API|API: interfaz para que programas se comuniquen]] is a documented list of questions a program is allowed to ask.</p>
<h3>Request and response</h3>
<ul>
<li><b>Request:</b> a [[method|método HTTP]] (<code>GET</code> = read, <code>POST</code> = create/send, <code>PUT</code>/<code>PATCH</code> = update, <code>DELETE</code>), a URL (<code>https://api.example.com/orders/42</code>), [[headers|encabezados]] (extra info such as an [[API key|clave de API]] for authentication) and sometimes a [[body|cuerpo del mensaje]] (usually JSON).</li>
<li><b>Response:</b> a [[status code|código de estado]] — <code>200</code> OK, <code>201</code> created, <code>400</code> bad request, <code>401</code> not authenticated, <code>404</code> not found, <code>429</code> too many requests, <code>500</code> server error — plus headers and a body.</li>
<li>[[REST|estilo REST]] is a common style of API design: URLs name things (<code>/orders/42</code>) and methods say what to do with them.</li>
<li>Some responses arrive bit by bit ([[streaming|transmisión en partes]]); chat apps use this to show text as it is generated.</li>
</ul>
<h3>Analogy</h3>
<p>Ordering in a restaurant: you (client) give the waiter an order slip (request) with what you want and your table number (headers). The kitchen (server) sends back your dish, or a note: "we're out of that" (404) or "too many orders, wait" (429). The menu is the API documentation.</p>`,
  viz: "httpsim",
  resources: [
    { t: "How the web works (MDN)", u: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works", type: "reading", note: "Clients, servers, DNS, packets — explained simply." },
    { t: "Overview of HTTP (MDN)", u: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview", type: "reading", note: "Requests, responses, methods and headers." },
    { t: "HTTP response status codes (MDN)", u: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status", type: "docs", note: "Reference: what each code means." }
  ],
  quiz: [
    { q: "Which HTTP method usually reads data without changing it?", options: ["POST", "GET", "DELETE", "PATCH"], a: 1, why: "GET is for reading." },
    { q: "A response with status 404 means…", options: ["Success", "Not found", "Server crashed", "Too many requests"], a: 1, why: "The resource doesn't exist at that URL." },
    { q: "Where is an API key usually sent?", options: ["In the URL path always", "In a request header", "In the status code", "It is never sent"], a: 1, why: "For example: Authorization or x-api-key headers." },
    { q: "You get status 429 from an AI API. What should your code do?", options: ["Retry immediately in a tight loop", "Wait and retry later (back off)", "Delete the account", "Ignore it"], a: 1, why: "429 = rate limited; back off and retry." }
  ],
  exercise: { task: "Call a free public test API (<code>https://httpbin.org/get</code> or any JSON API you like), print the status code, and print one field from the JSON body. Then request a URL that does not exist and print its status code.",
    code: {
      pseudo: R`response = HTTP GET "https://httpbin.org/get" with header "Accept: application/json"
print response.status          // 200
data = parse JSON(response.body)
print data.url
missing = HTTP GET "https://httpbin.org/status/404"
print missing.status           // 404`,
      python: R`import requests  # pip install requests

r = requests.get("https://httpbin.org/get", headers={"Accept": "application/json"}, timeout=10)
print(r.status_code)        # 200
print(r.json()["url"])
missing = requests.get("https://httpbin.org/status/404", timeout=10)
print(missing.status_code)  # 404`,
      ts: R`// Node 18+ or a browser: fetch is built in
const r = await fetch("https://httpbin.org/get", { headers: { Accept: "application/json" } });
console.log(r.status);              // 200
const data = await r.json();
console.log(data.url);
const missing = await fetch("https://httpbin.org/status/404");
console.log(missing.status);        // 404`,
      csharp: R`using System.Net.Http.Json;
using System.Text.Json;

using var http = new HttpClient();
var r = await http.GetAsync("https://httpbin.org/get");
Console.WriteLine((int)r.StatusCode);                 // 200
var data = await r.Content.ReadFromJsonAsync<JsonElement>();
Console.WriteLine(data.GetProperty("url").GetString());
var missing = await http.GetAsync("https://httpbin.org/status/404");
Console.WriteLine((int)missing.StatusCode);           // 404`
    } }
});

addConcept({
  id: "db_basics", title: "Databases basics", es: "bases de datos: lo básico",
  group: "basics", prereqs: ["data_json"], minutes: 20,
  summary: "A database stores data in tables (rows and columns) and answers questions with queries. An index makes common lookups fast without reading every row.",
  why: "AI apps store documents, chat history and embeddings in databases. Vector databases (for RAG) build directly on these ideas.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[database|base de datos]] keeps data safe and organized, and lets you ask questions like "all orders from customer 7, newest first" with a [[query|consulta]].</p>
<h3>Explanation</h3>
<ul>
<li>A [[table|tabla]] has [[columns|columnas]] (fields like <code>id</code>, <code>customer</code>, <code>total</code>) and [[rows|filas]] (one record each). A spreadsheet is a good mental picture.</li>
<li>[[SQL|lenguaje SQL]] is the standard language for relational databases: <code>SELECT customer, total FROM orders WHERE total &gt; 50 ORDER BY total DESC LIMIT 5;</code></li>
<li>A [[primary key|clave primaria]] uniquely identifies each row (usually <code>id</code>).</li>
<li>An [[index|índice]] is a sorted lookup structure, like the index at the back of a book: the database can jump to matching rows instead of scanning every one.</li>
<li>Some databases store documents (JSON) instead of tables, and <b>vector databases</b> answer "which rows are most <i>similar</i> to this one?" — you'll meet them in the RAG part.</li>
</ul>
<h3>Analogy</h3>
<p>A library: tables are shelves of the same kind of book, rows are books, columns are what's written on each label. A query is asking the librarian; an index is the catalog that tells them which shelf to walk to.</p>`,
  viz: "dbquery",
  resources: [
    { t: "SQLBolt — interactive SQL lessons", u: "https://sqlbolt.com/", type: "reading", note: "Learn SQL in the browser, exercise by exercise." },
    { t: "SQL Tutorial — Full Database Course for Beginners (freeCodeCamp)", u: "https://www.youtube.com/watch?v=HXV3zeQKqGY", type: "video", note: "Long; the first 45 minutes cover the essentials." },
    { t: "PostgreSQL Tutorial (official docs, Part I)", u: "https://www.postgresql.org/docs/current/tutorial.html", type: "docs", note: "Tables, queries, joins — in a real database." }
  ],
  quiz: [
    { q: "In a table, one record (for example, one order) is a…", options: ["Column", "Row", "Index", "Query"], a: 1, why: "Rows are records; columns are fields." },
    { q: "Which SQL keyword filters rows?", options: ["ORDER BY", "WHERE", "LIMIT", "FROM"], a: 1, why: "WHERE keeps only matching rows." },
    { q: "Why add an index?", options: ["To make some lookups much faster", "To delete old rows", "To encrypt data", "To change column names"], a: 0, why: "It avoids scanning every row." },
    { q: "A primary key is…", options: ["A password", "A value that uniquely identifies each row", "The first column always", "A backup"], a: 1, why: "No two rows share it." }
  ],
  exercise: { task: "Using SQLite (built into Python; or any SQL database), create an <code>orders</code> table, insert 4 rows, and query the 2 largest orders of one customer. Bonus: add an index on <code>customer</code>.",
    code: {
      pseudo: R`create table orders(id, customer, total)
insert (1, "ana", 30), (2, "ana", 80), (3, "bo", 55), (4, "ana", 12)
query: rows of orders where customer = "ana", sorted by total from high to low, first 2
// → (2, ana, 80), (1, ana, 30)
create index on orders(customer)   // faster lookups by customer`,
      python: R`import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT, total REAL)")
db.executemany("INSERT INTO orders VALUES (?, ?, ?)", [(1, "ana", 30), (2, "ana", 80), (3, "bo", 55), (4, "ana", 12)])
db.execute("CREATE INDEX idx_orders_customer ON orders(customer)")
rows = db.execute("SELECT id, customer, total FROM orders WHERE customer = ? ORDER BY total DESC LIMIT 2", ("ana",)).fetchall()
print(rows)  # [(2, 'ana', 80.0), (1, 'ana', 30.0)]`,
      ts: R`// npm install better-sqlite3
import Database from "better-sqlite3";

const db = new Database(":memory:");
db.exec("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT, total REAL)");
const insert = db.prepare("INSERT INTO orders VALUES (?, ?, ?)");
for (const row of [[1, "ana", 30], [2, "ana", 80], [3, "bo", 55], [4, "ana", 12]]) insert.run(...row);
db.exec("CREATE INDEX idx_orders_customer ON orders(customer)");
console.log(db.prepare("SELECT * FROM orders WHERE customer = ? ORDER BY total DESC LIMIT 2").all("ana"));`,
      csharp: R`// dotnet add package Microsoft.Data.Sqlite
using Microsoft.Data.Sqlite;

using var db = new SqliteConnection("Data Source=:memory:");
db.Open();
void Exec(string sql) { using var c = db.CreateCommand(); c.CommandText = sql; c.ExecuteNonQuery(); }
Exec("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT, total REAL)");
Exec("INSERT INTO orders VALUES (1,'ana',30),(2,'ana',80),(3,'bo',55),(4,'ana',12)");
Exec("CREATE INDEX idx_orders_customer ON orders(customer)");
using var q = db.CreateCommand();
q.CommandText = "SELECT id, customer, total FROM orders WHERE customer = $c ORDER BY total DESC LIMIT 2";
q.Parameters.AddWithValue("$c", "ana");
using var r = q.ExecuteReader();
while (r.Read()) Console.WriteLine($"{r.GetInt32(0)} {r.GetString(1)} {r.GetDouble(2)}");`
    } }
});

addConcept({
  id: "math_basics", title: "The math you need", es: "la matemática que necesitas",
  group: "basics", prereqs: [], minutes: 25,
  summary: "Functions and graphs (y = w·x + b), percentages, squares, and exponents and logarithms. That is all the math this AI track needs; every formula later is explained in words too.",
  why: "Models are functions, training reads slopes on graphs, probabilities are percentages, and softmax and loss use exponents and logs. With these five ideas the rest is approachable.",
  body: `
<h3>The idea in one sentence</h3>
<p>You need five school ideas: functions, graphs, percentages, squares, and exponents with their opposite, logarithms.</p>
<h3>1. Functions and graphs</h3>
<p>A math [[function|función]] gives one output for each input: <code>y = 2x + 1</code>. A graph draws all the (x, y) pairs. For the line <code>y = w·x + b</code>, <code>w</code> is the [[slope|pendiente]] (how steep) and <code>b</code> is where the line crosses the vertical axis.</p>
<h3>2. Percentages</h3>
<p>Percent means "per hundred": 25% = 25/100 = 0.25. Probabilities are often written either way: 0.9 = 90%.</p>
<h3>3. Squares</h3>
<p>3² = 3 × 3 = 9 and (−3)² = 9. Squaring makes negative numbers positive and makes big numbers much bigger — useful for measuring errors.</p>
<h3>4. Exponents</h3>
<p>An [[exponent|exponente]] says how many times to multiply: 2³ = 2 × 2 × 2 = 8. Exponential growth is very fast: 2¹⁰ = 1024. The special number <code>e ≈ 2.718</code> appears often; <code>eˣ</code> is always positive.</p>
<h3>5. Logarithms</h3>
<p>A [[logarithm|logaritmo]] is the opposite question: "2 to what power gives 8?" → log₂(8) = 3. Logs turn huge ranges into small ones: log₁₀(1,000,000) = 6. The log of a number between 0 and 1 is negative: log(0.5) &lt; 0. You will see <code>−log(p)</code> as a "surprise" score: small when p is close to 1, large when p is tiny.</p>
<h3>Analogy</h3>
<p>Exponents are like compound interest or a rumor spreading (each step multiplies). Logarithms are like counting digits: they tell you "how many steps of multiplying" you needed to get here.</p>`,
  viz: "mathplot",
  resources: [
    { t: "Cartesian Coordinates (Math is Fun)", u: "https://www.mathsisfun.com/data/cartesian-coordinates.html", type: "reading", note: "How graphs and (x, y) points work, with interactive examples." },
    { t: "Introduction to Logarithms (Math is Fun)", u: "https://www.mathsisfun.com/algebra/logarithms.html", type: "reading", note: "Exponents and logs explained gently." },
    { t: "Logarithm Fundamentals — 3Blue1Brown", u: "https://www.youtube.com/watch?v=cEvgcoyZvB4", type: "video", note: "A live lesson that builds intuition for exponents and logs." }
  ],
  quiz: [
    { q: "In y = 3x + 2, what is y when x = 4?", options: ["9", "14", "12", "24"], a: 1, why: "3 × 4 + 2 = 14." },
    { q: "0.35 as a percentage is…", options: ["3.5%", "35%", "0.35%", "350%"], a: 1, why: "Multiply by 100." },
    { q: "2⁵ = ?", options: ["10", "25", "32", "7"], a: 2, why: "2 × 2 × 2 × 2 × 2 = 32." },
    { q: "log₂(16) = ?", options: ["4", "8", "2", "16"], a: 0, why: "2⁴ = 16." },
    { q: "Which is true about −log(p) for a probability p?", options: ["It is large when p is close to 1", "It is small when p is close to 1 and large when p is tiny", "It is always negative", "It equals p"], a: 1, why: "This 'surprise' score is the core of the loss used to train language models." }
  ],
  exercise: { task: "Write small functions for: a line <code>w·x + b</code>, a percentage of a number, a square, 2 to the power n, and log base 2. Print a table for x = 1..8 showing x, 2^x and log₂(x).",
    code: {
      pseudo: R`function line(x, w, b): return w * x + b
function percentOf(p, value): return value * p / 100
function square(x): return x * x
for x from 1 to 8:
    print x, 2^x, log2(x)
// 8 → 256 and 3`,
      python: R`import math

def line(x, w, b): return w * x + b
def percent_of(p, value): return value * p / 100
def square(x): return x * x

print(line(4, 3, 2), percent_of(25, 80), square(-3))   # 14 20.0 9
for x in range(1, 9):
    print(x, 2 ** x, round(math.log2(x), 3))`,
      ts: R`const line = (x: number, w: number, b: number) => w * x + b;
const percentOf = (p: number, value: number) => (value * p) / 100;
const square = (x: number) => x * x;

console.log(line(4, 3, 2), percentOf(25, 80), square(-3)); // 14 20 9
for (let x = 1; x <= 8; x++) console.log(x, 2 ** x, Math.log2(x).toFixed(3));`,
      csharp: R`static double Line(double x, double w, double b) => w * x + b;
static double PercentOf(double p, double value) => value * p / 100;
static double Square(double x) => x * x;

Console.WriteLine($"{Line(4, 3, 2)} {PercentOf(25, 80)} {Square(-3)}"); // 14 20 9
for (int x = 1; x <= 8; x++) Console.WriteLine($"{x} {Math.Pow(2, x)} {Math.Log2(x):F3}");`
    } }
});

addConcept({
  id: "chatbot_use", title: "Using a chatbot well", es: "usar bien un chatbot",
  group: "basics", prereqs: [], minutes: 20,
  summary: "Give context, a clear goal, examples and the format you want; check important facts; start a new chat when the topic changes; never paste secrets.",
  why: "Using chat assistants well is the fastest way to get value from AI today, and it builds the intuition you need later for prompting and agents.",
  body: `
<h3>The idea in one sentence</h3>
<p>A [[chatbot|asistente conversacional]] like ChatGPT, Claude or Gemini is a language model behind a chat window: it answers best when you give it the context a smart new colleague would need.</p>
<h3>Habits that work</h3>
<ul>
<li><b>Say who it's for and why:</b> "Explain this contract clause for a non-lawyer, in 5 bullet points."</li>
<li><b>Give the material:</b> paste the text, data or error message instead of describing it.</li>
<li><b>Show an example</b> of the output you want, and ask for a specific format (table, bullet list, email).</li>
<li><b>Iterate:</b> ask follow-ups ("shorter", "more formal", "what are the risks?"). The first answer is a draft.</li>
<li><b>Start a new chat</b> for a new topic: long conversations fill the model's memory window and older details get lost.</li>
<li><b>Verify:</b> models can produce confident but false answers ([[hallucinations|alucinaciones: respuestas inventadas que suenan bien]]). Check facts, numbers, quotes and links that matter.</li>
<li><b>Privacy:</b> don't paste passwords, API keys or private data you are not allowed to share.</li>
</ul>
<h3>Analogy</h3>
<p>Think of a very well-read assistant who just walked into the room: brilliant, fast, eager to help — but with no idea who you are or what you're working on, and sometimes too sure of themselves. The more context you give, the better the help; the more important the result, the more you double-check.</p>
<p class="tip">Try the "prompt doctor" below: type a request and see which ingredients are missing.</p>`,
  viz: "promptdoctor",
  resources: [
    { t: "How I use LLMs — Andrej Karpathy", u: "https://www.youtube.com/watch?v=EWvNQjAaOHw", type: "video", note: "A practical tour of chat assistants by a top AI researcher." },
    { t: "Basics of Prompting — Prompt Engineering Guide", u: "https://www.promptingguide.ai/introduction/basics", type: "reading", note: "Short, with examples." },
    { t: "Claude Academy — free courses on working with AI", u: "https://academy.claude.com/", type: "reading", note: "Free beginner-friendly courses." }
  ],
  quiz: [
    { q: "Which prompt will usually give a better answer?", options: ["\"Write an email.\"", "\"Write a short, polite email to my landlord asking to fix the heating this week. Mention it broke on Monday.\"", "\"EMAIL!!!\"", "\"Help\""], a: 1, why: "Goal, audience, context and length are clear." },
    { q: "The chatbot gives a statistic with a source. What should you do if it matters?", options: ["Trust it — it sounds confident", "Check the source yourself", "Ask it to say it again", "Nothing"], a: 1, why: "Models can invent plausible facts and links." },
    { q: "Why start a new chat for a new topic?", options: ["It's cheaper for you always", "Long chats fill the model's context and old details get mixed in or lost", "Chats expire after 1 minute", "It's required"], a: 1, why: "A clean context gives focused answers." },
    { q: "Which should you NOT paste into a public chatbot?", options: ["A public news article", "Your company's API keys and passwords", "A recipe", "A math question"], a: 1, why: "Secrets and private data can leak." }
  ],
  exercise: { task: "Take a real task you have this week. Write the prompt twice: a short version, then a full version with goal, audience, context, an example and a format. Compare the two answers and write down 3 differences. (No code needed — the snippet is a template you can reuse.)",
    code: {
      any: R`Goal: <what you want done, in one sentence>
Audience: <who will read or use the result>
Context: <paste the text / data / error here>
Example of a good result: <a short sample>
Format: <bullets, table, email, max N words>
Rules: If you are not sure about a fact, say so instead of guessing.`
    } }
});
