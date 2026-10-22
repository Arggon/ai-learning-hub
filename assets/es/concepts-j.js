/* Spanish lesson content — part J. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
tool_use: {
  title: "Uso de herramientas y llamada a funciones",
  summary: "Describís herramientas con un nombre, una descripción y un JSON Schema. El modelo responde con un pedido para llamar a una; tu código la ejecuta y le devuelve el resultado. El modelo nunca ejecuta nada por sí mismo.",
  why: "Las herramientas le permiten a un modelo actuar: buscar información, llamar APIs, correr código. Esto es lo que convierte a un chatbot en un asistente que hace cosas.",
  body: `
<h3>La idea en una frase</h3>
<p>La [[Function calling|llamada a funciones]] le permite al modelo pedirle a tu programa que ejecute una función; tu programa la ejecuta y devuelve el resultado como un mensaje nuevo.</p>
<h3>El bucle</h3>
<ol>
<li>Mandás los mensajes + una lista de herramientas: <code>name</code>, <code>description</code>, <code>input_schema</code> (JSON Schema).</li>
<li>El modelo responde con un bloque de <b>llamada a herramienta</b> (por ejemplo, <code>tool_use</code> con <code>name: "get_order"</code>, <code>input: {"id": 42}</code>) y se detiene con el motivo de parada <code>tool_use</code>.</li>
<li>Tu código valida la entrada, ejecuta la función real y devuelve un <b>resultado de herramienta</b> (asociado por un ID).</li>
<li>El modelo sigue: otra llamada a herramienta o la respuesta final en texto.</li>
</ol>
<h3>Buen diseño de herramientas (muy importante)</h3>
<ul>
<li>Nombres y descripciones claros, como documentación para un compañero nuevo. Decí <i>cuándo</i> usar la herramienta.</li>
<li>Pocas herramientas de alto nivel les ganan a muchas chiquitas (<code>search_orders(customer, status)</code> en vez de 5 endpoints CRUD).</li>
<li>Devolvé resultados compactos y con sentido (no 5 MB de JSON). Devolvé mensajes de error útiles, que el modelo pueda usar para corregirse.</li>
<li>Validá todo: los argumentos del modelo son entradas no confiables.</li>
</ul>
<h3>Analogía</h3>
<p>El modelo es como un gerente que no puede tocar la computadora pero sí completar formularios de pedido: "buscá el pedido 4521". Tu programa decide si lo hace, hace el trabajo real y le devuelve el resultado. El modelo nunca ejecuta nada por su cuenta.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> el modelo es como un cliente que leyó tu especificación OpenAPI y escribe un pedido, pero <i>vos</i> sos el servidor que decide si ejecutarlo. En Microsoft.Extensions.AI, <code>AIFunctionFactory.Create(method)</code> convierte un método de C# en una herramienta, y <code>UseFunctionInvocation()</code> corre el bucle por vos.</div>`,
  res: ["El formato exacto de los mensajes, con ejemplos.", "El mismo concepto en la API de OpenAI.", "Cómo diseñar herramientas que los agentes usen bien."],
  quiz: [
    ["¿Quién ejecuta la función cuando un modelo \"llama a una herramienta\"?", ["El proveedor del modelo", "El código de tu aplicación", "El navegador", "El tokenizador"], "El modelo solo produce un pedido estructurado."],
    ["¿Cómo se describen los parámetros de una herramienta?", ["Solo con texto libre", "Con JSON Schema", "Solo con comentarios en el código", "Con expresiones regulares"], "input_schema / parameters son JSON Schema."],
    ["Una herramienta devuelve un volcado JSON de 5 MB. ¿Cuál es el problema?", ["Ninguno", "Inunda la ventana de contexto: costo, latencia y peor razonamiento", "JSON no está permitido", "Las herramientas no pueden devolver JSON"], "Devolvé resultados compactos y relevantes."],
    ["¿Cómo sabe el modelo qué resultado corresponde a qué llamada?", ["Solo por el orden", "Cada resultado de herramienta hace referencia al ID de la llamada", "Por el nombre de la herramienta", "Adivina"], "Los IDs emparejan llamadas con resultados, también en llamadas en paralelo."]],
  task: "Escribí un registro de herramientas: cada herramienta tiene un nombre, una descripción, un JSON Schema para su entrada y una función que la ejecuta. Registrá <code>get_order</code> y <code>search_docs</code>. Escribí <code>dispatch(name, inputJson)</code>, que ejecute la herramienta o devuelva un mensaje de error útil si la herramienta no existe o la entrada está mal."
},
agents: {
  title: "Agentes de IA: el bucle del agente",
  summary: "Un agente es un LLM que usa herramientas en un bucle y decide su propio siguiente paso hasta cumplir el objetivo. Empezá con flujos de trabajo simples; usá autonomía solo donde rinda.",
  why: "Los agentes son modelos en un bucle con herramientas. Saber cómo funciona el bucle te ayuda a usarlos, construirlos y depurarlos.",
  body: `
<h3>La idea en una frase</h3>
<p>Un [[agent|agente]] = un LLM + herramientas + un bucle: observa, decide la siguiente acción, llama a una herramienta, lee el resultado y repite hasta terminar o hasta que lo frenen.</p>
<h3>Flujos de trabajo vs. agentes (la distinción de Anthropic)</h3>
<ul>
<li>[[Workflow|Flujo de trabajo (predefinido)]]: <b>tu código</b> decide los pasos (encadenar prompts, ruteo, llamadas en paralelo, evaluador–optimizador). Predecible, más barato, más fácil de testear.</li>
<li><b>Agente:</b> <b>el modelo</b> decide los pasos. Flexible para tareas abiertas (programar, investigar), pero más caro y más difícil de predecir.</li>
<li>Regla: empezá por lo más simple (un buen prompt), agregá flujos de trabajo y sumá autonomía de agente solo cuando haga falta.</li>
</ul>
<h3>Qué hace que un agente funcione</h3>
<ul>
<li><b>El bucle:</b> estilo [[ReAct|ReAct (razonar + actuar)]]: pensar → actuar (herramienta) → observar → repetir.</li>
<li><b>Reglas de parada:</b> máximo de pasos, máximo de costo, una herramienta de "listo", timeouts, aprobación humana para acciones riesgosas.</li>
<li><b>Memoria y contexto:</b> el historial crece; los agentes lo [[compact|compactan (resumen el historial)]], escriben notas o planes en archivos y cargan información justo cuando la necesitan.</li>
<li><b>Feedback del entorno:</b> los tests, compiladores y linters dan la verdad de base. Por eso los agentes de programación funcionan bien: se pueden comprobar a sí mismos.</li>
<li><b>El harness</b> (por ejemplo, Claude Code, Codex, Cursor u OpenCode) importa tanto como el modelo: herramientas, prompts, permisos, recuperación ante errores.</li>
</ul>
<h3>Analogía</h3>
<p>Un flujo de trabajo es una checklist fija escrita de antemano. Un agente es un trabajador que repite "mirar la situación → elegir la siguiente acción → hacerla → revisar el resultado" hasta terminar el trabajo, decidiendo cada paso sobre la marcha. El harness es el reglamento y las barandas de seguridad alrededor de ese trabajador.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> un flujo de trabajo es un pipeline fijo de MediatR. Un agente es un bucle <code>while (!done &amp;&amp; steps &lt; max)</code> donde el siguiente handler lo elige el modelo en tiempo de ejecución.</div>`,
  res: ["Lectura obligatoria. Flujos de trabajo vs. agentes, con patrones.", "Diseño, barandas de seguridad, orquestación.", "Panorama clásico: planificación, memoria, herramientas."],
  quiz: [
    ["¿Cuál es la diferencia clave entre un flujo de trabajo y un agente?", ["Los agentes usan modelos más grandes", "En un agente el modelo decide el siguiente paso; en un flujo de trabajo, lo decide tu código", "Los flujos de trabajo no pueden llamar herramientas", "No hay diferencia"], "Quién es dueño del flujo de control."],
    ["¿Por qué los agentes de programación funcionan relativamente bien?", ["El código es corto", "Los tests y compiladores dan feedback confiable para comprobar resultados", "No usan herramientas", "Nunca alucinan"], "Feedback del entorno con verdad de base."],
    ["¿Cuál NO es una buena regla de parada?", ["Un máximo de pasos", "Un límite de presupuesto", "Aprobación humana para acciones riesgosas", "Parar cuando el modelo suena seguro"], "La seguridad no es evidencia."],
    ["El historial del agente no para de crecer. Una técnica común es…", ["Compactar / resumir y escribir notas en archivos", "Subir la temperatura", "Borrar el prompt de sistema", "Usar nombres de herramientas más cortos"], "Mantené el contexto enfocado."],
    ["¿Cuál es el mejor primer paso para una funcionalidad nueva con LLM?", ["Un sistema multiagente", "La solución más simple: un buen prompt, y después flujos de trabajo si hacen falta", "Ajuste fino", "Preentrenamiento"], "Agregá complejidad solo cuando mejora los resultados."]],
  task: "Implementá un bucle de agente mínimo con un modelo <b>simulado</b> (mock, para que corra sin conexión): el modelo devuelve una llamada a herramienta o una respuesta final. Repetí hasta <code>maxSteps</code>, ejecutá las herramientas, agregá cada resultado al historial y frená con una respuesta final o cuando se llegue al límite. Después cambiá el mock por una API real."
},
multi_agent: {
  title: "Sistemas multiagente",
  summary: "Un orquestador reparte el trabajo entre subagentes, cada uno con su propio contexto limpio, muchas veces en paralelo. Ideal para tareas amplias y paralelas; caro y riesgoso para tareas muy acopladas.",
  why: "Varios agentes pueden repartirse tareas grandes y trabajar en paralelo, pero el costo y la coordinación crecen. Sabé cuándo vale la pena.",
  body: `
<h3>La idea en una frase</h3>
<p>Un [[multi-agent system|sistema multiagente]] usa varios agentes LLM (normalmente un [[orchestrator|orquestador]] y [[subagents|subagentes]]) que se reparten una tarea, trabajan por separado y combinan los resultados.</p>
<h3>Explicación</h3>
<ul>
<li><b>Por qué:</b> cada subagente recibe una ventana de contexto nueva y enfocada; las partes independientes corren en paralelo; prompts y herramientas especializados para cada rol.</li>
<li><b>Costo:</b> Anthropic contó que su sistema de investigación multiagente usaba unas 15 veces más tokens que un chat normal. Vale la pena solo en tareas amplias y valiosas.</li>
<li><b>Le queda bien:</b> investigar en muchas fuentes, revisar muchos archivos, correr subtareas independientes. <b>Le queda mal:</b> trabajo muy acoplado donde cada parte depende de las demás (buena parte de la programación), porque compartir contexto entre agentes es difícil.</li>
<li><b>Coordinación:</b> descripciones de tarea claras para cada subagente (objetivo, formato de salida, límites), artefactos compartidos (archivos, un tablero de tareas) y un paso final de síntesis.</li>
<li><b>Modos de falla:</b> trabajo duplicado, agentes que se contradicen, amplificación de errores, costos descontrolados. Evaluá y trazá todo.</li>
</ul>
<h3>Analogía</h3>
<p>Una investigadora principal divide una pregunta grande en partes, manda a varios asistentes a investigar en paralelo y después combina sus informes. Más rápido y más amplio, pero con más coordinación y más costo total.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> fan-out/fan-in con <code>Task.WhenAll</code>, como un scatter-gather sobre microservicios, donde cada "servicio" es un agente LLM.</div>`,
  res: ["Lecciones reales: prompts, costos, evals.", "El framework de Microsoft para .NET/Python para agentes y flujos multiagente.", "Lecciones sobre patrones de diseño, multiagente y más."],
  quiz: [
    ["¿Cuál es el principal beneficio de los subagentes?", ["Menos tokens", "Contextos nuevos y enfocados, y trabajo en paralelo", "No hacen falta prompts", "No hacen falta evals"], "Cada subagente ve solo lo que necesita."],
    ["¿Qué tarea le queda mejor a un sistema multiagente?", ["Un refactor chico y muy acoplado", "Investigar 20 empresas independientes", "Una sola consulta SQL", "Formatear JSON"], "Amplia, paralela, independiente."],
    ["¿Cuál es el mayor costo práctico de los sistemas multiagente?", ["Muchos más tokens", "Menos RAM", "Internet más lenta", "Licencias"], "Anthropic contó ≈15 veces los tokens de un chat."],
    ["¿Qué debería incluir la descripción de tarea de cada subagente?", ["Solo el tema", "Objetivo, formato de salida, herramientas y límites", "Todo el historial del chat", "Nada"], "Delegar de forma vaga causa trabajo duplicado o equivocado."]],
  task: "Implementá fan-out/fan-in: un orquestador reparte 6 preguntas de investigación entre subagentes, corre como máximo 3 al mismo tiempo (cada una es una tarea simulada que espera 0,5 s) y después combina los resultados. Compará el tiempo total con correrlas una después de la otra."
},
});

/* Diagrams (Mermaid): same structure as the English ones, labels translated. */
window.ES.concepts.agents.diagram = `flowchart LR
  G["Objetivo + prompt de sistema"] --> L{{"El LLM decide"}}
  L -- "llamada a herramienta" --> T["El harness ejecuta la herramienta<br/>(read_file, run_tests, edit)"]
  T -- "observación" --> L
  L -- "listo / máx. de pasos / necesita a una persona" --> E["Frenar + informar"]`;
window.ES.concepts.multi_agent.diagram = `flowchart TB
  U["Tarea"] --> O["Agente orquestador<br/>(planifica + divide)"]
  O --> S1["Subagente 1<br/>contexto propio"]
  O --> S2["Subagente 2<br/>contexto propio"]
  O --> S3["Subagente 3<br/>contexto propio"]
  S1 --> SY["El orquestador sintetiza"]
  S2 --> SY
  S3 --> SY
  SY --> R["Resultado + citas"]`;
