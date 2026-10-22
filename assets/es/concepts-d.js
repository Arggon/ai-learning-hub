/* Spanish lesson content — part D. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
vectors: {
  title: "Vectores y matrices (intuición)",
  summary: "Un vector es un float[]: un punto o una flecha. El producto escalar mide cuánto apuntan dos vectores en la misma dirección. Una matriz es un float[,] que transforma vectores.",
  why: "Las computadoras representan el significado como listas de números. Los embeddings, la atención y la búsqueda se reducen a comparar y multiplicar vectores.",
  body: `
<h3>La idea en una frase</h3>
<p>Un [[vector|vector]] es una lista de números (un <code>float[]</code>); una [[matrix|matriz]] es una tabla de números que convierte un vector en otro.</p>
<h3>Vectores</h3>
<p>El vector <code>[3, 2]</code> es una flecha desde (0,0) hasta el punto (3,2). Con 2 números lo podés dibujar; la IA usa vectores con 768 o 3072 números: imposibles de dibujar, pero valen las mismas reglas.</p>
<ul>
<li><b>Largo</b> (norma): √(3² + 2²) ≈ 3,6. Pitágoras.</li>
<li>[[Dot product|Producto escalar (producto punto)]]: multiplicás posición por posición y sumás: <code>[3,2]·[1,4] = 3·1 + 2·4 = 11</code>. Positivo y grande = apuntan para el mismo lado; 0 = perpendiculares; negativo = opuestos.</li>
<li>[[Cosine similarity|Similitud coseno]]: el producto escalar dividido por los dos largos. Siempre está entre −1 y 1. Es LA medida que se usa para comparar embeddings.</li>
</ul>
<h3>Matrices</h3>
<p>Una matriz de 2 filas y 3 columnas, multiplicada por un vector de 3 números, da un vector de 2 números. Cada número de salida es el producto escalar de una fila con la entrada. O sea, una matriz es una <b>función de vectores a vectores</b>, y las redes neuronales son, en su mayoría, muchas multiplicaciones de matrices.</p>
<h3>Analogía</h3>
<p>Un vector es una lista de puntajes, como una película calificada en [acción, romance, comedia]. Una matriz es una tabla entera de esas reglas; multiplicar una matriz por un vector es completar una planilla de fórmulas de multiplicar y sumar. Las GPU son tan populares en IA porque hacen millones de estas en paralelo.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> matriz × vector es solo un <code>for</code> anidado. Las GPU son populares en IA porque corren millones de estas operaciones de multiplicar y sumar en paralelo.</div>`,
  res: ["10 minutos, pura intuición.", "Por qué una matriz es una función que mueve el espacio."],
  quiz: [
    ["[1, 2] · [3, 4] = ?", ["10", "11", "14", "[3, 8]"], "1·3 + 2·4 = 3 + 8 = 11."],
    ["Dos vectores son perpendiculares. Su similitud coseno es…", ["1", "0", "−1", "Infinito"], "Perpendicular quiere decir sin dirección compartida: coseno 0."],
    ["Una matriz de 2×3 por un vector de 3 números da…", ["Un vector de 3 números", "Un vector de 2 números", "Un solo número", "Siempre un error"], "Una salida por fila: 2 filas → 2 números."],
    ["¿Por qué se usan GPU para IA?", ["Tienen más RAM que las CPU", "Hacen cantidades enormes de operaciones de multiplicar y sumar en paralelo", "Son más baratas", "Corren más rápido los programas comunes"], "La multiplicación de matrices es masivamente paralela."]],
  task: "Implementá <code>dot</code>, <code>norm</code>, <code>cosine</code> y <code>matVec</code> (matriz × vector). Probá: <code>cosine([1,0],[0,1]) = 0</code> y <code>cosine([1,1],[2,2]) = 1</code>."
},
optimization: {
  title: "Pendientes y optimización (descenso por gradiente)",
  summary: "Para entrenar un modelo, medís el error, buscás qué dirección lo achica (la pendiente), das un paso chiquito y repetís. Eso es el descenso por gradiente.",
  why: "El descenso por gradiente es la forma en que aprende todo modelo moderno, desde una recta hasta un modelo con miles de millones de parámetros.",
  body: `
<h3>La idea en una frase</h3>
<p>[[Gradient descent|Descenso por gradiente]] = "sentí la pendiente bajo tus pies y da un pasito cuesta abajo, muchas veces", donde la colina es el error del modelo.</p>
<h3>Explicación (sin cálculo)</h3>
<p>La [[loss function|función de pérdida]] dice qué tan equivocado está el modelo con ciertos parámetros. Cuanto más baja, mejor. Para un solo parámetro <code>w</code> podemos estimar la [[slope|pendiente]] con un empujoncito diminuto:</p>
<pre class="formula">pendiente ≈ ( loss(w + 0.001) − loss(w) ) / 0.001</pre>
<p>Si la pendiente es positiva, aumentar <code>w</code> empeora las cosas, así que lo bajamos. La regla de actualización es:</p>
<pre class="formula">w = w − learningRate × pendiente</pre>
<ul>
<li>[[Learning rate|Tasa de aprendizaje]] demasiado chica: lentísimo. Demasiado grande: saltás por encima del valle y hasta puede explotar.</li>
<li>Con millones de parámetros, la lista de todas las pendientes se llama [[gradient|gradiente]]. Las próximas páginas explican cómo se calcula de forma eficiente (backpropagation).</li>
<li>El terreno puede tener varios valles ([[local minima|mínimos locales]]); en redes neuronales grandes esto es menos problema de lo que se esperaba.</li>
</ul>
<h3>Analogía</h3>
<p>Estás en una colina con niebla y querés llegar al valle. No ves lejos, pero sentís para qué lado baja el suelo bajo tus pies. Das un pasito cuesta abajo, volvés a sentir, repetís. Eso es el descenso por gradiente.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> es como afinar un backoff de reintentos a prueba y error: medís la latencia, movés un poco el valor y te quedás con el cambio si mejoró. Pero automático, con la matemática diciéndote la dirección.</div>`,
  res: ["Capítulo 2 de la serie sobre redes neuronales.", "Muy lento y claro; bueno para practicar inglés escuchado."],
  quiz: [
    ["La pendiente en el w actual es negativa. Para bajar la pérdida tenés que…", ["Aumentar w", "Disminuir w", "Frenar el entrenamiento", "Elevar w al cuadrado"], "w = w − lr × (negativo) → w sube."],
    ["La tasa de aprendizaje es demasiado grande. ¿Qué suele pasar?", ["El entrenamiento es lentísimo pero estable", "Los pasos saltan por encima del mínimo y puede divergir", "No cambia nada", "El modelo se achica"], "Probá lr = 1.1 en la visualización."],
    ["¿Qué es el gradiente?", ["La lista de pendientes de cada parámetro", "La respuesta final", "Un tipo de GPU", "Los datos de entrenamiento"], "Una pendiente por parámetro, todas juntas."],
    ["La pérdida mide…", ["Qué tan rápido es el modelo", "Qué tan equivocado está el modelo", "Qué tan grande es el dataset", "El uso de memoria"], "El entrenamiento intenta hacerla lo más chica posible."]],
  task: "Minimizá <code>loss(w) = (w − 3)²</code> con descenso por gradiente, arrancando en <code>w = −5</code> y estimando la pendiente numéricamente. Imprimí w cada 10 pasos. Después ajustá el modelo lineal de \"¿Qué es un modelo?\" de la misma forma para w y b (primero escalá los metros a cientos, o los pasos explotan)."
},
ml_basics: {
  title: "Fundamentos de machine learning",
  summary: "Aprender de ejemplos y comprobar con datos que el modelo nunca vio. Divisiones de entrenamiento/validación/prueba, sobreajuste vs. subajuste, y las tres grandes familias del ML.",
  why: "Los datos de entrenamiento vs. los de prueba y el sobreajuste explican por qué los modelos fallan en el mundo real y cómo medirlos honestamente.",
  body: `
<h3>La idea en una frase</h3>
<p>[[Machine learning|Machine learning (aprendizaje automático)]] = elegís la forma de un modelo, entrenás sus parámetros con ejemplos y lo comprobás con ejemplos <b>nuevos</b> para asegurarte de que aprendió el patrón y no las respuestas.</p>
<h3>Tres familias</h3>
<ul>
<li>[[Supervised learning|Aprendizaje supervisado]]: los ejemplos traen la respuesta correcta (etiqueta). "Este mail → spam". El preentrenamiento de un LLM es una variante: la etiqueta es simplemente el siguiente token.</li>
<li>[[Unsupervised learning|Aprendizaje no supervisado]]: sin etiquetas; se busca estructura (grupos, elementos parecidos).</li>
<li>[[Reinforcement learning|Aprendizaje por refuerzo]]: un agente actúa y recibe recompensas. Se usa en RLHF y en los modelos de razonamiento.</li>
</ul>
<h3>Divisiones y sobreajuste</h3>
<p>Dividí los datos: [[training set|conjunto de entrenamiento]] (para aprender), [[validation set|conjunto de validación]] (para elegir configuraciones), [[test set|conjunto de prueba]] (el puntaje final honesto, se usa una sola vez).</p>
<p>[[Overfitting|Sobreajuste]]: el modelo memoriza los ejemplos de entrenamiento, ruido incluido, y falla con los nuevos. [[Underfitting|Subajuste]]: el modelo es demasiado simple para captar el patrón. Mové el control: una curva muy flexible tiene un error de entrenamiento mínimo pero un error de prueba grande.</p>
<h3>Analogía</h3>
<p>El sobreajuste es un estudiante que se memoriza las respuestas del examen del año pasado en vez de aprender la materia: perfecto en el simulacro, perdido en el examen de verdad. El conjunto de prueba es el examen real que el modelo nunca vio.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> el sobreajuste es como escribir código que pasa los tests unitarios hardcodeando los valores esperados (<code>if (input == 42) return 7;</code>). El conjunto de prueba es la suite de tests de integración oculta que tu código nunca vio.</div>`,
  res: ["La biblioteca estándar de ML en Python: fit, predict y división train/test en pocas líneas.", "Diagramas claros de las curvas de entrenamiento y prueba.", "ML clásico en C#: regresión, clasificación, AutoML."],
  quiz: [
    ["El error de entrenamiento es muy bajo pero el de prueba es alto. Esto es…", ["Subajuste", "Sobreajuste", "Aprendizaje perfecto", "Un bug en la GPU"], "El modelo memorizó los datos de entrenamiento y no generaliza."],
    ["¿Por qué guardar un conjunto de prueba que el modelo nunca ve durante el entrenamiento?", ["Para ahorrar memoria", "Para tener una estimación honesta del rendimiento con datos nuevos", "Porque lo exige la ley", "Para entrenar más rápido"], "Puntuar con los datos de entrenamiento es como evaluar alumnos con preguntas que ya vieron."],
    ["Aprender a jugar un juego a partir de victorias y derrotas es…", ["Supervisado", "No supervisado", "Aprendizaje por refuerzo", "Tokenización"], "Recompensas en vez de etiquetas."],
    ["El preentrenamiento de un LLM (predecir el siguiente token) se parece más a…", ["Aprendizaje supervisado con etiquetas sacadas del propio texto", "Reglas puras", "Agrupamiento no supervisado", "Etiquetar a mano cada oración"], "Se suele llamar autosupervisado: el texto aporta sus propias etiquetas."]],
  task: "Escribí <code>split(data, testFraction, seed)</code>, que mezcle un dataset y devuelva (train, test). Opcional: entrená una regresión con una biblioteca de ML real (scikit-learn en Python, ML.NET en C#) e imprimí el R² sobre el conjunto de prueba."
},
});
