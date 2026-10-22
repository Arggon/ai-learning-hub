/* Spanish lesson content — part C. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
chatbot_use: {
  title: "Usar bien un chatbot",
  summary: "Dale contexto, un objetivo claro, ejemplos y el formato que querés; verificá los datos importantes; abrí un chat nuevo cuando cambia el tema; nunca pegues secretos.",
  why: "Usar bien los asistentes de chat es la forma más rápida de sacarle provecho a la IA hoy, y te da la intuición que vas a necesitar después para prompting y agentes.",
  body: `
<h3>La idea en una frase</h3>
<p>Un [[chatbot|chatbot (asistente conversacional)]] como ChatGPT, Claude o Gemini es un modelo de lenguaje detrás de una ventana de chat: responde mejor cuando le das el contexto que necesitaría un colega nuevo y muy capaz.</p>
<h3>Hábitos que funcionan</h3>
<ul>
<li><b>Decí para quién es y para qué:</b> "Explicame esta cláusula del contrato para alguien que no es abogado, en 5 viñetas."</li>
<li><b>Pasale el material:</b> pegá el texto, los datos o el mensaje de error en vez de describirlos.</li>
<li><b>Mostrale un ejemplo</b> de la salida que querés, y pedí un formato concreto (tabla, lista de viñetas, mail).</li>
<li><b>Iterá:</b> hacé repreguntas ("más corto", "más formal", "¿cuáles son los riesgos?"). La primera respuesta es un borrador.</li>
<li><b>Abrí un chat nuevo</b> para un tema nuevo: las conversaciones largas llenan la ventana de memoria del modelo y los detalles viejos se pierden.</li>
<li><b>Verificá:</b> los modelos pueden dar respuestas falsas con total seguridad ([[hallucinations|alucinaciones: respuestas inventadas que suenan bien]]). Chequeá los datos, números, citas y links que importan.</li>
<li><b>Privacidad:</b> no pegues contraseñas, claves de API ni datos privados que no tengas permitido compartir.</li>
</ul>
<h3>Analogía</h3>
<p>Pensá en un asistente que leyó muchísimo y acaba de entrar a la sala: brillante, rápido, con ganas de ayudar, pero sin idea de quién sos ni en qué estás trabajando, y a veces demasiado seguro de sí mismo. Cuanto más contexto le des, mejor te ayuda; cuanto más importante el resultado, más tenés que chequear.</p>
<p class="tip">Probá el "doctor de prompts" de abajo: escribí un pedido y fijate qué ingredientes le faltan.</p>`,
  res: ["Un recorrido práctico por los asistentes de chat, de la mano de un investigador de IA de primer nivel.", "Corto y con ejemplos.", "Cursos gratuitos pensados para principiantes."],
  quiz: [
    ["¿Qué prompt suele dar una mejor respuesta?", ["\"Escribí un mail.\"", "\"Escribí un mail corto y amable a mi propietario pidiéndole que arregle la calefacción esta semana. Mencioná que se rompió el lunes.\"", "\"¡¡¡MAIL!!!\"", "\"Ayuda\""], "El objetivo, el destinatario, el contexto y el largo están claros."],
    ["El chatbot te da una estadística con una fuente. ¿Qué hacés si es importante?", ["Le creés: suena muy seguro", "Revisás la fuente vos mismo", "Le pedís que lo repita", "Nada"], "Los modelos pueden inventar datos y links que parecen creíbles."],
    ["¿Por qué abrir un chat nuevo para un tema nuevo?", ["Siempre te sale más barato", "Los chats largos llenan el contexto del modelo y los detalles viejos se mezclan o se pierden", "Los chats vencen después de 1 minuto", "Es obligatorio"], "Un contexto limpio da respuestas enfocadas."],
    ["¿Qué NO deberías pegar en un chatbot público?", ["Una noticia pública", "Las claves de API y contraseñas de tu empresa", "Una receta", "Una pregunta de matemática"], "Los secretos y los datos privados se pueden filtrar."]],
  task: "Agarrá una tarea real que tengas esta semana. Escribí el prompt dos veces: una versión corta y después una completa con objetivo, destinatario, contexto, un ejemplo y un formato. Compará las dos respuestas y anotá 3 diferencias. (No hace falta código: el fragmento es una plantilla que podés reutilizar.)"
},
model: {
  title: "¿Qué es un modelo?",
  summary: "Un modelo es una función con números ajustables (parámetros). Entrenar es encontrar buenos números; la inferencia es llamar a la función.",
  why: "Todo en IA es un modelo. Una vez que ves un modelo como una función con números aprendidos, el resto de esta ruta trata de cómo se aprenden y se usan esos números.",
  body: `
<h3>La idea en una frase</h3>
<p>Un <b>modelo</b> es una función con algunos números ajustables adentro. Elegimos esos números para que la función dé buenas respuestas en los ejemplos.</p>
<h3>Explicación</h3>
<p>Imaginate que querés predecir el precio de un departamento a partir de sus metros: <code>price = w · m2 + b</code>. La forma de la función está fija (una recta), pero <code>w</code> y <code>b</code> son [[parameters|parámetros]].
Para saber si los números son buenos, comparamos las predicciones con los precios reales y calculamos el [[error|error]]. Un puntaje común es el
[[mean squared error (MSE)|error cuadrático medio (MSE)]]: elevás al cuadrado cada error y después promediás.</p>
<ul>
<li>[[Training|Entrenamiento]] = buscar los parámetros que hacen chico el error.</li>
<li>[[Inference|Inferencia]] = usar el modelo con los parámetros fijos para responder entradas nuevas. Cuando llamás a la API de un LLM, estás haciendo inferencia.</li>
</ul>
<p>Un LLM es la misma idea a gran escala: la entrada de la función es texto, la salida es una apuesta por el siguiente pedazo de texto, y en vez de dos parámetros hay <b>miles de millones</b>.</p>
<h3>Analogía</h3>
<p>Pensá en una receta con cantidades ajustables (cuánta sal, cuánto tiempo en el horno). Entrenar es un cocinero que prueba la receta miles de veces, compara el resultado con ejemplos del plato perfecto y ajusta las cantidades automáticamente hasta que sale bien.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> pensá en un <code>appsettings.json</code> lleno de números mágicos que cambian el comportamiento de una función. Entrenar es un proceso automático que afina esos números probando contra miles de ejemplos, como un loop de CI que sigue ajustando la configuración hasta que pasan los tests.</div>
<p class="tip">Probá la visualización: mové <code>w</code> y <code>b</code> para que el error sea lo más chico posible. Estás "entrenando" a mano.</p>`,
  res: ["Corto, visual, en inglés simple.", "8 minutos. Mirá cómo un LLM es \"una función con miles de millones de parámetros\"."],
  quiz: [
    ["¿Cuál es la diferencia entre entrenamiento e inferencia?", ["Son lo mismo", "El entrenamiento encuentra los parámetros; la inferencia usa parámetros fijos para responder", "La inferencia encuentra parámetros; el entrenamiento responde a los usuarios", "El entrenamiento solo pasa en celulares"], "Llamar a ChatGPT o a Claude es inferencia. El entrenamiento pasó antes, en el laboratorio."],
    ["¿Por qué elevamos los errores al cuadrado en el MSE?", ["Para que los errores grandes pesen más y desaparezcan los signos negativos", "Porque las computadoras prefieren los cuadrados", "Para achicar los números", "Lo exige el lenguaje de programación"], "El cuadrado vuelve positivo cada error y castiga más los errores grandes."],
    ["En price = w·m2 + b, ¿cuáles son los parámetros?", ["price y m2", "w y b", "Solo m2", "Solo price"], "m2 es la entrada, price es la salida, w y b se aprenden."],
    ["Un LLM se describe mejor como…", ["Una base de datos de respuestas", "Una función con miles de millones de parámetros aprendidos", "Un buscador", "Un motor de reglas escrito a mano"], "Guarda el conocimiento de forma implícita en sus parámetros, no como filas de respuestas."]],
  task: "Escribí un modelo lineal <code>predict(x) = w·x + b</code> y una función <code>mse</code> que mida su error cuadrático medio sobre un conjunto de pares (metros, precio). Probá 3 pares (w, b) distintos a mano e imprimí cuál tiene el MSE más bajo."
},
probability: {
  title: "Probabilidad básica y distribuciones",
  summary: "Una probabilidad es un número de 0 a 1. Una distribución le da una probabilidad a cada resultado posible, y todas suman 1. Un LLM devuelve una distribución sobre el siguiente token.",
  why: "Los modelos de lenguaje no devuelven respuestas: devuelven probabilidades sobre el siguiente token. La temperatura, el muestreo y las evals necesitan esta idea.",
  body: `
<h3>La idea en una frase</h3>
<p>Una [[probability|probabilidad]] es un número entre 0 (nunca) y 1 (siempre); una [[distribution|distribución]] lista todos los resultados posibles con sus probabilidades, y todas suman 1.</p>
<h3>Explicación</h3>
<ul>
<li><b>Ejemplo:</b> un dado sin trampa: cada cara tiene probabilidad 1/6 ≈ 0,167. Las seis suman 1.</li>
<li>[[Sampling|Muestreo]]: elegir un resultado al azar respetando las probabilidades. Si lo hacés muchas veces, los conteos se acercan a las probabilidades.</li>
<li>[[Conditional probability|Probabilidad condicional]]: P(A | B) = "probabilidad de A, sabiendo B". Ejemplo: P(palabra = "mat" | texto hasta ahora = "The cat sat on the").</li>
<li>[[Expected value|Valor esperado]]: el resultado promedio si repetís muchas veces (suma de valor × probabilidad).</li>
</ul>
<p><b>Por qué importa para la IA:</b> un LLM no devuelve una palabra. Devuelve una distribución sobre todos los tokens siguientes posibles, y después el sistema <b>muestrea</b> uno. Por eso el mismo prompt puede dar respuestas distintas, y por eso las evals necesitan muchas corridas.</p>
<h3>Analogía</h3>
<p>Una distribución de probabilidad es una bolsa de bolitas de colores: 6 rojas, 3 azules, 1 verde. Muestrear es cerrar los ojos y sacar una: lo más probable es que salga roja; la verde es rara, pero puede salir.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> una distribución es como un <code>Dictionary&lt;string, double&gt;</code> cuyos valores suman 1. Muestrear es <code>Random.Shared.NextDouble()</code> y recorrer el diccionario hasta que la suma acumulada supere ese número.</div>`,
  res: ["Interactivo. Hacé los capítulos 1 (Basic Probability) y 2 (Compound Probability).", "Leé la primera sección: cómo las probabilidades de las palabras siguientes guían la generación."],
  quiz: [
    ["Las probabilidades de todos los resultados de una distribución suman…", ["0", "1", "100", "Depende"], "Algo tiene que pasar, así que el total es 1 (100%)."],
    ["P(\"mat\" | \"The cat sat on the\") es un ejemplo de…", ["Probabilidad condicional", "Una matriz", "Una función de pérdida", "Una consulta a una base de datos"], "Probabilidad de la palabra siguiente, dadas las palabras anteriores."],
    ["Muestreás 10 veces de {A: 0.9, B: 0.1}. ¿Es posible que salga B 3 veces?", ["No, nunca", "Sí, es posible, solo que poco probable", "Solo en Linux", "Solo si B = 0.5"], "El muestreo es aleatorio; las muestras chicas pueden alejarse de las probabilidades reales."],
    ["¿Por qué el mismo prompt puede dar respuestas distintas en un LLM?", ["El modelo muestrea de una distribución", "Los servidores están rotos", "Los tokens están encriptados", "Nunca pasa"], "Con temperatura > 0 el siguiente token se muestrea; no siempre sale el más probable."]],
  task: "Escribí <code>sample(dist)</code>, que elija una clave al azar respetando las probabilidades de un diccionario. Corrélo 10.000 veces sobre <code>{mat: 0.6, floor: 0.25, sofa: 0.15}</code> e imprimí los conteos."
},
});
