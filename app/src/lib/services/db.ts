// src/lib/services/db.ts
import Dexie, { type Table } from 'dexie';

export interface CompletedLesson {
    id: string; // Corresponds to Story['id']
    recitalText: string;
    completedAt: Date;
}

export class FluentThroughSpeechDB extends Dexie {
    completedLessons!: Table<CompletedLesson>;

    constructor() {
        super('fluentThroughSpeechDB');
        this.version(1).stores({
            completedLessons: 'id, completedAt' // Primary key 'id', index 'completedAt'
        });
    }
}

export const db = new FluentThroughSpeechDB();

/**
 * Adds or updates a completed lesson in the database.
 * @param id The unique ID of the lesson.
 * @param recitalText The transcribed text from the user's recital.
 */
export async function addCompletedLesson(id: string, recitalText: string) {
    try {
        await db.completedLessons.put({
            id,
            recitalText,
            completedAt: new Date()
        });
        console.log(`Lesson ${id} saved as completed.`);
    } catch (error) {
        console.error('Failed to save completed lesson:', error);
    }
}

/**
 * Retrieves a single completed lesson by its ID.
 * @param id The ID of the lesson to retrieve.
 * @returns The completed lesson object or undefined if not found.
 */
export async function getCompletedLesson(id: string): Promise<CompletedLesson | undefined> {
    return await db.completedLessons.get(id);
}

/**
 * Retrieves the IDs of all completed lessons.
 * @returns A Set containing the string IDs of all completed lessons.
 */
export async function getAllCompletedLessonIds(): Promise<Set<string>> {
    try {
        const allKeys = await db.completedLessons.toCollection().keys();
        return new Set(allKeys as string[]);
    } catch (error) {
        console.error('Failed to retrieve completed lesson IDs:', error);
        return new Set();
    }
}
// This function fetches all chunks and combines them into a single ArrayBuffer.
export async function loadAndReassembleFile(
    chunkPaths: string[] // Now accepts an array of full paths
): Promise<ArrayBuffer> {
    const fetchPromises: Promise<ArrayBuffer>[] = [];

    // Iterate directly over the provided array of paths
    for (const url of chunkPaths) {
        fetchPromises.push(
            fetch(url).then((r) => {
                if (!r.ok) throw new Error(`Failed to fetch chunk: ${url}`);
                return r.arrayBuffer();
            })
        );
    }

    const allBuffers = await Promise.all(fetchPromises);

    let totalSize = 0;
    for (const buffer of allBuffers) {
        totalSize += buffer.byteLength;
    }

    const combined = new Uint8Array(totalSize);
    let offset = 0;
    for (const buffer of allBuffers) {
        combined.set(new Uint8Array(buffer), offset);
        offset += buffer.byteLength;
    }

    return combined.buffer;
}