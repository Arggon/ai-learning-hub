/* Spanish (Argentina, voseo) lesson content — part A. Keyed by concept id; same order and count as the English quiz/resources.
   [[key|texto]] keeps the English glossary key and shows the Spanish text. */
window.ES = window.ES || {}; window.ES.concepts = window.ES.concepts || {};
Object.assign(window.ES.concepts, {
prog_basics: {
  title: "Qué es programar",
  summary: "Un programa es una lista de instrucciones exactas que la computadora sigue, paso a paso. Programar es escribir esas instrucciones en un lenguaje que la computadora entiende.",
  why: "Todo sistema de IA (un chatbot, un agente, el entrenamiento de un modelo) es un programa. Saber qué es el código te permite leer ejemplos y entender qué hacen las herramientas.",
  body: `
<h3>La idea en una frase</h3>
<p>Un [[program|programa]] es una receta para una computadora: pasos precisos, seguidos en orden, sin adivinar nada.</p>
<h3>Explicación</h3>
<ul>
<li>Las computadoras son rápidas pero literales. Hacen exactamente lo que dicen las instrucciones, aunque esté mal. Un [[bug|bug (error en el código)]] es una instrucción que no hace lo que su autor quería.</li>
<li>Un [[programming language|lenguaje de programación]] (Python, JavaScript, C#, …) es un formato estricto para escribir instrucciones que una persona puede leer y una computadora puede ejecutar.</li>
<li>Hay tres bloques que aparecen en casi todo programa: <b>secuencia</b> (hacé esto, después aquello), <b>decisiones</b> (<code>if</code>: si algo es verdadero, hacé A; si no, B) y <b>repetición</b> ([[loop|bucle]]: hacé esto con cada elemento).</li>
<li>El [[Pseudocode|pseudocódigo]] es "casi código" en lenguaje común, para explicar una idea sin los detalles de un lenguaje concreto. Arggon Learn puede mostrarte ejemplos en pseudocódigo, Python, JavaScript/TypeScript o C# (elegilo en Ajustes).</li>
</ul>
<h3>Analogía</h3>
<p>Una receta de cocina es un programa para una persona: ingredientes (entradas), pasos en orden, decisiones ("si la masa está pegajosa, agregá harina"), repetición ("revolvé hasta que quede lisa") y un resultado (salida). Programar es escribir recetas para un cocinero que nunca improvisa.</p>
<p class="tip">Usá el botón de pasos de la visualización para "ser la computadora" y seguir un programa chiquito línea por línea.</p>`,
  res: ["Lo básico, sin atarse a un lenguaje. Mirá la primera hora.", "El curso gratuito para principiantes más famoso. Con la semana 0 alcanza para arrancar.", "Episodios cortos y divertidos sobre cómo funcionan las computadoras."],
  quiz: [
    ["¿Qué es un programa?", ["Una lista de instrucciones exactas que la computadora sigue", "Una computadora que piensa por sí sola", "Un tipo de sitio web", "Un archivo de imágenes"], "Las computadoras siguen las instrucciones al pie de la letra, paso a paso."],
    ["\"Si la contraseña es incorrecta, mostrá un error\" es un ejemplo de…", ["Repetición", "Una decisión (if/else)", "Una variable", "Hardware"], "El código elige entre caminos según una condición."],
    ["\"Para cada mail de la bandeja de entrada, marcalo como leído\" es…", ["Un bucle (repetición)", "Una decisión", "Un bug", "Una base de datos"], "El mismo paso se repite para cada elemento."],
    ["¿Qué es el pseudocódigo?", ["Un virus", "\"Casi código\" en lenguaje común para explicar una lógica", "Un lenguaje de programación más rápido", "Código que solo corre en celulares"], "Muestra la idea sin la sintaxis exacta de un lenguaje."]],
  task: "Escribí un programa que recorra una lista de números e imprima \"even\" (par) u \"odd\" (impar) para cada uno. Después cambialo para que también cuente cuántos son pares."
},
vars_functions: {
  title: "Variables y funciones",
  summary: "Una variable es una caja con nombre que guarda un valor. Una función es un pedazo de código con nombre y reutilizable: recibe entradas, hace un trabajo y devuelve una salida.",
  why: "Un modelo de IA es literalmente una función: entra un input y sale una predicción. Sus números aprendidos son como variables que el entrenamiento va cambiando.",
  body: `
<h3>La idea en una frase</h3>
<p>Una [[variable|variable]] guarda un valor bajo un nombre; una [[function|función]] convierte entradas en una salida, así podés reutilizar la misma lógica muchas veces.</p>
<h3>Variables y tipos</h3>
<ul>
<li><code>price = 100</code> crea una caja llamada <i>price</i> que contiene 100. Después, <code>price = price * 2</code> la cambia a 200.</li>
<li>Los valores tienen un [[type|tipo de dato]]: números, texto ([[string|cadena de texto]]), verdadero/falso ([[boolean|booleano]]), [[list|lista o arreglo]] (valores en orden) y [[dictionary|diccionario o mapa]] (pares clave → valor).</li>
</ul>
<h3>Funciones</h3>
<ul>
<li>Una función tiene un nombre, [[parameters|parámetros]] (sus entradas) y un [[return value|valor de retorno]] (su salida): <code>function total(price, qty) → price × qty</code>.</li>
<li>Llamar a <code>total(100, 3)</code> da 300. Mismas entradas, misma salida: esa previsibilidad hace que el código se pueda testear.</li>
<li>Las funciones pueden llamar a otras funciones, y así se arman programas grandes con piezas chicas y fáciles de entender.</li>
</ul>
<h3>Analogía</h3>
<p>Una función es una máquina expendedora: ponés entradas (monedas y el botón que elegís), adentro hace su trabajo y sale algo. No necesitás saber cómo es por dentro para usarla: alcanza con saber qué entra y qué sale.</p>
<p><b>Por qué importa para la IA:</b> en el código normal, una persona escribe el cuerpo de la función. En machine learning, el cuerpo tiene números ajustables llamados [[weights|pesos]] que se aprenden a partir de ejemplos. Lo vas a ver en "¿Qué es un modelo?".</p>`,
  res: ["Artículo claro para principiantes (ejemplos en JavaScript).", "Parámetros, valores de retorno y cómo llamar funciones.", "Si elegiste Python: números, texto y listas.", "Tipos, variables y métodos en C#.", "Cómo se agregan tipos a las variables y funciones de JavaScript."],
  quiz: [
    ["Después de x = 5 y luego x = x + 2, ¿cuánto vale x?", ["5", "2", "7", "52"], "El valor nuevo reemplaza al viejo: 5 + 2 = 7."],
    ["¿Qué es el valor de retorno de una función?", ["Su nombre", "La salida que devuelve", "Dónde se guarda el archivo", "Un error"], "Las entradas (parámetros) entran; el valor de retorno sale."],
    ["¿Cuál es un diccionario (mapa)?", ["[1, 2, 3]", "\"hello\"", "{ \"name\": \"Ana\", \"age\": 30 }", "true"], "Pares clave → valor."],
    ["¿Por qué sirven las funciones?", ["Hacen el código más lento", "Te dejan reutilizar y testear la misma lógica muchas veces", "Son obligatorias en cada línea", "Guardan imágenes"], "La escribís una vez y la llamás muchas veces."]],
  task: "Escribí una función <code>total(price, quantity, discountPercent)</code> que devuelva el precio con el descuento aplicado. Llamala con (100, 3, 10) y comprobá que te dé 270."
},
data_json: {
  title: "Datos y JSON",
  summary: "Los programas se pasan datos como texto. JSON es el formato más común: objetos con campos con nombre, listas, texto, números, true/false y null.",
  why: "Cada pedido y respuesta de una API de IA, cada definición de herramienta y cada mensaje de MCP es JSON. Leer JSON es algo de todos los días en ingeniería de IA.",
  body: `
<h3>La idea en una frase</h3>
<p>[[JSON|JSON]] (JavaScript Object Notation) es un formato de texto simple para datos estructurados que casi cualquier lenguaje sabe leer y escribir.</p>
<h3>Las reglas</h3>
<ul>
<li>Un [[object|objeto]] es <code>{ "key": value, ... }</code>: las claves van siempre entre comillas dobles.</li>
<li>Una lista (array) es <code>[ value, value, ... ]</code>.</li>
<li>Valores: texto <code>"hello"</code>, números <code>42</code> o <code>3.14</code>, <code>true</code>/<code>false</code>, <code>null</code> (nada), u objetos y listas anidados.</li>
<li>Errores comunes: comillas simples, una coma de más después del último elemento, comentarios (en JSON no se permiten).</li>
</ul>
<p>Pasar datos en memoria a texto JSON es [[serialization|serialización]]; leer texto JSON de vuelta es [[parsing|parseo]]. Un [[schema|esquema]] describe qué campos se permiten y de qué tipo son: las herramientas de IA usan [[JSON Schema|JSON Schema (estándar para describir la forma de un JSON)]] para describir sus entradas.</p>
<h3>Analogía</h3>
<p>JSON es como un formulario bien rotulado: cada casillero tiene un nombre ("customer", "items", "total") y algunos casilleros contienen formularios más chicos o listas. Cualquiera que conozca los rótulos lo puede completar o leer, en cualquier lenguaje.</p>`,
  res: ["Estructura, parseo y errores comunes.", "La gramática oficial en una sola página, con diagramas."],
  quiz: [
    ["¿Cuál es JSON válido?", ["{ name: 'Ana' }", "{ \"name\": \"Ana\" }", "{ \"name\": \"Ana\", }", "name = Ana"], "Las claves y los textos necesitan comillas dobles; sin coma final."],
    ["¿Qué representa [1, 2, 3] en JSON?", ["Un objeto", "Una lista (array)", "Un texto (string)", "Un error"], "Corchetes = lista ordenada."],
    ["Convertir texto JSON en datos que tu programa puede usar se llama…", ["Parseo", "Compilación", "Encriptación", "Tokenización"], "La serialización es la dirección opuesta."],
    ["¿Qué describe un JSON Schema?", ["Los colores de un sitio web", "Qué campos debería tener un valor JSON y de qué tipo son", "La contraseña de una base de datos", "El tamaño de una imagen"], "Las definiciones de herramientas de IA usan JSON Schema para sus parámetros."]],
  task: "Parseá este pedido en JSON, calculá el total de <code>price × qty</code> de todos los ítems, después agregá un campo nuevo <code>\"total\"</code> e imprimí el JSON otra vez."
},
});
