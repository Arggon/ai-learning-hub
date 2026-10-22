/* Spanish lesson content — part B. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
web_apis: {
  title: "Cómo funcionan la web y las APIs",
  summary: "Un cliente manda un pedido HTTP (método, URL, encabezados, cuerpo) a un servidor, que devuelve una respuesta (código de estado, encabezados, cuerpo). Una API es un conjunto de esos pedidos que un programa puede hacer.",
  why: "Usar un modelo de IA desde código es mandar pedidos HTTP a una API. Las herramientas, los agentes y los servidores MCP se apoyan todos en esta idea de pedido/respuesta.",
  body: `
<h3>La idea en una frase</h3>
<p>En la web, un [[client|cliente]] pregunta y un [[server|servidor]] responde, usando el formato [[HTTP|HTTP]]; una [[API|API (interfaz para que los programas se comuniquen)]] es una lista documentada de preguntas que un programa tiene permitido hacer.</p>
<h3>Pedido y respuesta</h3>
<ul>
<li><b>Pedido (request):</b> un [[method|método HTTP]] (<code>GET</code> = leer, <code>POST</code> = crear/enviar, <code>PUT</code>/<code>PATCH</code> = actualizar, <code>DELETE</code> = borrar), una URL (<code>https://api.example.com/orders/42</code>), [[headers|encabezados]] (información extra, como una [[API key|clave de API]] para autenticarte) y a veces un [[body|cuerpo]] (casi siempre JSON).</li>
<li><b>Respuesta (response):</b> un [[status code|código de estado]] (<code>200</code> OK, <code>201</code> creado, <code>400</code> pedido mal formado, <code>401</code> sin autenticar, <code>404</code> no encontrado, <code>429</code> demasiados pedidos, <code>500</code> error del servidor), más encabezados y un cuerpo.</li>
<li>[[REST|REST]] es un estilo común de diseño de APIs: las URLs nombran cosas (<code>/orders/42</code>) y los métodos dicen qué hacer con ellas.</li>
<li>Algunas respuestas llegan de a pedacitos ([[streaming|streaming]]); las apps de chat lo usan para mostrar el texto a medida que se genera.</li>
</ul>
<h3>Analogía</h3>
<p>Pedir en un restaurante: vos (el cliente) le das al mozo una comanda (el pedido) con lo que querés y tu número de mesa (los encabezados). La cocina (el servidor) te manda el plato, o una nota: "eso se terminó" (404) o "hay demasiados pedidos, esperá" (429). La carta es la documentación de la API.</p>`,
  res: ["Clientes, servidores, DNS, paquetes: explicado simple.", "Pedidos, respuestas, métodos y encabezados.", "Referencia: qué significa cada código."],
  quiz: [
    ["¿Qué método HTTP suele leer datos sin cambiarlos?", ["POST", "GET", "DELETE", "PATCH"], "GET es para leer."],
    ["Una respuesta con estado 404 significa…", ["Éxito", "No encontrado", "El servidor se cayó", "Demasiados pedidos"], "El recurso no existe en esa URL."],
    ["¿Dónde se suele mandar una clave de API?", ["Siempre en la ruta de la URL", "En un encabezado del pedido", "En el código de estado", "Nunca se manda"], "Por ejemplo, en los encabezados Authorization o x-api-key."],
    ["Una API de IA te devuelve el estado 429. ¿Qué debería hacer tu código?", ["Reintentar enseguida en un bucle sin pausa", "Esperar y reintentar más tarde (back-off)", "Borrar la cuenta", "Ignorarlo"], "429 = límite de pedidos; esperá un poco y reintentá."]],
  task: "Llamá a una API pública de prueba gratuita (<code>https://httpbin.org/get</code> o cualquier API JSON que te guste), imprimí el código de estado e imprimí un campo del cuerpo JSON. Después pedí una URL que no existe e imprimí su código de estado."
},
db_basics: {
  title: "Bases de datos: lo básico",
  summary: "Una base de datos guarda datos en tablas (filas y columnas) y responde preguntas con consultas. Un índice hace que las búsquedas frecuentes sean rápidas sin leer cada fila.",
  why: "Las apps de IA guardan documentos, historiales de chat y embeddings en bases de datos. Las bases de datos vectoriales (para RAG) se construyen directamente sobre estas ideas.",
  body: `
<h3>La idea en una frase</h3>
<p>Una [[database|base de datos]] mantiene los datos seguros y ordenados, y te deja hacer preguntas como "todos los pedidos del cliente 7, del más nuevo al más viejo" con una [[query|consulta]].</p>
<h3>Explicación</h3>
<ul>
<li>Una [[table|tabla]] tiene [[columns|columnas]] (campos como <code>id</code>, <code>customer</code>, <code>total</code>) y [[rows|filas]] (un registro cada una). Una planilla de cálculo es una buena imagen mental.</li>
<li>[[SQL|SQL]] es el lenguaje estándar de las bases de datos relacionales: <code>SELECT customer, total FROM orders WHERE total &gt; 50 ORDER BY total DESC LIMIT 5;</code></li>
<li>Una [[primary key|clave primaria]] identifica cada fila de forma única (normalmente <code>id</code>).</li>
<li>Un [[index|índice]] es una estructura de búsqueda ordenada, como el índice al final de un libro: la base puede saltar directo a las filas que coinciden en vez de recorrerlas todas.</li>
<li>Algunas bases guardan documentos (JSON) en lugar de tablas, y las <b>bases de datos vectoriales</b> responden "¿qué filas son las más <i>parecidas</i> a esta?". Las vas a conocer en la parte de RAG.</li>
</ul>
<h3>Analogía</h3>
<p>Una biblioteca: las tablas son estantes con el mismo tipo de libro, las filas son los libros y las columnas son lo que dice cada etiqueta. Una consulta es preguntarle al bibliotecario; un índice es el catálogo que le dice a qué estante ir.</p>`,
  res: ["Aprendé SQL en el navegador, ejercicio por ejercicio.", "Es largo; los primeros 45 minutos cubren lo esencial.", "Tablas, consultas, joins: en una base de datos real."],
  quiz: [
    ["En una tabla, un registro (por ejemplo, un pedido) es una…", ["Columna", "Fila", "Índice", "Consulta"], "Las filas son registros; las columnas son campos."],
    ["¿Qué palabra clave de SQL filtra filas?", ["ORDER BY", "WHERE", "LIMIT", "FROM"], "WHERE se queda solo con las filas que cumplen la condición."],
    ["¿Para qué agregar un índice?", ["Para que algunas búsquedas sean mucho más rápidas", "Para borrar filas viejas", "Para encriptar datos", "Para cambiar nombres de columnas"], "Evita recorrer todas las filas."],
    ["Una clave primaria es…", ["Una contraseña", "Un valor que identifica cada fila de forma única", "Siempre la primera columna", "Un backup"], "No hay dos filas que la compartan."]],
  task: "Con SQLite (viene incluido en Python; o cualquier base SQL), creá una tabla <code>orders</code>, insertá 4 filas y consultá los 2 pedidos más grandes de un cliente. Bonus: agregá un índice sobre <code>customer</code>."
},
math_basics: {
  title: "La matemática que necesitás",
  summary: "Funciones y gráficos (y = w·x + b), porcentajes, cuadrados, y exponentes y logaritmos. Es toda la matemática que necesita este hub; cada fórmula que aparezca después también se explica con palabras.",
  why: "Los modelos son funciones, el entrenamiento lee pendientes en gráficos, las probabilidades son porcentajes, y softmax y la pérdida usan exponentes y logaritmos. Con estas cinco ideas, el resto se vuelve accesible.",
  body: `
<h3>La idea en una frase</h3>
<p>Necesitás cinco ideas de la escuela: funciones, gráficos, porcentajes, cuadrados, y exponentes con su opuesto, los logaritmos.</p>
<h3>1. Funciones y gráficos</h3>
<p>Una [[function|función]] matemática da una salida para cada entrada: <code>y = 2x + 1</code>. Un gráfico dibuja todos los pares (x, y). En la recta <code>y = w·x + b</code>, <code>w</code> es la [[slope|pendiente]] (qué tan empinada es) y <code>b</code> es donde la recta corta el eje vertical.</p>
<h3>2. Porcentajes</h3>
<p>Por ciento quiere decir "por cada cien": 25% = 25/100 = 0,25. Las probabilidades se escriben de las dos formas: 0,9 = 90%.</p>
<h3>3. Cuadrados</h3>
<p>3² = 3 × 3 = 9 y (−3)² = 9. Elevar al cuadrado vuelve positivos los números negativos y agranda muchísimo los números grandes: sirve para medir errores.</p>
<h3>4. Exponentes</h3>
<p>Un [[exponent|exponente]] dice cuántas veces multiplicar: 2³ = 2 × 2 × 2 = 8. El crecimiento exponencial es rapidísimo: 2¹⁰ = 1024. El número especial <code>e ≈ 2,718</code> aparece seguido; <code>eˣ</code> siempre es positivo.</p>
<h3>5. Logaritmos</h3>
<p>Un [[logarithm|logaritmo]] es la pregunta opuesta: "¿a qué potencia hay que elevar 2 para obtener 8?" → log₂(8) = 3. Los logaritmos convierten rangos enormes en rangos chicos: log₁₀(1.000.000) = 6. El logaritmo de un número entre 0 y 1 es negativo: log(0,5) &lt; 0. Vas a ver <code>−log(p)</code> como un puntaje de "sorpresa": chico cuando p está cerca de 1, grande cuando p es diminuto.</p>
<h3>Analogía</h3>
<p>Los exponentes son como el interés compuesto o un rumor que se esparce (cada paso multiplica). Los logaritmos son como contar dígitos: te dicen "cuántos pasos de multiplicar" hicieron falta para llegar hasta acá.</p>`,
  res: ["Cómo funcionan los gráficos y los puntos (x, y), con ejemplos interactivos.", "Exponentes y logaritmos explicados con calma.", "Una clase en vivo que construye intuición sobre exponentes y logaritmos."],
  quiz: [
    ["En y = 3x + 2, ¿cuánto vale y cuando x = 4?", ["9", "14", "12", "24"], "3 × 4 + 2 = 14."],
    ["0,35 como porcentaje es…", ["3,5%", "35%", "0,35%", "350%"], "Multiplicá por 100."],
    ["2⁵ = ?", ["10", "25", "32", "7"], "2 × 2 × 2 × 2 × 2 = 32."],
    ["log₂(16) = ?", ["4", "8", "2", "16"], "2⁴ = 16."],
    ["¿Qué es cierto sobre −log(p) para una probabilidad p?", ["Es grande cuando p está cerca de 1", "Es chico cuando p está cerca de 1 y grande cuando p es diminuto", "Siempre es negativo", "Es igual a p"], "Este puntaje de \"sorpresa\" es el núcleo de la pérdida que se usa para entrenar modelos de lenguaje."]],
  task: "Escribí funciones chiquitas para: una recta <code>w·x + b</code>, el porcentaje de un número, un cuadrado, 2 elevado a la n y el logaritmo en base 2. Imprimí una tabla para x = 1..8 que muestre x, 2^x y log₂(x)."
},
});
