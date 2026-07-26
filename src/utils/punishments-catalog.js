/**
 * Catálogo de castigos del Generador. Datos puros, sin dependencias, para poder
 * reutilizarlo tanto en la vista interactiva (generator.js) como en el prerender
 * (contenido indexable), sin arrastrar código de navegador (supabase/DOM).
 */
export const PUNISHMENT_IDEAS = [
    {
        id: "gen-1",
        name: "Foto de Perfil Castigada",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Ponerte una foto de perfil de WhatsApp elegida por el ganador durante 24h."
    },
    {
        id: "gen-2",
        name: "Estado de Derrota",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 1,
        description: "Poner un estado de WhatsApp que diga 'Soy el peor mánager de la historia' durante 24h."
    },
    {
        id: "gen-3",
        name: "El Baile Viral",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Aprenderse y grabar el baile o trend de TikTok más viral del momento y mandarlo al grupo de WhatsApp."
    },
    {
        id: "gen-4",
        name: "Poema al Resto",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Escribir un poema de 4 líneas dedicado al jugador que más te ha restado y pasarlo al grupo."
    },
    {
        id: "gen-5",
        name: "Recreación de Meme",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Recrear un meme clásico en casa y mandar la foto al grupo."
    },
    {
        id: "gen-6",
        name: "Celebración Falsa",
        category: "sports",
        categoryLabel: "Deportivo",
        intensity: 2,
        description: "Grabar un vídeo de 15s imitando la celebración de un gol famoso en el salón de tu casa."
    },
    {
        id: "gen-7",
        name: "Close Friends",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Subir foto a 'Mejores Amigos' en Instagram llorando falsamente por la jornada."
    },
    {
        id: "gen-8",
        name: "Lip Sync de Moda",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Grabar un vídeo haciendo un playback (lip sync) súper exagerado de un audio viral de TikTok y enviarlo al grupo."
    },
    {
        id: "gen-9",
        name: "Retrato Robot",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Dibujar a mano al mánager ganador de la jornada en un papel (versión cutre) y pasar foto."
    },
    {
        id: "gen-10",
        name: "El Filtro Llorón",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Subir una historia de Instagram o mandar un vídeo al grupo usando el filtro viral de cara de asco o llorando para explicar tu derrota."
    },
    {
        id: "gen-11",
        name: "Toques de Papel",
        category: "sports",
        categoryLabel: "Deportivo",
        intensity: 2,
        description: "Grabar un vídeo intentando dar 10 toques seguidos a un rollo de papel higiénico."
    },
    {
        id: "gen-12",
        name: "Locutor de Documental",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Mandar un audio narrando tu derrota como si fueras un locutor de documentales de animales."
    },
    {
        id: "gen-13",
        name: "Mímica del Fracaso",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Hacer mímica de tu peor jugador de la jornada en un vídeo corto para que el grupo lo adivine."
    },
    {
        id: "gen-14",
        name: "Vaso Sin Manos",
        category: "food",
        categoryLabel: "Alimenticio",
        intensity: 3,
        description: "Grabar un vídeo bebiendo un poco de agua de un vaso apoyado en la mesa, sin usar las manos."
    },
    {
        id: "gen-15",
        name: "Selfie Recién Levantado",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Mandar un selfie al grupo nada más levantarte por la mañana con 'cara de perdedor'."
    },
    {
        id: "gen-16",
        name: "Nombre Ridículo",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Cambiar el nombre de tu equipo fantasy por uno ridículo que elija el líder durante 1 jornada."
    },
    {
        id: "gen-17",
        name: "Desayuno Épico",
        category: "food",
        categoryLabel: "Alimenticio",
        intensity: 2,
        description: "Narrar por audio de WhatsApp cómo te preparas el desayuno usando tono épico de batalla."
    },
    {
        id: "gen-18",
        name: "Transición Fallida",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Hacer un vídeo intentando un trend de 'transición de ropa' viral de TikTok y que te salga horriblemente mal a propósito."
    },
    {
        id: "gen-19",
        name: "Tutorial de Fracaso",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 3,
        description: "Hacer un mini-tutorial en vídeo de 30s de 'Cómo NO alinear en un fantasy'."
    },
    {
        id: "gen-20",
        name: "Llantos de Audio",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Grabar un audio de 20s como si estuvieras llorando amargamente (de broma) por tu derrota."
    },
    {
        id: "gen-21",
        name: "Bailar la Macarena",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 3,
        description: "Bailar el estribillo de la Macarena en un vídeo rápido para el grupo."
    },
    {
        id: "gen-22",
        name: "Perdón al Capitán",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Hacer un vídeo corto pidiendo perdón de rodillas a tu capitán fantasy por decepcionarle."
    },
    {
        id: "gen-23",
        name: "Gurú de Palo",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Subir una historia diciendo 'Vendo consejos de Fantasy' con tono irónico."
    },
    {
        id: "gen-24",
        name: "Zoológico de Derrotas",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Enviar un audio imitando el sonido de 3 animales diferentes llorando."
    },
    {
        id: "gen-25",
        name: "El GIF Humano",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Recrear tu reacción al ver los puntos de tu equipo grabando un GIF propio de 3 segundos."
    },
    {
        id: "gen-26",
        name: "Entrenador Pensativo",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 1,
        description: "Hacerte una foto en el espejo con gesto de entrenador preocupado y mandarla al grupo."
    },
    {
        id: "gen-27",
        name: "Elogios Obligados",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 1,
        description: "Escribir en el grupo 3 cosas positivas del equipo del ganador sin ningún tipo de sarcasmo."
    },
    {
        id: "gen-28",
        name: "Prensa Falsa",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Grabar un vídeo dando explicaciones a la prensa usando un cepillo de dientes como micrófono."
    },
    {
        id: "gen-29",
        name: "Minuto de Quejas",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 1,
        description: "Mandar un audio de 1 minuto cronometrado hablando sin parar de la mala suerte que tienes."
    },
    {
        id: "gen-30",
        name: "Dibujo Táctico",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Hacer un dibujo rápido con bolígrafo de tu supuesto 'esquema táctico' y pasarlo al grupo."
    },
    {
        id: "gen-31",
        name: "Desorientado",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 2,
        description: "Ponerte una camiseta del revés y hacerte una foto con cara desorientada para el grupo."
    },
    {
        id: "gen-32",
        name: "El Fallo Técnico",
        category: "sports",
        categoryLabel: "Deportivo",
        intensity: 2,
        description: "Imitar en vídeo el peor gesto técnico (ej. un tropezón) de tu peor jugador de la jornada."
    },
    {
        id: "gen-33",
        name: "Cantando Bajo la Ducha",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 3,
        description: "Grabar un audio de 15s cantando tristemente dentro de la ducha (sin agua)."
    },
    {
        id: "gen-34",
        name: "Emoji de Payaso",
        category: "public",
        categoryLabel: "Vergonzoso",
        intensity: 1,
        description: "Poner de estado de WhatsApp un único emoji de payaso durante 24h."
    },
    {
        id: "gen-35",
        name: "Jeroglífico Fantasy",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 1,
        description: "Explicar tu derrota usando únicamente emojis (sin letras) en un mensaje al grupo."
    },
    {
        id: "gen-36",
        name: "Flexiones de Castigo",
        category: "sports",
        categoryLabel: "Deportivo",
        intensity: 2,
        description: "Grabar un vídeo haciendo 5 flexiones como 'castigo físico' por la mala táctica."
    },
    {
        id: "gen-37",
        name: "La Llamada del Presi",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 2,
        description: "Enviar un audio simulando que estás recibiendo la llamada de despido de la directiva."
    },
    {
        id: "gen-38",
        name: "Carta de Dimisión",
        category: "creative",
        categoryLabel: "Creativo",
        intensity: 1,
        description: "Escribir a mano una carta formal de dimisión de broma, firmarla y pasar foto al grupo."
    },
    // --- Castigos aportados por la comunidad (documento "Castigos Liga Fantasy") ---
    { id: "gen-39", name: "A Discreción del Campeón", category: "video", categoryLabel: "Redes y Vídeo", intensity: 3, description: "Subir un TikTok cuya temática, música y coreografía las elija en exclusiva el campeón de la liga." },
    { id: "gen-40", name: "Filtro Animal", category: "video", categoryLabel: "Redes y Vídeo", intensity: 2, description: "Subir un TikTok hablando o actuando con un filtro de animal de lo más vergonzoso." },
    { id: "gen-41", name: "Cambio de Look", category: "video", categoryLabel: "Redes y Vídeo", intensity: 2, description: "Grabar un vídeo cómico probándote peinados ridículos o inusuales." },
    { id: "gen-42", name: "Historia Random", category: "video", categoryLabel: "Redes y Vídeo", intensity: 1, description: "Subir una historia a Instagram muy random y sin ningún tipo de contexto." },
    { id: "gen-43", name: "El Himno Prohibido", category: "video", categoryLabel: "Redes y Vídeo", intensity: 2, description: "Cantar en vídeo y a pleno pulmón el himno de un equipo de fútbol que no sea el tuyo, elegido por el grupo." },
    { id: "gen-44", name: "5 Razones Para...", category: "video", categoryLabel: "Redes y Vídeo", intensity: 2, description: "Grabar un vídeo en formato lista dando '5 razones para...' sobre un tema ridículo que imponga la liga." },
    { id: "gen-45", name: "El Reportero Callejero", category: "video", categoryLabel: "Redes y Vídeo", intensity: 3, description: "Salir a la calle, improvisar un micrófono y entrevistar a una persona completamente random." },
    { id: "gen-46", name: "Pidiendo Clemencia", category: "video", categoryLabel: "Redes y Vídeo", intensity: 2, description: "Grabar un vídeo de rodillas pidiendo clemencia por la desastrosa puntuación de la jornada." },
    { id: "gen-47", name: "El Seductor del Espejo", category: "video", categoryLabel: "Redes y Vídeo", intensity: 2, description: "Grabar un vídeo frente al espejo ligando contigo mismo." },
    { id: "gen-48", name: "El Slow Motion", category: "video", categoryLabel: "Redes y Vídeo", intensity: 1, description: "Grabar un vídeo tuyo a cámara lenta (slow motion) con la música dramática que elija el grupo." },
    { id: "gen-49", name: "Escudo del Eterno Rival", category: "profile", categoryLabel: "Perfiles y Grupos", intensity: 2, description: "Pasar 24 horas con el escudo del eterno rival como foto de perfil." },
    { id: "gen-50", name: "El Monstruo de Espuma", category: "profile", categoryLabel: "Perfiles y Grupos", intensity: 2, description: "Llenarte la cara por completo de espuma de afeitar y pasar una foto al grupo para demostrarlo." },
    { id: "gen-51", name: "El Invitado Especial", category: "costume", categoryLabel: "Disfraces", intensity: 3, description: "Acudir completamente disfrazado a la próxima quedada o cena del grupo." },
    { id: "gen-52", name: "Transformación Therian", category: "costume", categoryLabel: "Disfraces", intensity: 3, description: "Disfrazarte de therian (o incorporar elementos del disfraz) para un vídeo o evento del grupo." },
    { id: "gen-53", name: "El Pijamas", category: "costume", categoryLabel: "Disfraces", intensity: 2, description: "Aparecer un día cualquiera, en una quedada o en público, con una camiseta de pijama puesta." },
    { id: "gen-54", name: "La Momia", category: "costume", categoryLabel: "Disfraces", intensity: 2, description: "Embadurnarte de arriba a abajo con papel higiénico hasta parecer una momia y pasar foto." },
    { id: "gen-55", name: "El Nadador Olímpico", category: "costume", categoryLabel: "Disfraces", intensity: 3, description: "Vestirte con indumentaria completa de nadador olímpico (bañador, gafas y gorro) para un vídeo o evento del grupo." },
    { id: "gen-56", name: "El Cambio de Vestuario", category: "costume", categoryLabel: "Disfraces", intensity: 3, description: "Grabar un vídeo o acudir a un evento del grupo vestido del sexo contrario." },
    { id: "gen-57", name: "El Pasillito de Collejas", category: "extreme", categoryLabel: "Físico y Extremo", intensity: 3, description: "El perdedor pasa por el pasillo del grupo mientras cada uno le da una colleja." },
    { id: "gen-58", name: "Diana Móvil", category: "extreme", categoryLabel: "Físico y Extremo", intensity: 3, description: "La liga se junta en una calle amplia; a la de 3, el perdedor sale corriendo y el resto le lanza huevos." },
    { id: "gen-59", name: "El Cubo Helado", category: "extreme", categoryLabel: "Físico y Extremo", intensity: 3, description: "Tirarte un cubo de agua bien fría por la cabeza y grabarlo." },
    { id: "gen-60", name: "Depilación Sorpresa", category: "extreme", categoryLabel: "Físico y Extremo", intensity: 3, description: "Aguantar el tirón de una tira de cera en el pecho." }
];
