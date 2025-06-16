// src/lib/constants.ts
export const kSampleRate = 16000;
export const kMaxAudio_s = 30 * 60; // Max audio duration for file input
export const kMaxRecording_s = 2 * 60; // Max recording duration
export const MODEL_FILENAME_IN_FS = 'whisper.bin';

// Default multilingual model
export const DEFAULT_MODEL_PATH = 'https://github.com/PrudhviBoggavarapu/fluent-through-speech/raw/refs/heads/main/app/static/ggml-tiny.bin';
export const DEFAULT_MODEL_NAME = 'ggml-tiny.bin';

// Default English-specific model
export const DEFAULT_MODEL_PATH_EN = '/ggml-tiny.en.bin';
export const DEFAULT_MODEL_NAME_EN = 'ggml-tiny.en.bin';

export const models: Record<
    string,
    { url: string; size: number; lang?: string } // Added optional lang property
> = {
    'tiny.en': { url: '/ggml-model-whisper-tiny.en.bin', size: 75, lang: 'en' },
    tiny: { url: '/ggml-model-whisper-tiny.bin', size: 75 },
    'base.en': { url: '/ggml-model-whisper-base.en.bin', size: 142, lang: 'en' },
    base: { url: '/ggml-model-whisper-base.bin', size: 142 },
    'small.en': { url: '/ggml-model-whisper-small.en.bin', size: 466, lang: 'en' },
    small: { url: '/ggml-model-whisper-small.bin', size: 466 },
    'tiny-en-q5_1': { url: '/ggml-model-whisper-tiny.en-q5_1.bin', size: 31, lang: 'en' },
    'tiny-q5_1': { url: '/ggml-model-whisper-tiny-q5_1.bin', size: 31 },
    'base-en-q5_1': { url: '/ggml-model-whisper-base.en-q5_1.bin', size: 57, lang: 'en' },
    'base-q5_1': { url: '/ggml-model-whisper-base-q5_1.bin', size: 57 },
    'small-en-q5_1': {
        url: '/ggml-model-whisper-small.en-q5_1.bin',
        size: 182,
        lang: 'en'
    },
    'small-q5_1': { url: '/ggml-model-whisper-small-q5_1.bin', size: 182 }
};

