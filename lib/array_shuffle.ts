import {inject} from "../_dependency_injection/dependency_container.ts";
import {InjectKey} from "../_dependency_injection/injection_keys.ts";

// FIXME: write tests
export function toShuffled<T>(anArray: T[]): T[] {
  const pseudoRandom = inject(InjectKey.PSEUDO_RANDOM);
  return anArray
    .map((value) => ({ value, sort: pseudoRandom.generateNumber() }))
    .toSorted((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
