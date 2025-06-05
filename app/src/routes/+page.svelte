<!-- src/routes/+page.svelte -->
<script lang="ts" module>
	// "schema": our internal JSON of stories
	export const stories = [
		{
			id: 'el-dinosaurio-monterroso',
			title: 'El Dinosaurio',
			category: 'Literature',
			difficulty: 'Very Easy',
			content: 'Cuando despertó, el dinosaurio todavía estaba allí.'
		},
		{
			id: 'el-emigrante-lomeli',
			title: 'El Emigrante',
			category: 'Literature',
			difficulty: 'Very Easy',
			content: '¿Olvida usted algo? —Ojalá.'
		},
		{
			id: 'calidad-y-cantidad-jodorowsky',
			title: 'Calidad y Cantidad',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'No se enamoró de ella, sino de su sombra. La iba a visitar al alba, cuando su amada era más larga.'
		},
		{
			id: 'el-aliento-del-mar-isabel-allende',
			title: 'El Aliento del Mar',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'Desde la ventana, la anciana veía el mar. Todos los días, a la misma hora, una ola más grande que las otras llegaba a la orilla y dejaba en la arena un caracol. La anciana recogía cada caracol, los ponía en un tazón. Un día, el tazón estaba lleno. Acercó el oído a uno de los caracoles. Y escuchó. No el sonido del mar, sino el de su propia respiración, la de una vida entera, el aliento que la había traído hasta allí.'
		},
		{
			id: 'el-espejo-bayo-bouzas',
			title: 'El Espejo',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				"Un espejo muy antiguo no reflejaba lo que tenía delante, sino lo que la persona que lo miraba deseaba más en su corazón. La gente acudía de todas partes. Algunos veían fortuna, otros amor, algunos veían poder. Un anciano, ciego de nacimiento, se acercó al espejo. Extendió una mano temblorosa. El espejo se iluminó con una luz suave. El anciano sonrió. Dijo: 'Veo la paz'. Y en ese momento, el espejo se hizo añicos."
		},
		{
			id: 'el-grillo-maestro-monterroso',
			title: 'El Grillo Maestro',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'Al principio, la Fábula era el Grillo que le daba clases de Canto a la Cigarra, que nunca entendió nada. Después, en una segunda versión, la Fábula era la Cigarra que, cansada de trabajar para mantenerse, se dedicaba a cantar, en tanto que el Grillo la escuchaba extasiado. Finalmente, en una tercera versión, la Fábula era el Grillo que se dedicaba a tocar el violín, mientras la Cigarra, como siempre, cantaba, ignorándose si él tocaba mejor que ella, o viceversa.'
		},
		{
			id: 'el-hombre-invisible-jimenez-eman',
			title: 'El Hombre Invisible',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'Aquel hombre era invisible, pero nadie se percató de ello. Ni su esposa, ni sus hijos, ni sus compañeros de trabajo. Seguía haciendo su vida normal: iba a la oficina, cenaba en casa, veía la televisión. Un día, se asomó al espejo y no vio su reflejo. Fue entonces cuando se dio cuenta. Pero como era invisible, ¿cómo podía verse a sí mismo para saber que era invisible?'
		},
		{
			id: 'la-jirafa-arreola',
			title: 'La Jirafa',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'De pronto, el viejo explorador se sintió fatigado. Hacía años que buscaba una jirafa blanca. La había soñado desde niño y había dedicado su vida entera a encontrarla. Había recorrido selvas, desiertos, montañas, había sufrido hambre, sed, fiebres. Ahora, exhausto, se detuvo bajo un árbol. Cerró los ojos. Al abrirlos, vio que el árbol era una jirafa blanca.'
		},
		{
			id: 'el-leon-que-no-sabia-leer-y-escribir-shua',
			title: 'El León que No Sabía Leer y Escribir',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				"El león que no sabía leer ni escribir le preguntó a la jirafa: '¿Qué dice aquí?' La jirafa le respondió: 'Dice que no hay más leones como tú.' El león se puso muy triste. Entonces el búho, que sí sabía leer, le dijo: 'Mira, no dice eso. Dice: 'Se busca león que sepa leer y escribir para importante trabajo'. El león sonrió. 'Es un trabajo para mí', pensó, y se fue a aprender a leer y escribir."
		},
		{
			id: 'la-luz-robada-mempo-giardinelli',
			title: 'La Luz Robada',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'En un pueblo donde nunca salía el sol, un niño decidió robar la luz. Subió a la montaña más alta y encontró un cofre brillante. Al abrirlo, una luz cegadora lo envolvió. La llevó al pueblo, y por primera vez, todos vieron los colores. Pero la luz era tan fuerte que la gente cerraba los ojos, dolidos. El niño se dio cuenta: la luz no se roba, se comparte. Volvió a la montaña y la dejó ir, poco a poco, en forma de luciérnagas, para que cada noche el pueblo tuviera su pequeña estrella.'
		},
		{
			id: 'los-descubridores-mata',
			title: 'Los Descubridores',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				"Descubrieron un nuevo continente. Era vasto, verde, lleno de vida. Recorrieron sus ríos, escalaron sus montañas, se maravillaron con sus animales. Cuando regresaron a casa, llenos de historias, nadie les creyó. 'Imposible', dijeron, 'ya todo está descubierto'. Los descubridores se miraron. ¿Acaso habían soñado? Volvieron al mar. El continente había desaparecido. Solo quedaba el vasto océano, y la duda."
		},
		{
			id: 'la-mosca-quiroga',
			title: 'La Mosca',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'Una mosca se posó en la nariz del león. El león, con un gruñido, movió la cola. La mosca voló. Se posó en la oreja. El león la espantó con la pata. La mosca regresó, obstinada. El león, irritado, rugió. La mosca, impávida, se paseaba por sus ojos, por su boca. El león se cansó. Dejó de luchar. La mosca se sintió victoriosa. Y al sentirse así, se posó en el aire y desapareció.'
		},
		{
			id: 'la-mujer-que-se-caso-con-un-caballo-shua',
			title: 'La Mujer que se Casó con un Caballo',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'La mujer que se casó con un caballo era feliz. Su marido era fuerte, leal y hermoso. Podían galopar juntos por los campos, sentir el viento en sus crines. La gente al principio se reía, luego se acostumbró. La única pena era la de no tener hijos, aunque a veces, al amanecer, juraba escuchar pequeños trotes en el pasillo, y veía, entreabierta, la puerta del establo.'
		},
		{
			id: 'la-oveja-negra-monterroso',
			title: 'La Oveja Negra',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'En un lejano país existió una oveja negra. Fue fusilada. Un siglo después, el rebaño arrepentido le levantó una estatua ecuestre que quedó muy bien en el parque. Así, en lo sucesivo, cada vez que aparecían ovejas negras eran rápidamente fusiladas para que las futuras generaciones de ovejas comunes y corrientes pudieran ejercitarse también en la escultura.'
		},
		{
			id: 'el-pez-que-no-queria-ser-pescado-galeano',
			title: 'El Pez que No Quería Ser Pescado',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				"Había un pez que no quería ser pescado. Nadaba siempre cerca de la orilla, donde el agua era demasiado baja para las redes. Los pescadores se reían de él. 'Es tonto', decían. Pero el pez seguía allí, tranquilo, observando. Un día, una tormenta arrastró a todos los otros peces mar adentro. El pez que no quería ser pescado, en la orilla, vio cómo pasaban. Y sonrió. Era el único que quedó."
		},
		{
			id: 'el-pozo-cisneros',
			title: 'El Pozo',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'Cayó al pozo. Era muy hondo, oscuro. Gritó, pero nadie lo oyó. Pasaron días. La sed lo consumía, el hambre lo debilitaba. Estaba a punto de rendirse cuando vio una pequeña luz en la oscuridad. Era una estrella, reflejada en el poco de agua que quedaba. Entonces entendió. No estaba solo. No estaba cayendo. Estaba flotando, y la luz, aunque distante, le mostraba que había un cielo incluso en el fondo del abismo.'
		},
		{
			id: 'la-puerta-osorio',
			title: 'La Puerta',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'Era una puerta, en medio de la nada. Sin paredes, sin casa, solo una puerta vieja y de madera. La gente pasaba y la ignoraba. Otros la tocaban, pero estaba cerrada. Un día, un niño pequeño se acercó. No intentó abrirla. Simplemente se sentó frente a ella, y empezó a dibujar con un palo en la tierra. La puerta, por primera vez, se abrió suavemente hacia un jardín lleno de flores y un sol brillante.'
		},
		{
			id: 'el-reloj-sin-manecillas-barros',
			title: 'El Reloj sin Manecillas',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				"Había una vez un reloj sin manecillas. La gente le preguntaba la hora y él respondía: 'Es ahora'. Al principio, nadie lo entendía. Luego, comenzaron a prestarle atención. Dejaron de correr, de preocuparse por el futuro, de lamentar el pasado. Simplemente vivían. El reloj sin manecillas era el más exacto de todos, porque marcaba el único tiempo que de verdad existía."
		},
		{
			id: 'la-sombra-propia-o-campo',
			title: 'La Sombra Propia',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'Un hombre se dio cuenta de que su sombra era cada vez más grande. No importaba la hora del día, ni la luz. La sombra lo seguía, se extendía, lo envolvía. Al principio le dio miedo, luego se acostumbró. Un día, la sombra fue tan grande que cubrió todo el pueblo, luego el país, luego el mundo. El hombre se dio cuenta de que la sombra no era suya, sino del mundo. Y el mundo, sin él, no tenía sombra.'
		},
		{
			id: 'el-suspiro-garcia-marquez',
			title: 'El Suspiro',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'Una vez, un hombre dio un suspiro tan hondo que de su boca salió una mariposa. La mariposa voló por el aire, se posó en una flor, y murió. El hombre, sorprendido, intentó dar otro suspiro, pero ya no pudo. La mariposa se había llevado algo vital de su aliento. Desde entonces, el hombre vivió sin suspiros, y aunque no sentía tristeza, tampoco sentía la plena alegría.'
		},
		{
			id: 'el-ultimo-poema-carlota-montenegro',
			title: 'El Último Poema',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				'Un poeta, al final de sus días, decidió escribir su último poema. Quería que fuera perfecto, que lo contuviera todo. Escribió y borró, buscó la palabra justa, la rima imposible. Pasaron días, semanas, meses. El poema no avanzaba. Una mañana, mientras miraba el amanecer, se dio cuenta. Su último poema no necesitaba palabras. Era el silencio de su mente, la paz de su corazón, el aliento de la vida que se iba. Y con esa comprensión, sonrió.'
		},
		{
			id: 'el-viajero-valenzuela',
			title: 'El Viajero',
			category: 'Literature',
			difficulty: 'Easy',
			content:
				"El viajero llegó a la ciudad que no tenía nombre. Las calles eran silenciosas, las casas idénticas. No había gente. Ni un perro. Ni un pájaro. Solo el viento silbaba entre los edificios vacíos. Pensó que era el fin del mundo. Entró en una de las casas y encontró una nota en la mesa: 'Bienvenido. Estábamos esperándote. Ya eres uno de nosotros.'"
		},
		{
			id: 'la-flor-del-aire-barrios',
			title: 'La Flor del Aire',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				'En un jardín sin tierra ni agua, creció una flor. Nadie sabía cómo. Sus pétalos eran de luz, su tallo de brisa. Se alimentaba del aire, del sol, de la esperanza. Los botánicos no la entendían. Los poetas la adoraban. Un día, una niña se acercó y sopló suavemente. La flor se desvaneció en el aire, dejando un perfume dulce y la certeza de que la belleza, a veces, no necesita nada para existir.'
		},
		{
			id: 'el-arbol-que-hablaba-perez-galdos',
			title: 'El Árbol que Hablaba',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				"En el bosque encantado vivía un árbol que podía hablar. Pero solo hablaba una vez al año, y solo una palabra. La gente venía de lejos para escucharlo. Algunos esperaban sabiduría, otros una profecía, algunos un consuelo. Un año, un joven le preguntó: '¿Qué es la vida?' El árbol, con una voz profunda, dijo: 'Vuela'. Y no dijo nada más hasta el próximo año. El joven, sin entender, regresó a su casa. Y pasó el resto de su vida viendo cómo todo, como un pájaro, volaba."
		},
		{
			id: 'continuidad-de-los-parques-cortazar',
			title: 'Continuidad de los Parques',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				'Había empezado a leer la novela unos días antes. La abandonó por negocios urgentes, volvió a abrirla cuando regresaba en el tren a la finca; se dejaba interesar lentamente por la trama, por el dibujo de los personajes. Esa tarde, después de la correspondencia, echó un último vistazo al prospecto del negocio y al contrato; era la hora de la siesta. Apoyó la cabeza contra el respaldo del sillón y se dejó ir. Al despertar, el parque había desaparecido. Y también la casa. Solo la novela, con su lectura, se extendía hasta el infinito, como una sombra perpetua.'
		},
		{
			id: 'el-eclipse-monterroso',
			title: 'El Eclipse',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				'Cuando fray Bartolomé Arrazola se sintió perdido aceptó que nada podría ya salvarlo. La selva poderosa de Guatemala lo había apresado, implacable y definitiva. Ante su ignorancia topográfica se sentó con tranquilidad a esperar la muerte. Quiso morir allí, dignamente, como Cuauhtémoc, sin un grito. Al despertar se encontró rodeado por indígenas que se disponían a sacrificarlo. Recordó que para ese día se preveía un eclipse total de sol. Aprovechó para decirles que si lo sacrificaban, el sol se oscurecería para siempre. Los indígenas, asombrados, lo soltaron. Fray Bartolomé se salvó, pero la ciencia europea perdió una fecha irrecuperable.'
		},
		{
			id: 'el-escritor-y-el-silencio-piglia',
			title: 'El Escritor y el Silencio',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				'El escritor pasó toda su vida persiguiendo el silencio perfecto para escribir. Buscó en monasterios remotos, en islas desiertas, en el corazón de los bosques. Lo encontró una noche, en una pequeña cabaña, lejos de todo. El silencio era tan profundo que podía oír el latido de su propio corazón. Sacó su pluma. Pero entonces se dio cuenta de que no tenía nada que decir. El silencio, en su perfección, no dejaba espacio para las palabras.'
		},
		{
			id: 'instrucciones-para-llorar-cortazar',
			title: 'Instrucciones para llorar',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				'Dejando de lado los motivos, atengámonos a la manera correcta de llorar, entendiendo por esto un llanto que no humille al espectador ni convierta el llanto en un espectáculo. Aconsejo llorar en público si el llanto es inminente y muy fuerte; en este caso, se requiere un pañuelo de papel limpio. El llanto solitario es más discreto y se puede realizar en cualquier momento, incluso de noche, sin testigos. Conviene no hacer ruido, el llanto es una cuestión íntima, no un reclamo de atención. Los ojos, por supuesto, deben cerrarse para evitar la visión de lágrimas.'
		},
		{
			id: 'el-libro-sin-palabras-saer',
			title: 'El Libro sin Palabras',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				'Existía un libro, se decía, que no tenía palabras. Sus páginas estaban en blanco, pero al tocarlas, el lector sentía una historia, una emoción, un recuerdo. No era un libro para leer, sino para sentir. La gente lo buscaba, pero pocos lo encontraban. Cuando alguien lo abría, su vida cambiaba. Porque al final, el libro no estaba vacío; cada página era el reflejo de la historia que el lector llevaba dentro, esperando ser contada por el tacto, no por la vista.'
		},
		{
			id: 'el-mapa-sin-territorio-mario-benedetti',
			title: 'El Mapa Sin Territorio',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				'Crearon un mapa tan detallado que incluía cada árbol, cada piedra, cada hormiga del territorio. Pero al superponerlo al territorio, descubrieron que el mapa era más grande que la realidad. Intentaron reducirlo, pero siempre quedaban detalles de más. Al final, se dieron cuenta: el mapa no era del territorio, sino de su propia imaginación, siempre más vasta y compleja que el mundo que pretendían representar.'
		},
		{
			id: 'la-trama-borges',
			title: 'La Trama',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				'Un gaucho, Martín Fierro, se alza contra el gobierno y los indios, y sus versos, como una trama, se tejen en la memoria de los hombres. El fin es una trama, la trama un fin. La trama es un laberinto en que todos se pierden. El que teje la trama, ya es trama, no es el tejedor. La trama no tiene fin, es un sinfín de principios. La trama se teje con palabras, las palabras con silencios. La trama es un espejo donde el mundo se refleja.'
		},
		{
			id: 'un-sueno-borges',
			title: 'Un Sueño',
			category: 'Literature',
			difficulty: 'Intermediate',
			content:
				'En un desierto lugar del Irán hay una no muy alta torre de piedra, sin puerta ni ventana. En la única habitación (cuyo piso es de tierra y que tiene la forma de círculo) hay una mesa de maderas y un banco. En esa celda circular, un hombre que se parece a mí escribe en caracteres que no comprendo un largo poema sobre un hombre que en otra celda circular escribe un poema sobre un hombre que en otra celda circular escribe un poema.'
		}
	] as const;

	export type Story = (typeof stories)[number];
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';
	import practiceStore, { resetPractice } from '$lib/stores/practiceStore';
	import ParagraphInput from '$lib/components/ParagraphInput.svelte';
	import PracticeDisplay from '$lib/components/PracticeDisplay.svelte';
	import ModelLoader from '$lib/components/whisper/ModelLoader.svelte';
	import LogViewer from '$lib/components/whisper/LogViewer.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	import MenuIcon from '@lucide/svelte/icons/menu';
	import UserCircleIcon from '@lucide/svelte/icons/user-circle-2';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import BugIcon from '@lucide/svelte/icons/bug';
	import { languages as languageOptionsConstant } from '$lib/constants';
	import { labelClasses, selectClasses as regularSelectClasses } from '$lib/uiClasses';

	let {
		stories: availableStories = stories,
		initialId = stories[0].id
	}: { stories?: readonly Story[]; initialId?: string } = $props();

	let selectedStoryId = $state<string>(initialId);
	let selectedGlobalLanguage = $state<string>('en');
	let showDebugInfo = $state(false);

	let selectedStory: Story = $derived.by(() => {
		const found = availableStories.find((s) => s.id === selectedStoryId);
		return found || availableStories[0];
	});

	let showSidebar = $state(true);

	let logOutput = $state('Welcome to FluentThroughSpeech with Whisper!\n');
	let appModelStatus = $state('Whisper not initialized. Start practice to load model.');
	let currentSelectedModelName = $state('');
	let isModelLoaded = $state(false);
	let whisperContextId = $state<number | null>(null);
	let whisperModule: any = $state(null);
	let isWasmReady = $state(false);
	let isWasmLoading = $state(false);

	function printToLog(text: string, type: 'info' | 'error' | 'warn' = 'info') {
		const prefix = type === 'error' ? 'ERROR: ' : type === 'warn' ? 'WARN: ' : '';
		logOutput += `${prefix}${text}\n`;
	}

	async function initializeWhisperSystems() {
		if (isWasmReady || isWasmLoading) {
			return;
		}
		isWasmLoading = true;
		appModelStatus = 'Initializing Whisper Audio Engine...';
		toast.info('Initializing Whisper audio engine...');

		if ('serviceWorker' in navigator) {
			try {
				await navigator.serviceWorker.register('/coi-serviceworker.min.js', { scope: '/' });
			} catch (e: any) {
				printToLog(
					`COI Service Worker registration failed: ${e.message}. Transcription may not work.`,
					'error'
				);
				isWasmLoading = false;
				isWasmReady = false;
				appModelStatus = 'COI Service Worker failed. Transcription disabled.';
				toast.error(
					`COI Service Worker registration failed: ${e.message}. Transcription may not work.`
				);
				return;
			}
		} else {
			printToLog('Service Workers not supported in this browser.', 'warn');
			toast.warning('Service Workers not supported. Transcription might not work.');
		}

		try {
			const helpersScript = document.createElement('script');
			helpersScript.src = '/whisper.wasm/helpers.js';
			helpersScript.onload = () => {
				if (typeof (window as any).loadRemote !== 'function') {
					printToLog(
						'loadRemote function not found. Model fetching via buttons might fail.',
						'warn'
					);
				}
				loadMainJs();
			};
			helpersScript.onerror = () => {
				printToLog('Failed to load helpers.js.', 'error');
				isWasmLoading = false;
				isWasmReady = false;
				appModelStatus = 'Failed to load Whisper helper scripts.';
				toast.error('Failed to load essential Whisper script (helpers.js).');
			};
			document.head.appendChild(helpersScript);
		} catch (e: any) {
			printToLog(`Error setting up helpers.js: ${e.message}`, 'error');
			isWasmLoading = false;
			isWasmReady = false;
			appModelStatus = `Error setting up Whisper: ${e.message}`;
			toast.error(`Error setting up Whisper: ${e.message}`);
		}
	}

	function loadMainJs() {
		(window as any).Module = {
			print: (text: string) => printToLog(`WASM: ${text}`),
			printErr: (text: string) => printToLog(`WASM_ERR: ${text}`, 'error'),
			setStatus: (text: string) => {
				if (!text && isWasmReady && !isModelLoaded && appModelStatus.includes('No model loaded'))
					return;
			},
			monitorRunDependencies: (left: number) => {},
			onRuntimeInitialized: async () => {
				isWasmReady = true;
				isWasmLoading = false;
				whisperModule = (window as any).Module;
				appModelStatus = 'WASM Runtime Ready. Select or load a model.';
				toast.success('Whisper WASM engine ready!');
			},
			locateFile: (path: string, prefix: string) => {
				if (path.endsWith('.wasm')) {
					return '/whisper.wasm';
				}
				return prefix + path;
			}
		};
		try {
			const mainScript = document.createElement('script');
			mainScript.src = '/libmain.js';
			mainScript.async = true;
			mainScript.onerror = () => {
				printToLog('Failed to load libmain.js.', 'error');
				isWasmLoading = false;
				isWasmReady = false;
				appModelStatus = 'Error loading WASM module (libmain.js).';
				toast.error('Failed to load Whisper WASM module.');
			};
			document.head.appendChild(mainScript);
		} catch (e: any) {
			printToLog(`Error loading libmain.js: ${e.message}`, 'error');
			isWasmLoading = false;
			isWasmReady = false;
			appModelStatus = `Error loading WASM module: ${e.message}`;
			toast.error('Failed to load Whisper WASM module.');
		}
	}

	$effect(() => {
		if ($practiceStore.isPracticeMode && !isWasmReady && !isWasmLoading) {
			initializeWhisperSystems();
		}
	});

	function handleLogFromChild(
		event: CustomEvent<{ text: string; type?: 'info' | 'error' | 'warn' }>
	) {
		printToLog(event.detail.text, event.detail.type);
	}

	function handleModelInitialized(event: CustomEvent<{ contextId: number; modelName: string }>) {
		whisperContextId = event.detail.contextId;
		currentSelectedModelName = event.detail.modelName;
		isModelLoaded = true;
	}

	function handleModelUnloaded() {
		if (whisperModule && whisperContextId) {
			try {
				whisperModule.free(whisperContextId);
			} catch (e: any) {
				printToLog(`Error freeing context ${whisperContextId}: ${e.message}`, 'error');
			}
		}
		whisperContextId = null;
		isModelLoaded = false;
		currentSelectedModelName = '';
		appModelStatus = 'Model unloaded. Select a language and text to start practice.';
	}

	function handleModelStatusUpdate(event: CustomEvent<string>) {
		appModelStatus = event.detail;
	}

	function handleParagraphInputPracticeStarted() {}

	onDestroy(() => {
		if (whisperModule && whisperContextId) {
			try {
				whisperModule.free(whisperContextId);
			} catch (e: any) {
				printToLog(`Error freeing context on App destroy: ${e.message}`, 'error');
			}
		}
	});

	const initialNumThreads = Math.min(
		16,
		Math.max(1, Math.floor((navigator.hardwareConcurrency || 4) / 2))
	);

	function toggleDebugInfo() {
		showDebugInfo = !showDebugInfo;
	}