export const languages = [
    { value: 'es', label: 'Spanish' },
    { value: 'en', label: 'English' },
    { value: '', label: 'Auto Detect' }, // Changed for clarity
];
export const stories = [
    {
        id: "unit-1-basic-interactions",
        title: "Unit 1: Basic Interactions",
        category: "Learning",
        difficulty: "Very Easy",
        lang: "es",
        englishDescription: "In this lesson, you will practice introducing yourself and others in Spanish. You will cover basic greetings, family members, and simple questions and answers.",
        content: "¡Hola! Buenos días, me llamo María y soy una mujer que habla español muy bien. Tú eres un hombre inteligente que hablas inglés, pero yo hablo dos idiomas diferentes. Él es mi hermano, ella es mi hermana, y todos nosotros somos de una familia española. \"Mucho gusto en conocerte,\" dice la niña cuando conoce al niño nuevo. Por favor, disculpe si no comprendo perfectamente el inglés todavía. Gracias por su paciencia, y perdón si cometo errores al hablar.\n\nEn la mañana, yo bebo agua fresca y tú bebes leche caliente con el desayuno. El niño come pan tostado, ella come una manzana roja, y él come cereales. Yo como frutas frescas porque son muy saludables para el cuerpo. \"¿Tú comes verduras?\" pregunta la mujer al hombre en el mercado. No, yo no como carne, pero sí como pescado dos veces por semana. Cuando alguien me pregunta \"¿bebes café?\" yo respondo \"Sí, bebo café todas las mañanas.\"\n\n\"Lo siento, señor, ¿usted es español?\" pregunta la niña educadamente. \"Sí, soy de Madrid, y usted es muy amable,\" responde él con una sonrisa. La mujer dice \"de nada\" cuando el hombre le dice \"gracias\" por la ayuda. Por la noche, todos decimos \"buenas noches\" antes de ir a dormir. El padre dice \"adiós\" cuando sale para el trabajo en la mañana. \"Perdón, ¿habla usted inglés?\" pregunta la turista al policía en la calle."
    },
    {
        id: "unit-2-travel-and-places",
        title: "Unit 2: Travel and Places",
        category: "Learning",
        difficulty: "Very Easy",
        lang: "es",
        englishDescription: "This lesson focuses on vocabulary for travel. You will practice asking for directions and talking about common places like airports, hotels, and banks.",
        content: "Necesito ir al aeropuerto porque tengo un boleto de tren para las tres de la tarde. Mi pasaporte está aquí en mi maleta, junto con todo mi dinero para el viaje internacional. ¿Dónde está el hotel más cercano al banco y al supermercado del centro? El autobús para el museo está cerrado hoy, pero el taxi puede llevarnos directamente. Tengo una reserva en el hotel más elegante de la ciudad para esta noche. Mi teléfono está en la calle, cerca del banco donde cambié dinero esta mañana.\n\nAquí en esta ciudad, el museo está en la misma calle que el supermercado principal. El hospital está muy cerca del aeropuerto, pero el baño público está cerrado. Mi maleta está en el taxi que va hacia el hotel del centro. \"¿Dónde está su pasaporte?\" pregunta el empleado del banco al turista. El dinero está en mi cartera, pero necesito más para pagar el boleto. Tu reserva en el hotel está confirmada, pero tu vuelo está retrasado dos horas.\n\nEn el aeropuerto, tengo que mostrar mi pasaporte y mi boleto al oficial. El tren está en la estación, pero el autobús está retrasado por el tráfico pesado. Mi teléfono está descargado, así que necesito encontrar un baño con electricidad. ¿Está abierto el supermercado que está cerca del museo de arte? El hospital está muy lejos del hotel, pero el taxi puede llevarnos rápidamente. Tu maleta está en el carro, pero mi dinero está en el banco del aeropuerto."
    },
    {
        id: "unit-3-restaurant-experience",
        title: "Unit 3: Restaurant Experience",
        category: "Learning",
        difficulty: "Very Easy",
        lang: "es",
        englishDescription: "Practice ordering food and interacting in a restaurant setting. This lesson covers common food items, drinks, and how to ask for the bill.",
        content: "En el restaurante queremos una mesa para dos personas cerca de la ventana. Quiero una hamburguesa con queso y sin sal, y también una ensalada fresca. Para beber, él quiere un vaso de jugo de naranja, o tal vez café. El camarero dice que tienen pescado fresco y carne de primera calidad hoy. Necesito pagar la cuenta con mi tarjeta porque no tengo suficiente dinero en efectivo. Mi jugo está en un vaso grande, y su café está en una taza pequeña.\n\nSomos tres personas: uno quiere pescado, dos quieren carne, y tres queremos sándwiches. El tomate en la ensalada está muy fresco, pero necesita un poco más de sal. ¿Podemos tener azúcar para el café y una naranja de postre, por favor? Para el almuerzo, quiero un sándwich de queso con tomate y sin carne. El restaurante tiene el mejor jugo de naranja de toda la ciudad. Necesitamos una taza más de café y otro vaso de agua fría.\n\nLa cuenta incluye una hamburguesa, dos ensaladas, y tres bebidas diferentes para las personas. El camarero trajo sal para la comida, pero sin el tomate que pedimos originalmente. Quiero pagar con tarjeta, pero el restaurante solo acepta dinero en efectivo hoy. Para el postre, queremos una naranja fresca y una taza de café caliente. El pescado está delicioso, pero la carne está un poco salada para mi gusto. ¿Pueden traer la cuenta, por favor? Queremos pagar y salir del restaurante pronto."
    },
    {
        id: "unit-4-family-and-home",
        title: "Unit 4: Family and Home",
        category: "Learning",
        difficulty: "Very Easy",
        lang: "es",
        englishDescription: "Learn vocabulary related to family members and the home. You will practice describing your family and the place where you live.",
        content: "Mi familia vive en una casa muy grande y elegante cerca del centro. Tengo una hermana inteligente y un hermano muy perfecto que estudia en la universidad. Mi madre tiene un gato bonito, y mi padre tiene un perro muy inteligente. La abuela y el abuelo viven en un apartamento pequeño pero muy cómodo. Mi esposo tiene una bicicleta roja, y mi esposa tiene un carro elegante. Es una familia muy unida: mi hijo y mi hija son muy inteligentes.\n\nEl perro de mi padre es grande y muy bonito, perfecto para nuestra casa. Mi hermana tiene un apartamento nuevo, y mi hermano vive en una casa. El gato de mi madre es inteligente y elegante, muy diferente al perro. Mi abuela es una mujer muy sabia, y mi abuelo es un hombre. Tienes una familia bonita: tu hija es inteligente y tu hijo es muy grande. La esposa de mi hermano tiene un carro nuevo y una bicicleta.\n\nTodos vivimos cerca: mi hermana tiene una casa muy interesante y moderna cerca. La familia es lo más importante, y nosotros tenemos mucha suerte juntos. El hijo de mi hermano es muy inteligente, y la hija es bonita. Mi esposo y mi esposa trabajan mucho para mantener nuestra casa grande. Tiene un apartamento perfecto para su familia pequeña pero muy unida. El perro y el gato son parte importante de nuestra familia elegante. Mi padre tiene un carro nuevo, y mi madre tiene una bicicleta."
    },
    {
        id: "unit-5-shopping-for-clothes",
        title: "Unit 5: Shopping for Clothes",
        category: "Learning",
        difficulty: "Very Easy",
        lang: "es",
        englishDescription: "This unit covers vocabulary for shopping for clothes. You will practice talking about different items of clothing, colors, and prices.",
        content: "En esta tienda de ropa quiero comprar un vestido azul que es mi favorito. Ese abrigo marrón es demasiado caro, pero esta camisa gris es muy barata. Necesito una camiseta roja, una chaqueta cómoda, y un cinturón diferente para mis pantalones. Mi cartera tiene suficiente dinero para comprar un regalo especial para mi hermana. Esta falda es bonita, pero prefiero ese vestido que está en diferente color. El sombrero gris es elegante, y este reloj rojo es perfecto para mi esposo.\n\nMi ropa favorita está en esta tienda, donde todo es cómodo y barato. La camisa azul es más cara que la camiseta, pero es muy elegante. Ese cinturón marrón es perfecto para este vestido que quiero comprar hoy. El abrigo gris es demasiado grande, pero la chaqueta roja es perfecta. Mi cartera nueva es barata, pero este reloj es muy caro para. Este sombrero es diferente de ese que está en la otra tienda. La falda favorita de mi hermana es azul, pero prefiere la roja.\n\n¿Puedo comprar toda esta ropa con mi tarjeta, o necesito pagar en efectivo? La tienda tiene vestidos baratos, pero los abrigos son demasiado caros para mí. Ese regalo es perfecto: una cartera elegante y un reloj bonito juntos. El sombrero marrón es cómodo, pero prefiero este cinturón azul que es diferente. La camiseta gris es barata, pero la camisa es más elegante para trabajar. Mi chaqueta favorita es roja, pero necesito una falda diferente para combinar. Este vestido es perfecto para la fiesta, y ese abrigo es elegante."
    },
    {
        id: "unit-6-review-unit",
        title: "Unit 6: Review Unit",
        category: "Learning",
        difficulty: "Very Easy",
        lang: "es",
        englishDescription: "This is a review unit. You will practice combining vocabulary from all previous lessons, covering topics like travel, food, family, and shopping in integrated conversations.",
        content: "Esta semana estamos practicando todo el vocabulario que hemos aprendido en las unidades anteriores. Los estudiantes repasan las conversaciones básicas, los saludos, y las interacciones sociales importantes. En los ejercicios, combinamos palabras de la familia con ropa y comida para. Las actividades incluyen diálogos en restaurantes, conversaciones sobre viajes, y descripciones de familias. También practicamos los números, los colores, y las nacionalidades en contextos reales. Los estudiantes trabajan en parejas para crear conversaciones naturales usando todo el vocabulario.\n\nLos ejercicios de revisión incluyen situaciones en tiendas, hoteles, y restaurantes auténticos. Practicamos describir la ropa, pedir comida, y hablar sobre nuestras familias. Los estudiantes crean diálogos donde van de compras, viajan a diferentes lugares. También repasamos cómo presentarnos, hablar sobre nacionalidades, y expresar sentimientos básicos. Las actividades combinan vocabulario de viajes con conversaciones familiares y situaciones cotidianas. Esta unidad prepara a los estudiantes para usar todo su vocabulario.\n\nDurante esta semana de revisión, los estudiantes demuestran su progreso en conversaciones fluidas. Combinamos situaciones reales con el vocabulario de comida, ropa, familia, y viajes. Los ejercicios incluyen juegos de rol en aeropuertos, restaurantes, tiendas, y. También practicamos presentaciones sobre nuestras familias, descripciones de nuestra ropa favorita. Los estudiantes trabajan en grupos para crear historias usando palabras de unidades. Al final de esta unidad, pueden mantener conversaciones básicas en español."
    },
    {
        id: "unit-7-school-life",
        title: "Unit 7: School Life",
        category: "Learning",
        difficulty: "Very Easy",
        lang: "es",
        englishDescription: "Focus on school and university life. This lesson includes vocabulary for subjects, studying, exams, and common classroom interactions.",
        content: "En la universidad, los estudiantes estudian materias muy importantes como medicina y español. Yo estudio mucho todos los días, y leo libros difíciles en mi favorita. Mi profesor es muy inteligente: él comprende todos los problemas que tenemos. Cuando leo textos complicados, a veces no comprendo las preguntas más difíciles. En clase, yo escribo notas importantes, tú escribes ejercicios, y él escribe. El maestro dice que leer es fácil, pero escribir ensayos largos es. Necesito una computadora nueva y un bolígrafo para escribir todos mis exámenes.\n\nLos estudiantes de medicina tienen que estudiar mucho para sus exámenes importantes. Mi profesor de español comprende que escribir en otro idioma es difícil. En la escuela, leo libros fáciles, pero en la universidad leo textos. El maestro escribe las preguntas del examen en la computadora nueva. \"¿Comprende usted este problema de medicina?\" pregunta el profesor a la estudiante. Estudiar es importante, pero también necesitamos tiempo para descansar entre clases. La clase de español es fácil, pero la clase de medicina.\n\nMi computadora está rota, así que escribo todas mis notas con bolígrafo. El profesor dice que leer mucho es la mejor manera de. Los estudiantes necesitan estudiar más para el examen difícil de medicina mañana. En la escuela secundaria, todo era fácil, pero la universidad es. \"¿Tiene usted un bolígrafo que pueda prestarme?\" pregunta el estudiante al maestro. La clase de español es muy importante para mi carrera universitaria. Comprendo que estudiar medicina requiere mucha dedicación y trabajo duro todos."
    },
    {
        id: "unit-8-nationalities-and-origins",
        title: "Unit 8: Nationalities and Origins",
        category: "Learning",
        difficulty: "Very Easy",
        lang: "es",
        englishDescription: "Learn to talk about where you and others are from. This lesson covers nationalities, countries, and how to ask and answer questions about origin.",
        content: "Me llamo Carlos García y soy mexicano, pero vivo en Estados Unidos. Mi nombre completo aparece en mi pasaporte: soy de México específicamente. Ella se llama Ana Rodríguez, es cubana de Cuba, pero ahora vive. Te llamas María, ¿verdad? Eres americana de Estados Unidos, pero hablas español. Él es chino, pero se llama David porque vive en Estados Unidos. Usted se llama señora López, es española, y vive en una ciudad. Mi amiga americana me dice que México es un país muy bonito.\n\nEn mi clase hay estudiantes de China, Cuba, México y España viviendo. La profesora es española de España, pero enseña en una universidad americana. \"¿De dónde es usted?\" pregunta la estudiante cubana al profesor mexicano. Me llamo José, soy cubano, pero mis padres viven en Estados Unidos. El estudiante chino se llama Wang, pero todos lo llamamos William aquí. Mi amigo mexicano dice que su nombre es muy difícil de. La señora americana habla español porque vivió muchos años en México.\n\n\"¿Cómo se llama usted?\" pregunta el profesor a la nueva estudiante. \"Me llamo Carmen, soy española, pero vivo en Estados Unidos desde niña.\" El estudiante americano dice que quiere visitar China el próximo verano. Te llamas Ana, eres cubana, pero naciste en Estados Unidos, ¿verdad? Mi nombre es muy común en México, pero aquí en Estados. El profesor mexicano enseña sobre la cultura española en su clase. Usted se llama profesor García, es de Cuba, pero estudió en."
    },
    {
        id: "unit-9-feelings-and-daily-interactions",
        title: "Unit 9: Feelings and Daily Interactions",
        category: "Learning",
        difficulty: "Very Easy",
        lang: "es",
        englishDescription: "Practice expressing feelings and handling daily social interactions. This lesson covers vocabulary for being happy, tired, or busy, and common polite expressions.",
        content: "¿Cómo está usted esta mañana, señor García? Estoy muy bien, gracias, aunque. Buenas tardes, señora López, ¿cómo está su familia hoy? Mi hija está feliz porque está de vacaciones, pero mi esposo está ocupado. Te llamas Ana, ¿verdad? ¿Cómo estás después del examen difícil de ayer? Estoy un poco mal porque necesito más ayuda con mis estudios. Él está muy cansado porque usa la computadora demasiadas horas cada día.\n\nSeñorita, usted necesita descansar más; está muy ocupada con todos sus proyectos. \"¿Cómo está su madre?\" pregunta la señora a su vecina cansada. Estoy feliz porque mañana es viernes, pero también estoy muy ocupada. El señor necesita ayuda con su computadora porque está muy cansado. \"Buenos días, ¿cómo está usted hoy?\" saluda la secretaria al profesor. Estás muy cansada; necesitas usar menos la computadora por las noches. El estudiante está mal porque no comprende las matemáticas difíciles.\n\nHasta luego, y que tenga un buen día; hasta mañana en. La señora está ocupada, pero siempre tiene tiempo para ayudar a. \"¿Te llamas Carmen? ¿Cómo estás después de las vacaciones?\" pregunta la amiga. Estoy bien, pero necesito más café porque estoy muy cansada esta. El señor usa el té cuando está mal del estómago. \"¿Cómo se llama usted?\" pregunta la recepcionista al paciente en el. Hasta mañana, señorita; espero que esté mejor después del descanso."
    }
] as const;

export type Story = (typeof stories)[number];