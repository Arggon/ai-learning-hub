/* Arggon Learn — track registry. Each track is one subject with its own concepts, map and copy.
   AI is the first track; new subjects are added here (and their concepts in their own content files).
   `copy` holds the track-specific text in every UI language; app.js reads it for the active track. */
window.LEARN_TRACKS = [
  {
    id: "ai",
    icon: "🧠",
    color: "#3949ab",
    // Every concept currently in window.CONCEPTS belongs to the AI track.
    concepts: () => window.CONCEPTS.map((c) => c.id),
    copy: {
      en: {
        name: "Artificial intelligence",
        tagline: "How modern AI works, from your first program to agents",
        card: "From what a program is and the math you need, to language models, agents, MCP, evals and safety. Prerequisite-first, with interactive demos and quizzes.",
        welcome_p1: "This track teaches how modern AI works — from what a program is, all the way to language models, agents and safety. Every concept starts by asking <b>\"what do I need to know before this?\"</b>, so you never hit a wall.",
        map_title: "Your AI map, built from prerequisites",
      },
      es: {
        name: "Inteligencia artificial",
        tagline: "Cómo funciona la IA moderna, desde tu primer programa hasta los agentes",
        card: "Desde qué es un programa y la matemática que necesitás, hasta modelos de lenguaje, agentes, MCP, evals y seguridad. Primero los requisitos, con demos interactivas y quizzes.",
        welcome_p1: "Esta ruta enseña cómo funciona la IA moderna: desde qué es un programa hasta los modelos de lenguaje, los agentes y la seguridad. Cada concepto empieza preguntando <b>\"¿qué necesito saber antes?\"</b>, para que nunca te trabes.",
        map_title: "Tu mapa de IA, armado a partir de requisitos",
      },
    },
  },
];
