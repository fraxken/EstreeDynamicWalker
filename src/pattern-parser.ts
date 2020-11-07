
import { irParser } from "./intermediate-parser";

export function* patternParser(source: string): IterableIterator<any> {
    const iterator = irParser(source);

    yield "boo";
}
