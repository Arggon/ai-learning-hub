/* Spanish lesson content — part I. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
prompting: {
  title: "Prompting e ingeniería de contexto",
  summary: "Escribí los prompts como una especificación precisa para un colega nuevo, muy capaz y sin ningún contexto. La ingeniería de contexto = elegir el conjunto más chico de tokens con más señal para cada llamada.",
  why: "El prompt y el contexto que mandás son la palanca más grande sobre la calidad de la salida, muchas veces más que cambiar de modelo.",
  body: `
<h3>La idea en una frase</h3>
<p>Un buen [[prompt|prompt (instrucción o consigna)]] es una especificación clara: quién es el modelo, el contexto, la tarea exacta, ejemplos y el formato de salida; y la [[context engineering|ingeniería de contexto]] es decidir qué información entra en la ventana en cada paso.</p>
<h3>Técnicas que funcionan</h3>
<ul>
<li><b>Sé claro y directo.</b> Decí qué querés, para qué y para quién. Ambigüedad → respuestas promedio.</li>
<li><b>Dale contexto:</b> el público, las restricciones, cómo se ve algo "bueno".</li>
<li>[[Few-shot examples|Ejemplos few-shot (de muestra)]]: de 2 a 5 ejemplos de entrada → salida ideal. Muy potentes para el formato.</li>
<li><b>Estructurá con etiquetas</b> (por ejemplo, <code>&lt;document&gt;</code>, <code>&lt;rules&gt;</code>) para que el modelo distinga las instrucciones de los datos.</li>
<li><b>Pedí razonamiento</b> antes de la respuesta en tareas difíciles; especificá el <b>formato de salida</b> (JSON schema, títulos).</li>
<li><b>Dale una salida:</b> "Si la información no está en los documentos, decí que no sabés."</li>
</ul>
<h3>Ingeniería de contexto (para agentes)</h3>
<p>La ventana de contexto es un presupuesto limitado, y los modelos empeoran con demasiado ruido. Mantené enfocados los prompts de sistema, usá pocas herramientas y bien descriptas, recuperá la información justo cuando hace falta en vez de volcar todo, y compactá o resumí los historiales largos.</p>
<h3>Analogía</h3>
<p>Escribir un prompt es como darle las indicaciones a un contratista brillante que entró hoy: sabe mucho en general, pero nada de tu situación. Unas indicaciones claras, con contexto, ejemplos y el formato esperado, consiguen un gran trabajo. Y los prompts son código: versionalos y testealos.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> escribir un prompt es escribir un gran ticket de Jira para un contratista brillante que entró hoy. Y los prompts son código: tenelos en control de versiones, revisalos y testealos con evals.</div>`,
  res: ["Seguí las técnicas en orden.", "Las mismas ideas, con otro vocabulario.", "Lectura clave para ingenieros de agentes."],
  quiz: [
    ["¿Qué son los ejemplos few-shot?", ["Prompts cortos", "Unos pocos ejemplos de entrada→salida dentro del prompt", "Un modelo chico", "GPU rápidas"], "Muestran el formato y el estilo que querés."],
    ["¿Por qué envolver un documento pegado en etiquetas como <document>…</document>?", ["Queda lindo", "Separa los datos de las instrucciones, ayuda al modelo y reduce la confusión", "Lo exige HTTP", "Comprime los tokens"], "Estructura clara, y una primera defensa contra texto inyectado."],
    ["La ingeniería de contexto significa, sobre todo…", ["Comprar una ventana de contexto más grande", "Elegir el conjunto más chico de tokens con más señal para cada paso", "Reescribir el tokenizador", "Entrenar el modelo"], "Calidad antes que cantidad en la ventana."],
    ["¿Cuál es la mejor forma de saber si un cambio en el prompt es mejor?", ["Se siente mejor", "Correr un set de evals antes y después", "Preguntarle al modelo", "Usar más mayúsculas"], "Mirá el concepto de Evals."]],
  task: "Escribí un armador de prompts chiquito con partes para rol, contexto, tarea, ejemplos y formato de salida, que genere secciones con etiquetas XML. Usalo para armar un prompt que clasifique tickets de soporte en facturación (billing), bug o funcionalidad (feature)."
},
vector_db: {
  title: "Búsqueda vectorial y bases de datos vectoriales",
  summary: "Guardás embeddings con metadatos y buscás los k más cercanos a un vector de consulta. La búsqueda exacta compara todas las filas; los índices ANN como HNSW son mucho más rápidos con una pérdida de precisión mínima.",
  why: "La búsqueda vectorial le permite a una app de IA encontrar información relevante por significado: es el núcleo de RAG y de las funciones de memoria.",
  body: `
<h3>La idea en una frase</h3>
<p>[[Vector search|Búsqueda vectorial]] = convertís la consulta en embedding y devolvés los elementos guardados cuyos embeddings están más cerca (mayor similitud coseno).</p>
<h3>Explicación</h3>
<ul>
<li>[[k-nearest neighbors (kNN)|k vecinos más cercanos (kNN)]]: los k elementos más parecidos. El kNN exacto compara la consulta con cada fila: anda bien hasta unas 100k filas.</li>
<li>Los índices de [[Approximate nearest neighbor (ANN)|vecino más cercano aproximado (ANN)]] como <b>HNSW</b> (un grafo de varios niveles que se recorre de forma golosa) encuentran casi los mismos resultados con órdenes de magnitud más de velocidad.</li>
<li><b>Filtros de metadatos:</b> "solo documentos del cliente 42, posteriores a 2025": como un WHERE al lado de la búsqueda por similitud.</li>
<li>[[Hybrid search|Búsqueda híbrida]]: combinás búsqueda por palabras clave (BM25, ideal para IDs, códigos de error, nombres) con búsqueda vectorial (ideal para el significado). En la práctica suele ser lo mejor.</li>
<li><b>Opciones:</b> pgvector (Postgres), Azure AI Search, Qdrant, Pinecone, el tipo vector de SQL Server, o un almacén en memoria para conjuntos chicos.</li>
</ul>
<h3>Analogía</h3>
<p>Un índice normal es una guía telefónica: buenísima para encontrar un nombre exacto. Un índice vectorial es un bibliotecario que puede encontrar "libros parecidos a este", rápido, incluso entre millones, porque busca solo en el barrio correcto.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> un índice B-tree normal responde <code>WHERE id = 5</code>. Un índice vectorial responde <code>ORDER BY cosine_distance(embedding, @q) LIMIT 5</code>. En .NET, las abstracciones de <code>Microsoft.Extensions.VectorData</code> te dejan cambiar de almacén como cambiás de proveedor en EF Core.</div>
<p class="tip">Hacé clic en cualquier parte del gráfico para mover la consulta y ver sus vecinos más cercanos.</p>`,
  res: ["Explica los índices (HNSW, etc.) con claridad.", "Microsoft.Extensions.VectorData y los almacenes soportados.", "Una base vectorial open source popular; buenas páginas de conceptos."],
  quiz: [
    ["¿Qué devuelve una base vectorial para una consulta?", ["Solo coincidencias exactas por palabra clave", "Los k elementos con los embeddings más parecidos", "Todas las filas", "Un resumen"], "Los vecinos más cercanos por similitud."],
    ["¿Para qué usar HNSW u otro índice ANN?", ["La búsqueda exacta es imposible", "Para no comparar la consulta con cada vector y ganar velocidad a escala", "Para encriptar vectores", "Para agrandar los vectores"], "Cambiás un poquito de recall por mucha velocidad."],
    ["Un usuario busca el código de error 'E1042'. ¿Qué búsqueda es más confiable?", ["Búsqueda vectorial pura", "Búsqueda por palabras clave (o híbrida)", "Muestreo al azar", "Ninguna"], "Los identificadores exactos son donde brilla la búsqueda por palabras clave."],
    ["El filtrado por metadatos es como…", ["Un WHERE combinado con el ranking por similitud", "Un JOIN", "Un GROUP BY", "Un trigger"], "Restringís los candidatos y después ordenás por similitud."]],
  task: "Armá un almacén de vectores en memoria con <code>upsert(id, vector, metadata)</code> y <code>search(query, k, filter)</code> usando similitud coseno. Después escribí la misma consulta para Postgres con la extensión pgvector."
},
rag: {
  title: "RAG: generación aumentada con recuperación",
  summary: "Antes de responder, buscás en tus documentos los pedazos relevantes y los ponés en el prompt. El modelo responde a partir de ese contexto, con citas.",
  why: "RAG le permite a un modelo responder a partir de tus propios documentos actualizados, con citas: es uno de los patrones más comunes en apps de IA.",
  body: `
<h3>La idea en una frase</h3>
<p>[[RAG|RAG (generación aumentada con recuperación)]] = <b>recuperar</b> texto relevante de tus datos, <b>aumentar</b> el prompt con él y dejar que el modelo <b>genere</b> una respuesta basada en eso.</p>
<h3>Dos pipelines</h3>
<ol>
<li><b>Ingesta (offline):</b> cargás documentos → los dividís en [[chunks|fragmentos (chunks)]] (por ejemplo, de 300 a 800 tokens, con algo de superposición) → convertís cada fragmento en embedding → guardás vectores + metadatos (fuente, página, fecha).</li>
<li><b>Consulta (online):</b> convertís la pregunta en embedding → búsqueda híbrida top-k → [[reranking|reranking (reordenar con un modelo más preciso)]] opcional → armás el prompt: reglas + fragmentos con IDs + pregunta → generás con citas.</li>
</ol>
<h3>Por qué y cuándo</h3>
<ul>
<li>Conocimiento privado o reciente, sin ajuste fino; las respuestas pueden citar fuentes; es fácil de actualizar (solo reindexás).</li>
<li><b>Fallas comunes:</b> mala división en fragmentos (una tabla partida a la mitad), recuperar los fragmentos equivocados, demasiados fragmentos (ruido), no tener una regla de "no sé". La mayoría de los bugs de RAG son bugs de <i>recuperación</i>: evaluá la recuperación por separado.</li>
<li><b>Recuperación contextual</b> (Anthropic): antes de generar el embedding de cada fragmento, le anteponés una explicación corta de dónde sale; mejora mucho la recuperación.</li>
<li><b>RAG agéntico:</b> le das al agente una herramienta <code>search</code> y dejás que decida cuándo y qué buscar (es lo que hace Claude Code con grep/glob sobre tu repo).</li>
</ul>
<h3>Analogía</h3>
<p>Un examen a libro abierto: en vez de responder de memoria, el modelo primero recibe las pocas páginas más relevantes de tus documentos y responde a partir de ellas, citando dónde encontró la información. La mayoría de los errores vienen de traer las páginas equivocadas.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> es como una lectura cache-aside: antes de calcular la respuesta, traés los registros relevantes y se los pasás. El LLM es la lógica de negocio; la recuperación es la capa de acceso a datos, y la mayoría de los bugs viven en la capa de datos.</div>`,
  res: ["Mejoras prácticas de RAG, con números.", "La visión del stack de Microsoft sobre RAG.", "Opcional: de dónde viene el nombre."],
  quiz: [
    ["En RAG, ¿cuándo se fragmentan los documentos y se generan sus embeddings?", ["Durante el preentrenamiento del modelo", "En un pipeline de ingesta antes de las consultas (y cuando hay cambios)", "Nunca", "Solo lo hace el usuario"], "Indexación offline y después recuperación online."],
    ["La respuesta está mal pero el documento correcto existe. ¿Qué revisás primero?", ["Subir la temperatura", "Si la recuperación devolvió los fragmentos correctos", "Comprar un modelo más grande", "Cambiar el tokenizador"], "La mayoría de los errores de RAG son errores de recuperación."],
    ["¿Por qué incluir los IDs de los fragmentos en el prompt?", ["Para que el modelo pueda citar fuentes y vos puedas verificar", "Para ahorrar tokens", "Es obligatorio", "Para encriptar"], "Las citas hacen que las respuestas se puedan comprobar."],
    ["RAG agéntico significa…", ["RAG sin LLM", "El agente tiene una herramienta de búsqueda y decide cuándo y qué recuperar", "Entrenar con los documentos recuperados", "Usar dos bases de datos"], "La recuperación pasa a ser una herramienta dentro del bucle del agente."]],
  task: "Escribí <code>chunk(text, size, overlap)</code>, que divida un texto en grupos de palabras superpuestos, y <code>buildRagPrompt(question, chunks)</code>, que numere los fragmentos como [1], [2]… dentro de <code>&lt;documents&gt;</code> y le pida al modelo que los cite y que diga \"no sé\" si la respuesta no está ahí."
},
});
