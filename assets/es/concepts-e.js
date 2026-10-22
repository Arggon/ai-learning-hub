/* Spanish lesson content — part E. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
neural_nets: {
  title: "Redes neuronales",
  summary: "Una neurona = suma ponderada + sesgo + una curva simple (activación). Apilás muchas en capas (multiplicaciones de matrices) y podés aproximar casi cualquier función.",
  why: "Las redes neuronales son el bloque base de toda la IA moderna, incluidos los modelos de lenguaje.",
  body: `
<h3>La idea en una frase</h3>
<p>Una [[neural network|red neuronal]] son muchas funciones chiquitas (neuronas) conectadas en capas; cada neurona calcula una suma ponderada de sus entradas y después la curva con una función de activación.</p>
<h3>Una neurona</h3>
<pre class="formula">salida = activación( w1·x1 + w2·x2 + … + b )</pre>
<p>Esa suma ponderada es un producto escalar (de "Vectores"). El [[bias|sesgo]] <code>b</code> la desplaza. La [[activation function|función de activación]] agrega una curva: <b>ReLU</b> = <code>max(0, z)</code>, <b>sigmoide</b> aplasta todo a 0..1. Sin curvas, muchas capas se reducirían a una sola recta.</p>
<h3>Capas</h3>
<p>Una [[layer|capa]] son muchas neuronas que leen las mismas entradas = una matriz × vector, y después la activación. Una red [[deep|profunda]] tiene muchas capas: las primeras encuentran patrones simples y las siguientes los combinan en patrones complejos. Cada peso es un parámetro que el entrenamiento ajusta con descenso por gradiente.</p>
<h3>Analogía</h3>
<p>Una red neuronal es una línea de montaje: cada estación (capa) toma la salida de la anterior, la transforma un poco con sus propias perillas ajustables y la pasa. Nadie escribe las reglas; las perillas se aprenden.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> una red es un pipeline de LINQ: <code>input.Select(layer1).Select(layer2).Select(layer3)</code>, donde la lambda de cada capa tiene números aprendidos adentro. El programa está en los pesos, no en el código.</div>
<p class="tip">Abrí el <a href="https://playground.tensorflow.org/" target="_blank" rel="noopener">TensorFlow Playground</a> y entrená una red chiquita en tu navegador.</p>`,
  res: ["El clásico. Después mirá la playlist completa de la serie.", "Interactivo: agregá capas y mirá cómo aprende.", "Capítulos 1 a 7, de las neuronas a los transformers."],
  quiz: [
    ["¿Qué calcula una neurona?", ["Una búsqueda en una base de datos", "activación(suma ponderada de las entradas + sesgo)", "El promedio de todos los pesos", "Un número al azar"], "Producto escalar + sesgo, y después una curva no lineal."],
    ["¿Por qué necesitamos funciones de activación como ReLU?", ["Para que la red sea más rápida", "Sin ellas, las capas apiladas se reducen a una sola función lineal", "Para guardar datos", "Para tokenizar texto"], "Lineal de lineal sigue siendo lineal; las curvas dan poder expresivo."],
    ["Una capa entera de neuronas se calcula como…", ["Una matriz × vector, y después la activación", "Un JOIN de SQL", "Un algoritmo de ordenamiento", "Una tabla hash"], "Cada fila de la matriz de pesos es una neurona."],
    ["ReLU(−2) = ?", ["−2", "0", "2", "1"], "ReLU(z) = max(0, z)."]],
  task: "Armá una red chiquita 2-2-1 que calcule XOR con pesos elegidos a mano y activación ReLU. Comprobá las cuatro entradas. (El entrenamiento encontraría pesos como estos automáticamente.)"
},
backprop: {
  title: "Backpropagation (retropropagación)",
  summary: "Backprop calcula la pendiente de la pérdida para cada peso en una sola pasada hacia atrás, pasando la \"culpa\" desde la salida hacia atrás por cada operación (la regla de la cadena).",
  why: "La retropropagación es el algoritmo que hace posible entrenar redes grandes. Entenderla desmitifica eso de \"aprender\".",
  body: `
<h3>La idea en una frase</h3>
<p>La [[Backpropagation|retropropagación (backprop)]] es una forma eficiente de calcular el gradiente: corrés la red hacia adelante, después caminás hacia atrás y le decís a cada peso cuánto contribuyó al error.</p>
<h3>Explicación</h3>
<p>Mover cada peso de a uno (como en "Optimización") necesitaría miles de millones de pasadas hacia adelante. En cambio, durante la pasada hacia adelante registramos el [[computation graph|grafo de cómputo]]: cada +, ×, ReLU. Después vamos hacia atrás con una regla simple para cada operación:</p>
<ul>
<li>Para <code>c = a + b</code>: el gradiente de c pasa sin cambios a a y a b.</li>
<li>Para <code>c = a × b</code>: a recibe <code>b × grad(c)</code>, b recibe <code>a × grad(c)</code>.</li>
<li>Encadenalas: la [[chain rule|regla de la cadena]] dice "multiplicá las pendientes locales a lo largo del camino". Si un camino se bifurca, sumá las contribuciones.</li>
</ul>
<p>Bibliotecas como PyTorch hacen esto solas ([[autograd|diferenciación automática]]). Casi nunca lo vas a escribir a mano, pero conocerlo explica cosas como los "gradientes que se desvanecen" y por qué entrenar necesita tanta memoria (guarda los valores de la pasada hacia adelante).</p>
<h3>Analogía</h3>
<p>Un trabajo en equipo sacó mala nota. Partiendo de la nota final y yendo hacia atrás, calculás cuánto contribuyó la parte de cada persona al problema y le decís a cada uno cómo ajustar. Backprop hace esto para todos los pesos de la red a la vez.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> pensá en una traza distribuida de un pedido lento: la latencia total se conoce arriba, y la vas atribuyendo hacia atrás a cada span. Backprop atribuye el <i>error</i> hacia atrás a cada peso.</div>`,
  res: ["Primero la intuición; el capítulo 4 tiene el cálculo (opcional).", "2,5 h, en Python. La mejor explicación práctica; pasala a C# mientras la mirás.", "Corto, con diagramas del grafo."],
  quiz: [
    ["Para c = a × b con a = 3, b = 4 y grad(c) = 1, ¿cuánto vale grad(a)?", ["3", "4", "12", "1"], "grad(a) = b × grad(c) = 4 (regla de la cadena)."],
    ["Para c = a + b, ¿cómo fluye el gradiente?", ["Se divide a la mitad", "Se copia sin cambios a a y a b", "Solo va a a", "Se vuelve cero"], "La suma es un \"distribuidor de gradiente\"."],
    ["¿Por qué backprop es mejor que mover cada peso por separado?", ["Obtiene todos los gradientes en una sola pasada hacia atrás", "Usa menos datos", "No necesita una pérdida", "Evita las GPU"], "Cuesta ≈ una pasada extra en vez de una pasada por peso."],
    ["¿Qué hace el autograd de PyTorch?", ["Escribe tus prompts", "Arma el grafo de cómputo y calcula los gradientes automáticamente", "Descarga datos", "Tokeniza texto"], "Vos definís la pasada hacia adelante; .backward() hace el resto."]],
  task: "Reconstruí el núcleo de micrograd de Karpathy: un <code>Value</code> que soporte + y × y un <code>backward()</code> que complete los gradientes. Verificá para <code>L = (a·b + c)·f</code> con a=2, b=−3, c=10, f=−2 que grad(a) = 6."
},
embeddings: {
  title: "Embeddings (representaciones vectoriales)",
  summary: "Un embedding convierte texto (o código, imágenes) en un vector de modo que los significados parecidos queden cerca. Se comparan con similitud coseno.",
  why: "Los embeddings están detrás de la búsqueda semántica, las recomendaciones y RAG, y son lo primero que hace un modelo de lenguaje con el texto.",
  body: `
<h3>La idea en una frase</h3>
<p>Un [[embedding|embedding (vector que representa el significado)]] es una lista de números que representa el significado de algo; las cosas con significado parecido reciben vectores que apuntan en direcciones parecidas.</p>
<h3>Explicación</h3>
<ul>
<li>Un [[embedding model|modelo de embeddings]] es una red neuronal entrenada para que los textos relacionados terminen cerca. "¿Cómo reseteo mi contraseña?" y "Me olvidé el usuario" tienen una similitud coseno alta aunque no compartan palabras.</li>
<li>Tamaños típicos: de 384 a 3072 dimensiones. La visualización muestra un juguete en 2D para que lo puedas ver; los reales tienen cientos de ejes y ningún eje tiene un nombre humano simple.</li>
<li>Dentro de los LLM, el primer paso convierte cada ID de token en un vector de embedding (una tabla de búsqueda de vectores aprendidos).</li>
<li>Ejemplo famoso de word2vec: <code>king − man + woman ≈ queen</code> (rey − hombre + mujer ≈ reina). Las direcciones pueden tener significado.</li>
</ul>
<p><b>Usos:</b> búsqueda semántica, RAG, deduplicación, agrupamiento, recomendación, clasificación con pocos ejemplos.</p>
<h3>Analogía</h3>
<p>Los embeddings son coordenadas en un mapa del significado: las palabras u oraciones con significados parecidos quedan cerca, como ciudades de la misma región. Distancia en el mapa ≈ diferencia de significado.</p>
<div class="lang-note" data-lang="csharp"><b>Si sabés C#/.NET:</b> es como <code>GetHashCode()</code>, pero con el objetivo opuesto: un hash separa mucho las entradas parecidas; un embedding las junta. En .NET, <code>IEmbeddingGenerator&lt;string, Embedding&lt;float&gt;&gt;</code> de Microsoft.Extensions.AI los genera.</div>`,
  res: ["La mejor introducción visual a los embeddings.", "Módulos cortos con ejercicios.", "El punto de vista de .NET."],
  quiz: [
    ["Dos textos tienen embeddings con similitud coseno 0,92. Esto quiere decir que…", ["Probablemente hablan de cosas muy parecidas", "Comparten el 92% de las palabras", "Uno es 92% más largo", "Nada"], "Coseno alto = los vectores apuntan para el mismo lado = significado parecido."],
    ["¿Dos oraciones sin palabras en común pueden tener embeddings parecidos?", ["No, nunca", "Sí: los embeddings capturan el significado, no las palabras exactas", "Solo en inglés", "Solo si tienen el mismo largo"], "Esa es la gran ventaja frente a la búsqueda por palabras clave."],
    ["rey − hombre + mujer ≈ ?", ["prince", "queen", "man", "kingdom"], "La analogía clásica de word2vec (rey − hombre + mujer ≈ reina)."],
    ["¿En qué se diferencia un embedding de un código hash?", ["Los hashes juntan las entradas parecidas; los embeddings las separan", "Los embeddings juntan los significados parecidos; los hashes separan las entradas parecidas", "Son lo mismo", "Los embeddings siempre son de 32 bits"], "Objetivos opuestos."]],
  task: "Con algunos vectores de palabras de juguete, escribí <code>nearest(vector, k)</code> usando similitud coseno y usala para la analogía <code>king − man + woman</code>. Bonus: reemplazá los vectores de juguete por una llamada real a una API de embeddings."
},
});
