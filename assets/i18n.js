/* UI strings. Lesson text is English; Spanish covers the interface, the onboarding, concept titles and glossary glosses. */
window.I18N = {
  en: {
    tagline: "learn AI from the ground up", nav_map: "Map", nav_path: "Learning path", nav_progress: "Progress", nav_glossary: "Glossary", nav_settings: "Settings",
    concepts: "concepts", theme: "Theme", lang_btn: "ES",
    st_known: "you know this", st_done: "done", st_ready: "ready to learn", st_locked: "needs prerequisites",
    next_kicker: "Next best concept", start: "Start →", why_next: "Why this one: it is the next step on your path ({track}) and everything it needs is covered.", needs_first: "Learn first: {list}.",
    all_done: "🎉 Everything done!", all_done_p: "Now build something real: a small agent with one MCP tool, plus an eval suite that tests it.",
    welcome_title: "Welcome! Let's tailor this hub to you", welcome_p1: "This hub teaches how modern AI works — from what a program is, all the way to language models, agents and safety. Every concept starts by asking <b>\"what do I need to know before this?\"</b>, so you never hit a wall.",
    welcome_p2: "Answer a few quick questions (about 1 minute). Your answers only decide which concepts are marked as <b>already known</b> (🟢) and which path we suggest. Nothing is assumed, and you can change everything later in Settings.",
    save_start: "Save and show my map →", skip: "Skip — start from zero", preview: "With these answers: {n} concept(s) marked as known ({list}). Suggested track: <b>{track}</b>. Code examples in: <b>{lang}</b>.", none: "none",
    migrated: "We found progress from the previous version of this hub and kept it ({done} concepts done, {quiz} quiz scores). Older \"you already know\" assumptions were removed — tell us what you know below.",
    track_beginner: "Beginner: foundations first", track_builder: "Builder: apps & agents first", track_theory: "Theory: how models work first", track_auto: "Automatic (from my answers)",
    settings_title: "Settings", settings_profile: "About you (self-assessment)", settings_profile_p: "Changing these answers updates which concepts are marked as known and the suggested track. Your progress is kept.",
    save: "Save", saved: "Saved ✔", code_lang: "Code examples language", ui_lang: "Interface language", track: "Learning track", theme_light: "Light", theme_dark: "Dark",
    known_title: "What you already know", known_p: "Tick anything you already know. The prerequisite trees stop there, and it won't be suggested to you.", from_answers: "from your answers", marked_by_you: "marked by you",
    data_title: "Your data", data_p: "Progress is saved only in this browser (localStorage key <code>{key}</code>). Export a backup or move it to another browser.", export: "Export progress (JSON)", import: "Import progress…", import_ok: "Imported ✔", import_bad: "That file doesn't look like hub progress: {err}",
    reset_progress: "Reset progress", reset_all: "Reset everything (progress + answers)", confirm_reset: "Reset all progress and quiz scores?", confirm_reset_all: "Reset progress, quiz scores, your answers and settings?",
    glossary_title: "Glossary", glossary_p: "Every term used in the lessons, in plain English. Terms are linked from the lesson where they first appear.", search: "Search terms…", appears_in: "Appears in", no_terms: "No matching terms.",
    before_this: "Before this you need:", nothing_needed: "Nothing — this is a starting point.", learn_first: "Not ready yet? Learn these first, in this order:", all_covered: "✔ All prerequisites are covered. You are ready.", show_tree: "Show the full prerequisite tree (recursive, down to what you know)", unlocks: "This unlocks:", stop_here: "— you know this, stop here", listed_above: "(already listed above)", needs: "needs ↓",
    why_learn: "Why learn this:", try_it: "Try it", diagram: "Diagram", resources: "Watch / read (best picks)", for_lang: "For {lang}", quiz: "Self-check quiz", hands_on: "Hands-on", copy: "Copy", copied: "Copied ✔",
    mark_done: "I understood this concept — mark as done", known_mark: "I already know this", known_from_profile: "Marked as known from your self-assessment.", undo_known: "I actually need to learn this",
    not_available: "Not available in {lang} for this exercise — showing {shown}.",
    path_title: "Your personal learning path", path_p: "Based on your track and what you already know. Missing prerequisites are inserted automatically right before the concept that needs them.", path_known: "Skipped because you know them", path_hours: "≈ {h} h left",
    why_order: "Why this order?", progress_title: "Progress", group: "Group", status: "Status", quiz_col: "Quiz (best / last)", done_col: "Done", personalize: "Personalize the hub", personalize_p: "You haven't answered the self-assessment yet, so nothing is marked as known.",
    map_title: "Your AI map, built from prerequisites", map_p: "Every concept asks first: <b>\"what do I need to know before this?\"</b> Arrows go <b>from a prerequisite to the concept that needs it</b>. We follow the arrows back until we reach what you told us you already know (🟢) — or all the way to the first steps if you're new. Click any box to open its page.",
    group_by: "group by topic", map_hint: "Scroll inside the box to pan. #n = position on your path. Click a box to open it.", border_topic: "border = topic:"
  },
  es: {
    tagline: "aprende IA desde cero", nav_map: "Mapa", nav_path: "Ruta de aprendizaje", nav_progress: "Progreso", nav_glossary: "Glosario", nav_settings: "Ajustes",
    concepts: "conceptos", theme: "Tema", lang_btn: "EN",
    st_known: "ya lo sabes", st_done: "hecho", st_ready: "listo para aprender", st_locked: "necesita requisitos",
    next_kicker: "Siguiente concepto recomendado", start: "Empezar →", why_next: "Por qué este: es el siguiente paso de tu ruta ({track}) y ya tienes todo lo que necesita.", needs_first: "Aprende antes: {list}.",
    all_done: "🎉 ¡Terminaste todo!", all_done_p: "Ahora construye algo real: un agente pequeño con una herramienta MCP y un conjunto de evals que lo pruebe.",
    welcome_title: "¡Bienvenido! Adaptemos este sitio a ti", welcome_p1: "Este sitio enseña cómo funciona la IA moderna: desde qué es un programa hasta modelos de lenguaje, agentes y seguridad. Cada concepto empieza preguntando <b>\"¿qué necesito saber antes?\"</b>, para que nunca te quedes atascado.",
    welcome_p2: "Responde unas preguntas rápidas (1 minuto). Tus respuestas solo deciden qué conceptos se marcan como <b>ya conocidos</b> (🟢) y qué ruta sugerimos. No se asume nada y puedes cambiarlo después en Ajustes.",
    save_start: "Guardar y ver mi mapa →", skip: "Saltar — empezar de cero", preview: "Con estas respuestas: {n} concepto(s) marcados como conocidos ({list}). Ruta sugerida: <b>{track}</b>. Ejemplos de código en: <b>{lang}</b>.", none: "ninguno",
    migrated: "Encontramos progreso de la versión anterior y lo conservamos ({done} conceptos hechos, {quiz} puntajes de quiz). Se quitaron los supuestos de \"ya lo sabes\" anteriores: cuéntanos abajo qué sabes.",
    track_beginner: "Principiante: primero los fundamentos", track_builder: "Constructor: primero apps y agentes", track_theory: "Teoría: primero cómo funcionan los modelos", track_auto: "Automática (según mis respuestas)",
    settings_title: "Ajustes", settings_profile: "Sobre ti (autoevaluación)", settings_profile_p: "Cambiar estas respuestas actualiza qué conceptos se marcan como conocidos y la ruta sugerida. Tu progreso se conserva.",
    save: "Guardar", saved: "Guardado ✔", code_lang: "Lenguaje de los ejemplos de código", ui_lang: "Idioma de la interfaz", track: "Ruta de aprendizaje", theme_light: "Claro", theme_dark: "Oscuro",
    known_title: "Lo que ya sabes", known_p: "Marca lo que ya sabes. Los árboles de requisitos se detienen ahí y no te lo sugeriremos.", from_answers: "según tus respuestas", marked_by_you: "marcado por ti",
    data_title: "Tus datos", data_p: "El progreso se guarda solo en este navegador (clave de localStorage <code>{key}</code>). Exporta una copia o pásalo a otro navegador.", export: "Exportar progreso (JSON)", import: "Importar progreso…", import_ok: "Importado ✔", import_bad: "Ese archivo no parece progreso del sitio: {err}",
    reset_progress: "Reiniciar progreso", reset_all: "Reiniciar todo (progreso + respuestas)", confirm_reset: "¿Reiniciar todo el progreso y los puntajes?", confirm_reset_all: "¿Reiniciar progreso, puntajes, respuestas y ajustes?",
    glossary_title: "Glosario", glossary_p: "Todos los términos de las lecciones, explicados en inglés simple, con su traducción. Cada término está enlazado desde la lección donde aparece por primera vez.", search: "Buscar términos…", appears_in: "Aparece en", no_terms: "No hay términos que coincidan.",
    before_this: "Antes de esto necesitas:", nothing_needed: "Nada: es un punto de partida.", learn_first: "¿Todavía no? Aprende esto primero, en este orden:", all_covered: "✔ Tienes todos los requisitos. Estás listo.", show_tree: "Ver el árbol completo de requisitos (recursivo, hasta lo que ya sabes)", unlocks: "Esto desbloquea:", stop_here: "— ya lo sabes, termina aquí", listed_above: "(ya aparece arriba)", needs: "necesita ↓",
    why_learn: "Por qué aprenderlo:", try_it: "Pruébalo", diagram: "Diagrama", resources: "Mira / lee (lo mejor)", for_lang: "Para {lang}", quiz: "Quiz de autoevaluación", hands_on: "Práctica", copy: "Copiar", copied: "Copiado ✔",
    mark_done: "Entendí este concepto — marcar como hecho", known_mark: "Ya sé esto", known_from_profile: "Marcado como conocido según tu autoevaluación.", undo_known: "En realidad necesito aprenderlo",
    not_available: "No disponible en {lang} para este ejercicio — se muestra {shown}.",
    path_title: "Tu ruta de aprendizaje personal", path_p: "Según tu ruta y lo que ya sabes. Los requisitos que faltan se agregan automáticamente justo antes del concepto que los necesita.", path_known: "Omitidos porque ya los sabes", path_hours: "≈ {h} h restantes",
    why_order: "¿Por qué este orden?", progress_title: "Progreso", group: "Grupo", status: "Estado", quiz_col: "Quiz (mejor / último)", done_col: "Hecho", personalize: "Personaliza el sitio", personalize_p: "Todavía no respondiste la autoevaluación, así que nada está marcado como conocido.",
    map_title: "Tu mapa de IA, construido a partir de requisitos", map_p: "Cada concepto pregunta primero: <b>\"¿qué necesito saber antes?\"</b> Las flechas van <b>del requisito al concepto que lo necesita</b>. Seguimos las flechas hacia atrás hasta llegar a lo que nos dijiste que ya sabes (🟢), o hasta los primeros pasos si eres nuevo. Haz clic en un recuadro para abrirlo.",
    group_by: "agrupar por tema", map_hint: "Desplázate dentro del recuadro. #n = posición en tu ruta. Haz clic para abrir.", border_topic: "borde = tema:"
  }
};
/* Onboarding questions (also used in Settings). value → label per language. */
window.ONBOARDING = [
  { id: "prog", q: { en: "How much programming have you done?", es: "¿Cuánto has programado?" }, opts: [
    ["none", { en: "Never programmed", es: "Nunca programé" }], ["little", { en: "A little (a course, tutorials, small scripts)", es: "Un poco (un curso, tutoriales, scripts pequeños)" }],
    ["comfortable", { en: "Comfortable — I write programs regularly", es: "Con soltura: programo seguido" }], ["pro", { en: "Professional developer", es: "Desarrollador profesional" }]] },
  { id: "lang", q: { en: "Which programming language do you know best (or want to use)?", es: "¿Qué lenguaje conoces mejor (o quieres usar)?" }, opts: [
    ["python", { en: "Python", es: "Python" }], ["ts", { en: "JavaScript / TypeScript", es: "JavaScript / TypeScript" }], ["csharp", { en: "C#", es: "C#" }],
    ["other", { en: "Another language (examples in pseudocode)", es: "Otro lenguaje (ejemplos en pseudocódigo)" }], ["none", { en: "None yet (examples in pseudocode)", es: "Ninguno todavía (ejemplos en pseudocódigo)" }]] },
  { id: "web", q: { en: "How comfortable are you with HTTP and APIs?", es: "¿Qué tan cómodo estás con HTTP y APIs?" }, opts: [
    ["none", { en: "I don't know what an API is", es: "No sé qué es una API" }], ["idea", { en: "I know the idea but haven't used one", es: "Conozco la idea pero nunca usé una" }],
    ["built", { en: "I've called or built APIs (requests, JSON, status codes)", es: "Llamé o construí APIs (requests, JSON, códigos de estado)" }]] },
  { id: "db", q: { en: "And databases?", es: "¿Y bases de datos?" }, opts: [
    ["none", { en: "Never used one", es: "Nunca usé una" }], ["sheets", { en: "Spreadsheets only", es: "Solo hojas de cálculo" }], ["sql", { en: "I can write SQL queries", es: "Sé escribir consultas SQL" }]] },
  { id: "math", q: { en: "School math: graphs, percentages, exponents and logarithms?", es: "Matemática escolar: gráficos, porcentajes, exponentes y logaritmos?" }, opts: [
    ["rusty", { en: "Rusty, or I avoid it", es: "Oxidada, o la evito" }], ["ok", { en: "OK with formulas and graphs; logs are fuzzy", es: "Bien con fórmulas y gráficos; los logaritmos no tanto" }],
    ["strong", { en: "Comfortable, including exponents and logs", es: "Cómodo, incluidos exponentes y logaritmos" }]] },
  { id: "ai", q: { en: "How much do you already use AI tools?", es: "¿Cuánto usas ya herramientas de IA?" }, opts: [
    ["never", { en: "Never or almost never", es: "Nunca o casi nunca" }], ["sometimes", { en: "Sometimes (ChatGPT, Claude, Gemini…)", es: "A veces (ChatGPT, Claude, Gemini…)" }],
    ["daily", { en: "Daily, for real work", es: "Todos los días, para trabajar" }], ["build", { en: "I build with AI APIs or agents", es: "Construyo con APIs de IA o agentes" }]] },
  { id: "goal", q: { en: "What do you want first?", es: "¿Qué quieres primero?" }, opts: [
    ["auto", { en: "Suggest for me", es: "Sugiéreme" }], ["basics", { en: "Start from the basics", es: "Empezar por lo básico" }],
    ["build", { en: "Build AI apps and agents", es: "Construir apps y agentes de IA" }], ["theory", { en: "Understand how models work inside", es: "Entender cómo funcionan los modelos por dentro" }]] }
];
