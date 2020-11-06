
export const END_OF_SEQUENCE = Symbol();
export type SEQUENCE_OR_TOKEN<T> = typeof END_OF_SEQUENCE | T;

export const CONSTANTS = Object.freeze({
    WORDS: new Set(["Node"]),
    SYMBOLS: new Set(["*", ">", ":", "|", "{", "}", ","])
});

export function getNextItem<T>(iterator: IterableIterator<T>): SEQUENCE_OR_TOKEN<T> {
    const item = iterator.next();

    return item.done ? END_OF_SEQUENCE : item.value;
}
