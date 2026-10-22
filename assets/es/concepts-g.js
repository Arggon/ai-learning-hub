/* Spanish lesson content — part G. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
transformers: {
  title: "La arquitectura Transformer",
  summary: "Convertís los tokens en embeddings, les sumás información de posición, los pasás por N bloques de (atención + una red neuronal chica) con atajos, y transformás el último vector en probabilidades del próximo token.",
  why: "El transformer es la arquitectura detrás de ChatGPT, Claude, Gemini y casi todos los modelos de lenguaje modernos.",
  body: `
<h3>La idea en una frase</h3>
<p>Un [[Transformer|Transformer]] es una pila de bloques idénticos; cada bloque deja que los tokens compartan información (atención) y después deja que cada token "piense" solo (una red neuronal chica llamada MLP).</p>
<h3>El pipeline (solo decodificador, como GPT, Claude, Llama)</h3>
<ol>
<li>IDs de token → [[embedding table|tabla de embeddings]] → un vector por token, más [[positional information|información de posición]] (si no, "perro muerde a hombre" = "hombre muerde a perro").</li>
<li>N bloques (por ejemplo, de 32 a más de 100). Cada bloque: atención → MLP. Cada subpaso suma su resultado a la entrada ([[residual connection|conexión residual: atajo que suma la entrada]]) y usa [[layer normalization|normalización de capa]] para mantener estables los números.</li>
<li>El vector final del último token → matriz de [[unembedding|unembedding (proyección al vocabulario)]] → un logit por token del vocabulario → softmax → probabilidades del próximo token.</li>
</ol>
<p><b>Por qué ganó (2017, "Attention Is All You Need"):</b> durante el entrenamiento, todas las posiciones se procesan en paralelo en GPU, a diferencia de las viejas redes recurrentes que leían una palabra por vez. Eso hizo posible la escala gigante.</p>
<p>La mayoría de los parámetros viven en las capas MLP, que parecen guardar buena parte de los "datos". La calculadora de abajo estima la cantidad de parámetros a partir de las dimensiones principales.</p>
<h3>Analogía</h3>
<p>Un transformer es una pila de sesiones de estudio idénticas: en cada una, primero las palabras charlan entre sí (atención), después cada palabra piensa por su cuenta (feed-forward), y cada sesión suma sus apuntes encima de lo que ya había (conexión residual).</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> cada bloque es como un middleware del pipeline de ASP.NET Core: la misma interfaz de entrada y de salida (una lista de vectores), y se combinan <code>next()</code> con la entrada original: esa es la conexión residual.</div>`,
  res: ["El panorama completo, con visuales hermosos.", "Transformers de solo decodificador, paso a paso.", "2 h, Python/PyTorch (acá hace falta: el ecosistema es Python). Profundización opcional."],
  quiz: [
    ["¿Cuáles son las dos partes principales de cada bloque transformer?", ["Tokenizador y base de datos", "Atención y un MLP (red feed-forward)", "Codificador y compilador", "CPU y GPU"], "Más conexiones residuales y normalización."],
    ["¿Por qué sumar información de posición?", ["La atención sola no conoce el orden de las palabras", "Para ahorrar memoria", "Para acortar los tokens", "Por seguridad"], "Sin ella, el orden de los tokens sería invisible."],
    ["La gran ventaja de los transformers frente a las viejas RNN fue…", ["Usan menos datos", "El entrenamiento en paralelo sobre todas las posiciones en GPU", "No necesitan entrenamiento", "Son más chicos"], "El paralelismo permitió la escala."],
    ["¿Qué hace una conexión residual?", ["Borra tokens viejos", "Suma la entrada de un bloque a su salida (un atajo)", "Encripta vectores", "Frena el entrenamiento"], "Ayuda a que los gradientes fluyan por pilas muy profundas."]],
  task: "Escribí una función que estime la cantidad de parámetros de un transformer de solo decodificador: <code>params ≈ 12·L·d² + V·d</code> (L = capas, d = ancho del modelo, V = tamaño del vocabulario). Comprobá: L=12, d=768, V=50257 tendría que dar unos 124M (GPT-2 small)."
},
pretraining: {
  title: "Preentrenamiento",
  summary: "Entrenar un transformer para predecir el próximo token sobre billones de tokens de texto. El resultado es un modelo base: un \"completador de documentos\" potente, pero todavía no un asistente.",
  why: "Del preentrenamiento salen el conocimiento y las capacidades de un modelo, y por eso tiene una fecha de corte de conocimiento.",
  body: `
<h3>La idea en una frase</h3>
<p>[[Pretraining|Preentrenamiento]] = mostrarle a un transformer billones de tokens de texto y, con descenso por gradiente, hacerlo cada vez mejor para predecir el próximo token.</p>
<h3>Explicación</h3>
<ul>
<li><b>Datos:</b> páginas web filtradas, libros, código, papers. El filtrado por calidad y la deduplicación importan muchísimo (mirá FineWeb).</li>
<li><b>Pérdida:</b> [[cross-entropy|entropía cruzada]] = −log(probabilidad que el modelo le dio al token correcto). Si le dio 0,9 al token correcto → pérdida 0,1; si le dio 0,01 → pérdida 4,6. Se promedia sobre todos los tokens.</li>
<li><b>Cómputo:</b> miles de GPU durante semanas o meses; cuesta desde millones hasta cientos de millones de dólares. Una regla útil: FLOPs de entrenamiento ≈ 6 × parámetros × tokens de entrenamiento.</li>
<li>[[Scaling laws|Leyes de escala]]: la pérdida baja de forma suave y predecible a medida que agregás parámetros, datos y cómputo. Esa previsibilidad es la razón por la que los laboratorios siguen escalando.</li>
<li>El resultado es un [[base model|modelo base]]: continúa documentos. Si le hacés una pregunta, puede seguir con más preguntas. Convertirlo en asistente es el paso siguiente (ajuste fino).</li>
</ul>
<h3>Analogía</h3>
<p>Karpathy dice que los parámetros son un "zip con pérdida de internet". El preentrenamiento es como un estudiante que lee una biblioteca enorme una sola vez, a un costo gigantesco; todo lo que viene después (ajuste fino, prompting) es enseñarle a ese estudiante tan leído cómo comportarse en un trabajo.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> Karpathy dice que los parámetros son un "zip con pérdida de internet". El preentrenamiento es el paso de <i>compilación</i> carísimo; todo lo que viene después (ajuste fino, prompting) es configuración encima de ese binario.</div>`,
  res: ["El mejor resumen de 1 hora sobre cómo se hacen los LLM.", "3,5 h, sin código. Preentrenamiento → SFT → RL, en detalle.", "Cómo se arman los datos reales de preentrenamiento."],
  quiz: [
    ["¿Qué optimiza el preentrenamiento?", ["La satisfacción del usuario", "La pérdida de predicción del próximo token sobre enormes cantidades de texto", "La cantidad de herramientas", "El largo de las respuestas"], "Entropía cruzada en la predicción del próximo token."],
    ["El modelo le da probabilidad 1,0 al token correcto. La entropía cruzada para ese token es…", ["1", "0", "Infinito", "−1"], "−log(1) = 0: perfecto."],
    ["Si a un modelo base le preguntás \"¿Cuál es la capital de Francia?\", puede…", ["Responder siempre perfecto, como ChatGPT", "Continuar el texto, por ejemplo con más preguntas de un cuestionario", "Negarse", "Llamar a una herramienta"], "Completa documentos; todavía no está entrenado para ser un asistente."],
    ["Las leyes de escala dicen que…", ["Los modelos más grandes siempre son peores", "La pérdida baja de forma predecible cuando crecen los parámetros, los datos y el cómputo", "Los datos no importan", "Solo importan las GPU"], "Curvas suaves de ley de potencias."]],
  task: "(1) Escribí <code>crossEntropy(pCorrect) = −log(pCorrect)</code> y promediala sobre una lista de predicciones. (2) Estimá el cómputo de entrenamiento con <code>6·N·D</code> para N = 7e9 parámetros y D = 2e12 tokens, y pasalo a GPU-días suponiendo 4e14 FLOP/s útiles por GPU."
},
finetuning: {
  title: "Ajuste fino (SFT y LoRA)",
  summary: "Seguir entrenando un modelo preentrenado con un dataset más chico y curado. El SFT con conversaciones de ejemplo convierte un modelo base en un asistente. LoRA entrena matrices chicas agregadas en lugar de todos los pesos.",
  why: "El ajuste fino es la forma en que los modelos generales se vuelven asistentes de chat y especialistas. Conocerlo te ayuda a decidir cuándo hacer ajuste fino, cuándo mejorar el prompt y cuándo usar RAG.",
  body: `
<h3>La idea en una frase</h3>
<p>[[Finetuning|Ajuste fino (fine-tuning)]] = seguir entrenando un modelo ya preentrenado con un dataset más chico y específico, para que aprenda un comportamiento o un formato.</p>
<h3>Explicación</h3>
<ul>
<li>[[Supervised finetuning (SFT)|Ajuste fino supervisado (SFT)]]: decenas de miles de conversaciones de ejemplo (pregunta del usuario → respuesta ideal del asistente), muchas veces escritas por personas. La misma pérdida de próximo token, pero ahora sobre conversaciones. Esto es lo que convierte un modelo base en un asistente de chat útil.</li>
<li>[[Chat template|Plantilla de chat]]: tokens especiales marcan los roles (system / user / assistant). Los "messages" que mandás a la API se convierten a este formato.</li>
<li>[[LoRA|LoRA (adaptación de bajo rango)]]: en vez de cambiar una matriz de pesos grande de d×d, la congelás y entrenás dos matrices finitas (d×r y r×d, con un r chico como 8). Entrenás menos del 1% de los parámetros y el archivo del adaptador es diminuto.</li>
<li><b>¿Cuándo conviene el ajuste fino?</b> Normalmente, <i>al final</i>. Primero probá mejores prompts, después RAG para el conocimiento. Hacé ajuste fino para un estilo o formato consistente, una tarea acotada a menor costo con un modelo chico, o por latencia. El ajuste fino es malo para agregar datos nuevos.</li>
</ul>
<h3>Analogía</h3>
<p>El preentrenamiento te da un graduado con formación amplia. El ajuste fino es la capacitación en el puesto para un rol. LoRA es como darle al graduado una libretita con tips específicos del trabajo en vez de reentrenarle todo el cerebro: barato y fácil de cambiar.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> el modelo base es una biblioteca grande y sellada. El SFT es como un fork con valores por defecto nuevos. LoRA es un <i>decorator</i> chico alrededor de una clase sellada: el original queda intacto y el envoltorio finito cambia su comportamiento.</div>`,
  res: ["El pipeline de entrenamiento: preentrenamiento → SFT → modelo de recompensa → RL.", "Leé solo el resumen y la Figura 1.", "Biblioteca para LoRA y otros métodos eficientes en parámetros (Python)."],
  quiz: [
    ["¿Qué es lo primero que convierte un modelo base en un asistente de chat?", ["La tokenización", "El ajuste fino supervisado con conversaciones de ejemplo", "Una GPU más grande", "RAG"], "El SFT le enseña el formato y el comportamiento de asistente."],
    ["Tu bot tiene que conocer documentos de la empresa que cambian cada semana. ¿Cuál es el mejor primer enfoque?", ["Hacer ajuste fino todas las semanas", "RAG (recuperar los documentos en el momento de la consulta)", "Preentrenar un modelo nuevo", "Subir la temperatura"], "El ajuste fino es flojo para datos nuevos; RAG los mantiene al día."],
    ["LoRA entrena…", ["Todos los pesos", "Matrices adaptadoras chicas de bajo rango mientras los pesos originales quedan congelados", "Solo el tokenizador", "Nada"], "Adaptadores baratos y chicos."],
    ["Con d = 4096 y r = 8, ¿qué fracción de una matriz de d×d entrena LoRA, más o menos?", ["50%", "≈ 0,4%", "100%", "10%"], "2·d·r / d² = 2·8/4096 ≈ 0,39%."]],
  task: "Escribí un conversor que transforme tickets de soporte (pregunta, mejor respuesta) en un archivo JSONL de ajuste fino con el formato de chat común: un objeto JSON por línea, <code>{\"messages\":[{\"role\":\"system\",...},{\"role\":\"user\",...},{\"role\":\"assistant\",...}]}</code>."
},
});

/* Diagrams (Mermaid). Same structure and node ids as the English ones; only the labels are translated. */
window.ES.concepts.transformers.diagram = `flowchart TB
  T["IDs de tokens"] --> E["Embedding + posición"]
  E --> B1
  subgraph B1["Bloque transformer × N"]
    direction TB
    N1["LayerNorm"] --> A["Atención multi-cabeza enmascarada"] --> R1(("suma residual"))
    R1 --> N2["LayerNorm"] --> M["MLP (red feed-forward)"] --> R2(("suma residual"))
  end
  B1 --> U["Des-embedding → logits"] --> S["Softmax → P(próximo token)"]`;
window.ES.concepts.pretraining.diagram = `flowchart LR
  W["Web, libros, código<br/>(billones de tokens)"] --> F["Filtrar + deduplicar"] --> TK["Tokenizar"] --> TR["Entrenar el transformer<br/>predecir el próximo token<br/>(semanas en GPUs)"] --> BM["Modelo base<br/>(completa documentos)"]`;
