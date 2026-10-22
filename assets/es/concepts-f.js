/* Spanish lesson content — part F. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
tokenization: {
  title: "Tokenización",
  summary: "Los modelos leen tokens (pedazos frecuentes de texto), no letras ni palabras. La cantidad de tokens define el costo, la velocidad y los límites de contexto, y explica algunos errores raros de los LLM.",
  why: "Los modelos leen tokens, no caracteres ni palabras. Los tokens definen el costo, los límites de contexto y algunos errores extraños de los modelos.",
  body: `
<h3>La idea en una frase</h3>
<p>Un [[tokenizer|tokenizador]] corta el texto en [[tokens|tokens (pedacitos de texto)]] (pedazos frecuentes como <code>"ing"</code>, <code>" the"</code>, <code>"Console"</code>) y le asigna a cada uno un ID entero; el modelo solo ve esos IDs.</p>
<h3>Explicación</h3>
<ul>
<li>La mayoría de los LLM usan [[Byte-Pair Encoding (BPE)|codificación por pares de bytes (BPE)]]: arrancás desde caracteres sueltos (bytes), buscás el par vecino más frecuente en un corpus grande, lo fusionás en un token nuevo y repetís decenas de miles de veces. La visualización corre este algoritmo en vivo.</li>
<li>Regla práctica para el inglés: 1 token ≈ 4 caracteres ≈ ¾ de palabra. El español y el código suelen usar <b>más tokens</b> por palabra, así que cuestan más.</li>
<li>Por qué a los LLM les cuesta contar las letras de "strawberry" o dar vuelta un texto: ven tokens como <code>"str" "aw" "berry"</code>, no letras.</li>
<li>Todo se mide en tokens: el precio, el límite de la [[context window|ventana de contexto]] y la velocidad de salida (tokens por segundo).</li>
</ul>
<h3>Analogía</h3>
<p>Es como partir el texto en ladrillos de LEGO: las palabras comunes son un solo ladrillo grande y las raras se arman con varios chiquitos. El juego de ladrillos (el vocabulario) se aprende a partir de muchísimo texto.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> es como el lexer de un compilador (Roslyn convierte el código fuente en tokens antes de parsearlo), pero el vocabulario se aprende de los datos en lugar de definirse con una gramática.</div>
<p class="tip">Probá tokenizadores reales en <a href="https://tiktokenizer.vercel.app/" target="_blank" rel="noopener">Tiktokenizer</a>. Pegá un fragmento de código y un párrafo en otro idioma (no en inglés) y compará las cantidades.</p>`,
  res: ["2 h, en Python. Mirá los primeros 30 minutos para tener el panorama.", "Ejemplo de BPE paso a paso.", "Los tokens explicados para quienes programan en .NET."],
  quiz: [
    ["¿Qué recibe realmente el modelo como entrada?", ["Caracteres crudos", "IDs enteros de tokens", "Oraciones enteras", "Audio"], "Texto → tokens → IDs → vectores de embedding."],
    ["¿Más o menos cuántos tokens son 400 caracteres de inglés?", ["≈ 10", "≈ 100", "≈ 400", "≈ 1600"], "≈ 4 caracteres por token."],
    ["¿Por qué los LLM pueden fallar al contar las erres de \"strawberry\"?", ["Ven tokens de varias letras, no letras sueltas", "No pueden hacer nada de matemática", "La palabra es demasiado larga", "Por la temperatura"], "Las letras quedan escondidas dentro de los tokens."],
    ["¿Qué hace BPE una y otra vez?", ["Borra las palabras raras", "Fusiona el par vecino más frecuente en un token nuevo", "Traduce al inglés", "Ordena el vocabulario alfabéticamente"], "Cada fusión agrega una entrada al vocabulario."]],
  task: "Implementá un paso del entrenamiento de BPE: contá los pares de tokens vecinos en todas las palabras, encontrá el par más frecuente y fusionalo en todos lados. Corré 10 pasos sobre <code>\"low lower lowest newer wider\"</code> e imprimí cada fusión."
},
next_token: {
  title: "Modelos de lenguaje: predecir el próximo token",
  summary: "Un LLM toma los tokens que hay hasta ahora y devuelve una probabilidad para cada token siguiente posible. Generar = elegir uno, agregarlo, repetir. La temperatura controla qué tan arriesgada es la elección.",
  why: "Cada respuesta de un LLM se produce de a un token por vez. Esto explica el streaming, la temperatura y por qué los modelos pueden decir cosas incorrectas con total seguridad.",
  body: `
<h3>La idea en una frase</h3>
<p>Un [[language model|modelo de lenguaje]] es una función: <code>tokens hasta ahora → probabilidad de cada token siguiente posible</code>. Para escribir texto, la llamás en un bucle.</p>
<h3>Explicación</h3>
<ol>
<li>El modelo devuelve un puntaje crudo por cada token del vocabulario, llamados [[logits|logits (puntajes crudos antes de normalizar)]].</li>
<li>[[Softmax|Softmax (convierte puntajes en probabilidades)]] transforma los logits en probabilidades: <code>p_i = e^(logit_i / T) / suma de todos los e^(logit_j / T)</code>. (<code>e^x</code> solo vuelve todo positivo y exagera las diferencias.)</li>
<li>Elegís un token ([[decoding|decodificación]]): siempre el más probable ([[greedy|greedy (codicioso)]]) o muestreás. Una [[Temperature|temperatura]] T &lt; 1 afila la distribución (más segura, repetitiva); T &gt; 1 la aplana (creativa, más errores). [[Top-p|Top-p (muestrear solo entre los más probables)]] se queda solo con los tokens más probables que suman p.</li>
<li>Agregás el token y repetís hasta un token de parada o <code>max_tokens</code>. Esta es la generación [[autoregressive|autorregresiva]]: un token por vez, y por eso la salida es más lenta y más cara que la entrada.</li>
</ol>
<p><b>Consecuencia importante:</b> el modelo produce continuaciones <i>plausibles</i>, no datos verificados. Las [[Hallucinations|alucinaciones]] son texto plausible que resulta ser falso.</p>
<h3>Analogía</h3>
<p>El autocompletado del teclado del celular, pero agrandado una barbaridad: sugiere la palabra siguiente, la agrega, vuelve a sugerir. Un ensayo entero se escribe de a un pedazo, y cada pedazo se elige de una lista de opciones probables.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> la generación es un <code>IAsyncEnumerable&lt;string&gt;</code> con <code>yield return</code>: cada iteración llama al modelo con todo lo producido hasta ahora. Eso es exactamente lo que te dan las APIs con streaming.</div>`,
  res: ["Si lo salteaste en \"¿Qué es un modelo?\", miralo ahora.", "Greedy, beam search, top-k y top-p, con ejemplos.", "La sección sobre la temperatura y \"por qué no siempre la palabra más probable\"."],
  quiz: [
    ["¿Qué devuelve un LLM en cada paso?", ["Un párrafo entero", "Una probabilidad para cada token del vocabulario", "Una consulta SQL", "Una sola palabra, de forma determinista"], "Después una estrategia de decodificación elige un token."],
    ["Temperatura = 0 (o greedy) significa…", ["Elegir siempre el token más probable", "Elegir al azar entre todos los tokens", "El modelo está apagado", "Usar más GPU"], "Temperatura baja = salida casi determinista y enfocada."],
    ["¿Por qué los tokens de salida son más lentos que los de entrada?", ["Se generan de a uno en un bucle", "Son más grandes", "Están encriptados", "No lo son"], "La entrada se procesa en paralelo; la salida es autorregresiva."],
    ["Una alucinación se explica mejor como…", ["Un bug en la API", "Texto que parece creíble pero no es verdad", "Un error del tokenizador", "Solo exceso de temperatura"], "El objetivo es \"texto probable\", no \"texto verdadero\"."]],
  task: "Implementá <code>softmax(logits, temperature)</code> y después un bucle de generación sobre una tabla de bigramas chiquita (la palabra siguiente depende solo de la anterior). Generá 8 palabras con temperatura 0.2, 1.0 y 2.0 y compará."
},
attention: {
  title: "Atención (mecanismo de atención)",
  summary: "La atención le permite a cada token mirar a los demás tokens y traerse la información que necesita. Es una búsqueda suave en un diccionario: consulta vs. claves → pesos → mezcla de valores.",
  why: "La atención es la idea clave detrás de los transformers: cómo un modelo usa el contexto para decidir qué significa cada palabra.",
  body: `
<h3>La idea en una frase</h3>
<p>La [[Attention|atención]] le permite a cada token preguntar "¿qué tokens anteriores me importan?" y mezclar su información en su propio vector.</p>
<h3>Explicación</h3>
<p>En "The animal didn't cross the street because <b>it</b> was too tired" ("El animal no cruzó la calle porque <b>estaba</b> muy cansado"), el vector de <i>it</i> tiene que recibir información de <i>animal</i>. Para cada token, el modelo calcula tres vectores con matrices aprendidas:</p>
<ul>
<li>[[Query|Consulta]] (Q): ¿qué estoy buscando?</li>
<li>[[Key|Clave]] (K): ¿qué contengo?</li>
<li>[[Value|Valor]] (V): ¿qué voy a aportar si me elegís?</li>
</ul>
<p>Puntaje = dot(Q de este token, K de cada otro token) / √d → softmax → pesos que suman 1 → salida = suma ponderada de los vectores V. Eso es el mapa de calor: cada fila es un token y cada celda es cuánto atiende a otro token.</p>
<ul>
<li>[[Causal mask|Máscara causal]]: en los modelos tipo GPT un token solo puede mirar los tokens <b>anteriores</b> (no puede leer el futuro que intenta predecir).</li>
<li>[[Multi-head attention|Atención multi-cabeza]]: muchas "cabezas" de atención corren en paralelo y cada una aprende un tipo distinto de relación (gramática, correferencia, llaves en el código…).</li>
<li>Costo: cada token se compara con todos los demás, así que el costo crece con el <b>cuadrado</b> del largo del contexto. Es una de las razones por las que los contextos largos son caros.</li>
</ul>
<h3>Analogía</h3>
<p>Cuando leés "El gato se sentó en la alfombra porque estaba cansado", mirás para atrás para entender quién estaba cansado. La atención le permite a cada palabra mirar las anteriores y decidir cuánto le importa cada una: una búsqueda suave que mezcla información de las palabras más relevantes.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> una búsqueda en un <code>Dictionary&lt;K,V&gt;</code> devuelve el valor cuya clave coincide exactamente. La atención es una búsqueda <i>suave</i>: todas las claves coinciden un poco, y obtenés una mezcla de todos los valores ponderada según qué tan bien coincide cada clave con tu consulta.</div>
<p class="warn">Los pesos del mapa de calor están hechos a mano para ilustrar la idea; no salen de un modelo real.</p>`,
  res: ["La explicación visual más clara de Q, K y V.", "Diagramas paso a paso famosos; leé la parte de self-attention.", "GPT-2 en vivo en tu navegador; hacé clic para entrar en la atención."],
  quiz: [
    ["En la atención, el puntaje entre dos tokens se calcula a partir de…", ["Consulta · Clave", "Valor · Valor", "La diferencia entre IDs de token", "Ruido aleatorio"], "El producto escalar de la consulta de un token y la clave de otro."],
    ["¿Por qué un modelo tipo GPT usa una máscara causal?", ["Solo para ahorrar memoria", "Para que un token no pueda mirar los tokens futuros que tiene que predecir", "Para ocultar datos privados", "Para sacar palabras vacías"], "Si no, el entrenamiento sería \"hacer trampa\"."],
    ["El costo de la atención crece con el largo del contexto n más o menos como…", ["n", "n² (cada token contra cada token)", "log n", "No crece"], "Una matriz de puntajes de n×n."],
    ["¿Qué es la atención multi-cabeza?", ["Varios cálculos de atención en paralelo, cada uno aprende relaciones distintas", "Usar varias GPU", "Varios usuarios chateando", "Un tokenizador más grande"], "Cada cabeza tiene sus propias matrices Q, K y V."]],
  task: "Implementá la atención de producto escalar escalado para arrays chiquitos: <code>attend(Q, K, V, causal)</code>. Imprimí la matriz de pesos para 3 tokens y comprobá que cada fila suma 1 y que las filas causales tienen ceros por encima de la diagonal."
},
});
