// src/lib/constants.ts
export const kSampleRate = 16000;
export const kMaxAudio_s = 30 * 60; // Max audio duration for file input
export const kMaxRecording_s = 2 * 60; // Max recording duration
export const MODEL_FILENAME_IN_FS = 'whisper.bin';
export const DEFAULT_MODEL_PATH = '/ggml-tiny.bin'; // Path to the model in /static
export const DEFAULT_MODEL_NAME = 'ggml-tiny.bin';

export const models: Record<
    string,
    { url: string; size: number }
> = {
    'tiny.en': { url: '/ggml-model-whisper-tiny.en.bin', size: 75 },
    tiny: { url: '/ggml-model-whisper-tiny.bin', size: 75 },
    'base.en': { url: '/ggml-model-whisper-base.en.bin', size: 142 },
    base: { url: '/ggml-model-whisper-base.bin', size: 142 },
    'small.en': { url: '/ggml-model-whisper-small.en.bin', size: 466 },
    small: { url: '/ggml-model-whisper-small.bin', size: 466 },
    'tiny-en-q5_1': { url: '/ggml-model-whisper-tiny.en-q5_1.bin', size: 31 },
    'tiny-q5_1': { url: '/ggml-model-whisper-tiny-q5_1.bin', size: 31 },
    'base-en-q5_1': { url: '/ggml-model-whisper-base.en-q5_1.bin', size: 57 },
    'base-q5_1': { url: '/ggml-model-whisper-base-q5_1.bin', size: 57 },
    'small-en-q5_1': {
        url: '/ggml-model-whisper-small.en-q5_1.bin',
        size: 182
    },
    'small-q5_1': { url: '/ggml-model-whisper-small-q5_1.bin', size: 182 }
};

export const languages = [
    { value: '', label: 'Auto' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'Arabic' },
    { value: 'hy', label: 'Armenian' },
    { value: 'az', label: 'Azerbaijani' },
    { value: 'eu', label: 'Basque' },
    { value: 'be', label: 'Belarusian' },
    { value: 'bn', label: 'Bengali' },
    { value: 'bg', label: 'Bulgarian' },
    { value: 'ca', label: 'Catalan' },
    { value: 'zh', label: 'Chinese' },
    { value: 'hr', label: 'Croatian' },
    { value: 'cs', label: 'Czech' },
    { value: 'da', label: 'Danish' },
    { value: 'nl', label: 'Dutch' },
    { value: 'et', label: 'Estonian' },
    { value: 'tl', label: 'Filipino' },
    { value: 'fi', label: 'Finnish' },
    { value: 'fr', label: 'French' },
    { value: 'gl', label: 'Galician' },
    { value: 'ka', label: 'Georgian' },
    { value: 'de', label: 'German' },
    { value: 'el', label: 'Greek' },
    { value: 'gu', label: 'Gujarati' },
    { value: 'iw', label: 'Hebrew' },
    { value: 'hi', label: 'Hindi' },
    { value: 'hu', label: 'Hungarian' },
    { value: 'is', label: 'Icelandic' },
    { value: 'id', label: 'Indonesian' },
    { value: 'ga', label: 'Irish' },
    { value: 'it', label: 'Italian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'kn', label: 'Kannada' },
    { value: 'ko', label: 'Korean' },
    { value: 'la', label: 'Latin' },
    { value: 'lv', label: 'Latvian' },
    { value: 'lt', label: 'Lithuanian' },
    { value: 'mk', label: 'Macedonian' },
    { value: 'ms', label: 'Malay' },
    { value: 'mt', label: 'Maltese' },
    { value: 'no', label: 'Norwegian' },
    { value: 'fa', label: 'Persian' },
    { value: 'pl', label: 'Polish' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ro', label: 'Romanian' },
    { value: 'ru', label: 'Russian' },
    { value: 'sr', label: 'Serbian' },
    { value: 'sk', label: 'Slovak' },
    { value: 'sl', label: 'Slovenian' },
    { value: 'es', label: 'Spanish' },
    { value: 'sw', label: 'Swahili' },
    { value: 'sv', label: 'Swedish' },
    { value: 'ta', label: 'Tamil' },
    { value: 'te', label: 'Telugu' },
    { value: 'th', label: 'Thai' },
    { value: 'tr', label: 'Turkish' },
    { value: 'uk', label: 'Ukrainian' },
    { value: 'ur', label: 'Urdu' },
    { value: 'vi', label: 'Vietnamese' },
    { value: 'cy', label: 'Welsh' },
    { value: 'yi', label: 'Yiddish' }
];