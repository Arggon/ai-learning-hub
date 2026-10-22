/* Spanish lesson content — part H. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
rlhf: {
  title: "RLHF y ajuste por preferencias",
  summary: "Las personas comparan dos respuestas; un modelo de recompensa aprende sus preferencias; el aprendizaje por refuerzo empuja al LLM hacia respuestas con más recompensa. DPO lo hace de forma más simple.",
  why: "El RLHF y el ajuste por preferencias convierten un predictor de texto en un asistente útil y más seguro. Explican la personalidad de los modelos y sus negativas.",
  body: `
<h3>La idea en una frase</h3>
<p>El [[RLHF|RLHF (aprendizaje por refuerzo con feedback humano)]] le enseña al modelo qué <i>prefieren</i> las personas, usando comparaciones ("A es mejor que B") en lugar de respuestas de ejemplo perfectas.</p>
<h3>Pasos</h3>
<ol>
<li>El modelo SFT escribe 2 o más respuestas al mismo prompt.</li>
<li>Las personas eligen la mejor. (Es más fácil juzgar que escribir una respuesta perfecta.)</li>
<li>Se entrena un [[reward model|modelo de recompensa]]: entrada (prompt, respuesta) → un puntaje. Aprende de modo que P(A le gana a B) = sigmoide(puntaje A − puntaje B): el modelo de Bradley–Terry, la misma idea que el Elo del ajedrez. La visualización te deja hacer de humano.</li>
<li>El aprendizaje por refuerzo (muchas veces PPO) actualiza el LLM para que produzca respuestas con más recompensa, con una penalización ([[KL penalty|penalización KL: no alejarse mucho del modelo original]]) por alejarse demasiado del modelo SFT; si no, encuentra respuestas raras que "hackean" la recompensa.</li>
</ol>
<ul>
<li>[[DPO|DPO (optimización directa de preferencias)]]: se saltea el modelo de recompensa aparte y el bucle de RL, y entrena directamente con pares preferido/rechazado. Más simple y muy popular.</li>
<li>[[RLAIF / Constitutional AI|RLAIF / IA constitucional (feedback de una IA guiada por principios)]]: una IA juzga las respuestas usando principios escritos, y así se reduce el etiquetado humano (Anthropic).</li>
<li><b>RL con recompensas verificables</b>: en matemática y código, la recompensa es simplemente "¿la respuesta/los tests pasaron?". Así se entrenan los modelos de razonamiento.</li>
</ul>
<h3>Analogía</h3>
<p>Es como capacitar a un empleado nuevo con miles de reseñas 👍/👎. Un "modelo de recompensa" aprende a predecir qué les gusta a los revisores; después el empleado practica para conformarlo, mientras una regla (la penalización KL) le impide hacerle trampa a las reseñas con trucos raros.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> miles de code reviews con 👍/👎. El modelo de recompensa es un linter entrenado con esas reviews; el RL es el desarrollador que se va adaptando de a poco para conformar al linter, y la penalización KL le impide engañarlo con trucos feos.</div>`,
  res: ["Diagramas claros de los tres pasos.", "Una explicación excelente con enfoque de ingeniería.", "El paper detrás de ChatGPT. La Figura 2 es todo el pipeline."],
  quiz: [
    ["¿Qué aportan las personas en el RLHF?", ["Solo respuestas completas y perfectas", "Comparaciones: cuál de dos respuestas es mejor", "IDs de token", "Tiempo de GPU"], "Ordenar es más fácil y más consistente que escribir."],
    ["¿Qué devuelve el modelo de recompensa?", ["Un puntaje de qué tan buena es una respuesta", "El próximo token", "Una llamada a herramienta", "Un embedding"], "Se usa como señal para el RL."],
    ["¿Por qué agregar una penalización KL?", ["Para mantener el modelo cerca del modelo SFT y evitar el hackeo de la recompensa", "Para acelerar la tokenización", "Para encriptar respuestas", "Para subir la temperatura"], "Si no, se desvía hacia salidas extrañas que engañan al modelo de recompensa."],
    ["DPO es…", ["Una GPU nueva", "Una forma más simple de entrenar con pares de preferencias sin un bucle de RL aparte", "Un tokenizador", "Una base de datos vectorial"], "Direct Preference Optimization (optimización directa de preferencias)."]],
  task: "Implementá puntajes de Bradley–Terry, parecidos al Elo: arrancá cada respuesta en 0; para cada comparación humana (ganadora, perdedora) hacé <code>p = sigmoid(s_w − s_l); s_w += lr·(1−p); s_l −= lr·(1−p)</code>. Cargá 6 comparaciones e imprimí el ranking."
},
reasoning: {
  title: "Modelos de razonamiento y cadena de pensamiento",
  summary: "Dejar que un modelo escriba pasos intermedios antes de responder mejora las tareas difíciles de varios pasos. Los modelos de razonamiento se entrenan con RL para hacerlo bien; cambiás tokens, costo y latencia por precisión.",
  why: "Los modelos de razonamiento piensan antes de responder. Saber cuándo ayudan (y cuánto cuestan) te permite elegir el modelo correcto.",
  body: `
<h3>La idea en una frase</h3>
<p>Cada token es una cantidad fija de cómputo, así que darle al modelo espacio para "pensar en tokens" antes de la respuesta final le permite resolver problemas más difíciles.</p>
<h3>Explicación</h3>
<ul>
<li>El prompting con [[Chain-of-thought (CoT)|cadena de pensamiento (CoT)]] (2022): pedir un razonamiento paso a paso mejoró muchísimo los resultados de matemática y lógica.</li>
<li>Los <b>modelos de razonamiento</b> (la serie o de OpenAI, DeepSeek-R1, Claude con pensamiento extendido…) se entrenan con RL sobre problemas con respuestas verificables. Aprenden solos a planificar, comprobar, volver atrás y reintentar dentro de una sección de "pensamiento" larga, oculta o visible.</li>
<li>Un [[thinking budget|presupuesto de pensamiento]] (en tokens) suele ser una opción configurable. Más pensamiento → normalmente mejor en tareas difíciles, pero más costo y latencia. En tareas simples es desperdicio.</li>
<li>Para agentes: el razonamiento ayuda a planificar y depurar; para pasos simples (ruteo, extracción) muchas veces conviene un modelo barato y rápido.</li>
</ul>
<h3>Analogía</h3>
<p>La diferencia entre responder un problema de matemática difícil de cabeza al instante y resolverlo primero en un borrador. El mismo cerebro, más pasos, mejor resultado en las preguntas difíciles, pero más lento y más caro.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> es la diferencia entre contestar en una code review de memoria y escribir un programita de prueba y correrlo antes de contestar. El mismo cerebro, más pasos, mejor resultado en las preguntas difíciles.</div>
<p class="warn">La curva de precisión de la visualización es ilustrativa (rendimientos decrecientes), no un benchmark medido. El costo y la latencia son cuentas reales hechas con tus datos.</p>`,
  res: ["Leé el resumen y la Figura 1.", "Cómo el RL con recompensas verificables genera comportamiento de razonamiento.", "La última hora cubre el RL y los modelos que \"piensan\"."],
  quiz: [
    ["¿Por qué ayuda \"pensar en tokens\"?", ["Cada token suma cómputo, así que más pasos = más cómputo para el problema", "Agranda el modelo", "Cambia el tokenizador", "No ayuda"], "El modelo puede usar los tokens anteriores como borrador."],
    ["¿Cómo se entrenan principalmente los modelos de razonamiento para razonar?", ["Solo con un preentrenamiento más grande", "RL con recompensas por respuestas correctas y verificables", "Con RAG", "Con MCP"], "Recompensas verificables: respuestas de matemática, tests que pasan."],
    ["¿Cuándo es mala idea un presupuesto de pensamiento grande?", ["Demostraciones matemáticas difíciles", "Pasos simples de clasificación o extracción donde importan la velocidad y el costo", "Depuración compleja", "Planificar una migración"], "Pagás cada token de pensamiento."]],
  task: "Armá un experimento chiquito: corré los mismos 10 problemas de varios pasos con dos prompts (\"respondé directamente\" vs. \"pensá paso a paso y después dá la respuesta final después de ANSWER:\"), extraé la respuesta y compará la precisión y el total de tokens de salida. Usá cualquier API de LLM; los ejemplos llaman a la API Messages de Anthropic."
},
llm_api: {
  title: "Llamar a APIs de LLM",
  summary: "Mandás una lista de mensajes (system, user, assistant) y opciones; recibís texto, llamadas a herramientas y el uso de tokens. La API no tiene estado: reenviás la conversación entera cada vez.",
  why: "Llamar a un modelo desde código es el primer paso para pasar de usar IA a construir con IA.",
  body: `
<h3>La idea en una frase</h3>
<p>Una API de LLM es un endpoint HTTP [[stateless|sin estado]]: le mandás la conversación completa más las opciones, y te devuelve el siguiente mensaje del asistente y cuántos tokens usaste.</p>
<h3>Las piezas principales</h3>
<ul>
<li><b>Mensajes con roles:</b> <code>system</code> (reglas y personalidad), <code>user</code>, <code>assistant</code> (respuestas anteriores del modelo), más los mensajes de herramientas.</li>
<li><b>Sin estado:</b> el modelo no recuerda nada entre llamadas. La "memoria" = tu código reenviando el historial. Los chats largos se vuelven más lentos y caros en cada turno.</li>
<li>[[Context window|Ventana de contexto]]: máximo de tokens de entrada + salida por llamada (por ejemplo, 200k). El prompt de sistema + el historial + los resultados de herramientas + los documentos recuperados + la respuesta tienen que entrar todos.</li>
<li><b>Opciones:</b> <code>max_tokens</code>, <code>temperature</code>, secuencias de parada, [[structured output|salida estructurada en JSON]].</li>
<li><b>Respuesta:</b> bloques de contenido, un [[stop reason|motivo de parada]] (end_turn, max_tokens, tool_use) y <code>usage</code> (tokens de entrada/salida). ¡Registralos!</li>
<li>[[Streaming|Streaming (transmisión en vivo)]]: recibís los tokens a medida que se generan (SSE) para mostrar el progreso.</li>
</ul>
<h3>Analogía</h3>
<p>Cada pedido es una carta a un amigo por correspondencia con amnesia: el modelo no recuerda nada entre carta y carta, así que cada carta tiene que incluir toda la conversación hasta ahora. Conversaciones más largas = cartas más largas (y más caras).</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> es como una API REST protegida con un JWT que lleva todo el estado: el servidor no tiene estado, así que cada pedido tiene que incluir todo. En .NET, <code>IChatClient</code> (Microsoft.Extensions.AI) te da <code>GetResponseAsync</code> / <code>GetStreamingResponseAsync</code> sobre muchos proveedores, con middleware (logging, caché, telemetría) como un pipeline de <code>HttpClient</code>.</div>`,
  res: ["El formato del pedido y la respuesta: model, max_tokens, messages, usage.", "Tu primera llamada a la API en Python, JavaScript o curl.", "Cliente oficial de Python.", "Cliente oficial de JavaScript/TypeScript.", "La forma idiomática de .NET para llamar a cualquier LLM.", "Explica las ventanas de contexto y lo de \"abrir un chat nuevo\" desde el lado del usuario."],
  quiz: [
    ["¿La API del LLM recuerda tu pedido anterior?", ["Sí, siempre", "No: no tiene estado; tu código reenvía el historial", "Solo los fines de semana", "Solo con temperatura 0"], "Algunos productos agregan estado del lado del servidor, pero la llamada base al modelo no tiene estado."],
    ["¿Qué tiene que entrar en la ventana de contexto?", ["Solo el último mensaje del usuario", "La entrada (system + historial + herramientas + documentos) más la salida", "Solo la salida", "Los pesos del modelo"], "Todo lo que el modelo lee y escribe en esa llamada."],
    ["stop_reason = 'max_tokens' significa…", ["La respuesta terminó naturalmente", "La respuesta se cortó en tu límite", "Se llamó a una herramienta", "Un error"], "Subí max_tokens o pedí una salida más corta."],
    ["¿Por qué registrar usage.input_tokens y output_tokens?", ["Para seguir el costo y la latencia", "Lo exige HTTP", "Para la tokenización", "Para nada"], "Tokens = plata y tiempo."]],
  task: "Escribí un programa de chat mínimo en la terminal: mantené una lista de mensajes, agregá en cada turno lo que escribe el usuario y la respuesta del asistente, e imprimí el uso de tokens después de cada respuesta. Fijate cómo crecen los tokens de entrada a medida que se alarga la conversación. (Sacá el id del modelo actual de la documentación del proveedor; los ejemplos usan la API Messages de Anthropic, y la API de OpenAI funciona igual.)"
},
});

/* Diagram (Mermaid): same structure as the English one, labels translated. */
window.ES.concepts.llm_api.diagram = `sequenceDiagram
  participant App
  participant LLM as API del LLM
  App->>LLM: [system, user1]
  LLM-->>App: assistant1 (uso: 120 de entrada / 80 de salida)
  App->>LLM: [system, user1, assistant1, user2]
  Note over App,LLM: Reenviás todo el historial: la entrada crece en cada turno
  LLM-->>App: assistant2 (uso: 230 de entrada / 95 de salida)`;
