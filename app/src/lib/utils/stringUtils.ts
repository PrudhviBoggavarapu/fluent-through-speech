// src/lib/utils/stringUtils.ts

export function levenshteinDistance(s1: string, s2: string): number {
    if (s1.length < s2.length) {
        return levenshteinDistance(s2, s1);
    }

    // s1 is longer.
    if (s2.length === 0) {
        return s1.length;
    }

    const previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i);

    for (let i = 0; i < s1.length; i++) {
        const currentRow = [i + 1];
        for (let j = 0; j < s2.length; j++) {
            const insertions = previousRow[j + 1] + 1;
            const deletions = currentRow[j] + 1;
            const substitutions = previousRow[j] + (s1[i] === s2[j] ? 0 : 1);
            currentRow.push(Math.min(insertions, deletions, substitutions));
        }
        previousRow.splice(0, previousRow.length, ...currentRow);
    }

    return previousRow[s2.length];
}

export function calculateSimilarity(s1: string, s2: string): number {
    const longerLength = Math.max(s1.length, s2.length);
    if (longerLength === 0) {
        return 100.0; // Both empty, 100% similar
    }
    const distance = levenshteinDistance(s1, s2);
    return (1.0 - distance / longerLength) * 100.0;
}