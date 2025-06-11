<script lang="ts">
	import { onMount } from 'svelte';
	import { MicVAD } from '@ricky0123/vad-web';

	let vad;
	let status = 'Initializing...';
	async function init() {
		try {
			vad = await MicVAD.new({
				// Asset paths
				baseAssetPath: '/',
				onnxWASMBasePath: '/',
				model: 'v5',
				// VAD tuning parameters
				positiveSpeechThreshold: 0.5,
				negativeSpeechThreshold: 0.35,
				minSpeechFrames: 9,
				preSpeechPadFrames: 3,
				redemptionFrames: 24,

				// Other options
				frameSamples: 512,
				submitUserSpeechOnPause: true,

				// Callbacks
				onSpeechEnd: (audio) => {
					const dur = audio.length / 16000;
					console.log(`Speech detected: ${dur.toFixed(2)}s`);
				}
			});

			// Implement `startOnLoad: true`
			vad.start();
			status = 'Listening...';
		} catch (e: any) {
			console.error('VAD initialization failed:', e);
			status = `Error: ${e.message}`;
		}
	}

	onMount(init);
</script>

<h1>VAD Test with Custom Parameters</h1>
<p>Status: {status}</p>
<p>The VAD is now listening. Detected speech duration will be logged to the console.</p>
