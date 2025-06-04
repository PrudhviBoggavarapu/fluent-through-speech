// src/lib/constants.ts
export const kSampleRate = 16000;
export const kMaxAudio_s = 30 * 60; // Max audio duration for file input
export const kMaxRecording_s = 2 * 60; // Max recording duration
export const MODEL_FILENAME_IN_FS = 'whisper.bin';

// Default multilingual model
export const DEFAULT_MODEL_PATH = '/ggml-tiny.bin';
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