</script>

<svelte:head>
	<title>FluentThroughSpeech - Your Speaking Practice Hub</title>
	<meta
		name="description"
		content="Improve your English fluency and pronunciation by practicing with text and getting instant feedback through AI-powered speech-to-text."
	/>
</svelte:head>

<Toaster richColors position="top-right" />

<div class="flex h-screen flex-col bg-slate-900 text-slate-100">
	<nav
		class="sticky top-0 z-50 flex h-16 items-center justify-between bg-slate-800/80 p-3 px-4 shadow-md backdrop-blur-md md:px-6"
	>
		<div class="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				class="text-slate-100 hover:bg-slate-700 md:hidden"
				onclick={() => (showSidebar = !showSidebar)}
			>
				<MenuIcon class="h-6 w-6" />
			</Button>
			<BookOpenTextIcon class="h-8 w-8 text-purple-400" />
			<h1 class="text-xl font-semibold tracking-tight text-slate-100">FluentThroughSpeech</h1>
		</div>
		<div class="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				title="User Profile (Coming Soon!)"
				class="text-slate-300 hover:bg-slate-700 hover:text-slate-100"
			>
				<UserCircleIcon class="h-6 w-6" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				title="Settings (Coming Soon!)"
				class="text-slate-300 hover:bg-slate-700 hover:text-slate-100"
			>
				<SettingsIcon class="h-6 w-6" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				title={showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
				class="text-slate-300 hover:bg-slate-700 hover:text-slate-100 {showDebugInfo
					? '!bg-purple-500/20 text-purple-400'
					: ''}"
				onclick={toggleDebugInfo}
			>
				<BugIcon class="h-6 w-6" />
			</Button>
		</div>
	</nav>

	<div class="flex flex-1 overflow-hidden">
		{#if showSidebar}
			<ScrollArea
				class="fixed inset-y-0 left-0 z-40 w-64 transform 
					   border-r border-slate-700 bg-slate-800/90 text-slate-300 shadow-lg transition-transform duration-300 ease-in-out 
					   md:static md:h-[calc(100vh-4rem-3rem)] md:shrink-0 md:transform-none md:transition-none 
					   {showSidebar ? 'translate-x-0' : '-translate-x-full'}"
			>
				<div
					class="h-full p-4 {showSidebar && typeof window !== 'undefined' && window.innerWidth < 768
						? 'pt-16' // For fixed mobile view, pad below nav
						: 'md:pt-4'}"
				>
					<h2 class="mb-4 text-lg font-semibold tracking-tight text-slate-100">
						Choose Your Passage
					</h2>
					<ul class="space-y-1">
						{#each availableStories as story (story.id)}
							<li>
								<button
									onclick={() => {
										selectedStoryId = story.id;
										if (window.innerWidth < 768) showSidebar = false;
									}}
									class="flex w-full items-center justify-between rounded-md p-2.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none
										{selectedStoryId === story.id
										? 'bg-purple-500/20 font-medium text-purple-200'
										: 'hover:bg-slate-700 hover:text-slate-100'}"
								>
									<div class="flex-1">
										<p class="font-medium">{story.title}</p>
										<p class="text-xs text-slate-400">
											{story.category} - {story.difficulty}
										</p>
									</div>
									{#if selectedStoryId === story.id}
										<ChevronRightIcon class="h-5 w-5 text-purple-300" />
									{/if}
								</button>
							</li>
						{/each}
					</ul>
					<div class="mt-6 border-t border-slate-700 pt-4">
						<p class="text-xs text-slate-400">
							(Future: Filter by difficulty/category, search passages)
						</p>
					</div>
				</div>
			</ScrollArea>
		{/if}

		<main class="flex-1 overflow-y-auto px-4 pt-16 pb-6 md:h-full">
			{#if !$practiceStore.isPracticeMode}
				<Card class="mx-auto w-full max-w-3xl bg-slate-800 text-slate-100 shadow-xl">
					<CardHeader>
						<CardTitle class="text-center text-3xl font-bold text-slate-100"
							>{selectedStory.title}</CardTitle
						>
						<CardDescription class="text-center text-slate-400">
							Category: {selectedStory.category} | Difficulty: {selectedStory.difficulty}
						</CardDescription>
					</CardHeader>
					<CardContent class="mt-4">
						<div class="mb-6">
							<label
								for="global-language-select"
								class="{labelClasses} mb-2 block text-lg font-medium text-slate-300"
							>
								Select Language for Practice:
							</label>
							<select
								id="global-language-select"
								bind:value={selectedGlobalLanguage}
								class="{regularSelectClasses} w-full border-slate-600 bg-slate-700 text-slate-100 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
							>
								{#each languageOptionsConstant as lang (lang.value)}
									<option value={lang.value}>{lang.label}</option>
								{/each}
							</select>
							<p class="mt-2 text-xs text-slate-400">
								This language will be used for model loading and transcription.
							</p>
						</div>

						{#if selectedStory && selectedStory.content}
							<ParagraphInput
								initialParagraph={selectedStory.content}
								on:practiceStarted={handleParagraphInputPracticeStarted}
							/>
						{:else}
							<div
								class="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-slate-700 bg-slate-700/50 p-4"
							>
								<p class="text-slate-400">Select a story to begin.</p>
							</div>
						{/if}
						<div class="mt-8 rounded-lg border border-dashed border-slate-700 p-4 text-center">
							<p class="text-slate-400">
								✨ Tip: Speak clearly and at a natural pace. (More tips coming soon!) ✨
							</p>
						</div>
					</CardContent>
				</Card>
			{:else}
				<!-- Practice Mode UI -->
				{#if !isModelLoaded && isWasmLoading}
					<div class="flex h-full flex-col items-center justify-center p-8 text-center">
						<div
							class="loader mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
						></div>
						<p class="text-xl font-semibold text-slate-100">Initializing Whisper Audio Engine...</p>
						<p class="text-slate-400">
							This may take a moment. Please ensure you have a stable internet connection.
						</p>
					</div>
				{:else if !isModelLoaded && !isWasmLoading && isWasmReady}
					<div class="flex h-full flex-col items-center justify-center p-8 text-center">
						<div
							class="loader mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
						></div>
						<p class="text-xl font-semibold text-slate-100">Loading Whisper Model...</p>
						<p class="text-slate-400">
							The model (for {languageOptionsConstant.find(
								(l) => l.value === selectedGlobalLanguage
							)?.label || 'selected language'}) is being downloaded and initialized. This can take
							some time.
						</p>
					</div>
				{/if}

				<PracticeDisplay
					{whisperModule}
					{whisperContextId}
					{isModelLoaded}
					numThreadsForTranscription={initialNumThreads}
					languageForTranscription={selectedGlobalLanguage}
					on:log={handleLogFromChild}
				/>
				<div class="mt-8 flex justify-center">
					<Button
						onclick={resetPractice}
						class="bg-violet-500 py-3 text-lg text-slate-100 hover:bg-violet-400"
						size="lg"
					>
						End Practice / New Passage
					</Button>
				</div>
			{/if}

			{#if showDebugInfo}
				<div
					class="mx-auto mt-10 w-full max-w-3xl space-y-6 border-t-2 border-dashed border-slate-700 pt-6"
				>
					<h3 class="text-center text-lg font-semibold text-slate-400">
						Whisper Engine & Model Controls (Debug)
					</h3>
					<ModelLoader
						{whisperModule}
						{isWasmReady}
						{isWasmLoading}
						preferredLanguage={selectedGlobalLanguage}
						initialModelStatus={appModelStatus}
						on:log={handleLogFromChild}
						on:notify={(e) => toast[e.detail.type](e.detail.message)}
						on:modelInitialized={handleModelInitialized}
						on:modelUnloaded={handleModelUnloaded}
						on:statusUpdate={handleModelStatusUpdate}
					/>
					<LogViewer {logOutput} />
				</div>
			{/if}
		</main>
	</div>

	<footer
		class="h-20 border-t border-slate-700 bg-slate-800/80 p-4 text-center text-xs text-slate-400"
	>
		<p>&copy; {new Date().getFullYear()} FluentThroughSpeech. Powered by Svelte & Whisper.cpp.</p>
		<p class="mt-1">
			For best results, use a modern browser. Ensure microphone permissions are granted.
		</p>
		<p class="mt-1">(Future: Privacy Policy | About | Leaderboard)</p>
	</footer>
</div>

<style>
	.loader {
		border-style: solid;
	}
</style>
