import { inject } from "../_dependency_injection/dependency_container.ts";
import { InjectKey } from "../_dependency_injection/injection_keys.ts"; // FIXME: write tests

/**
 * Needs to have a pseudo random number generator provided with piqure :
 * InjectKey.PSEUDO_RANDOM
 * @param anArray a copy of the array randomized
 */
export function toShuffledArray<T>(anArray: T[]): T[] {
  const pseudoRandom = inject(InjectKey.PSEUDO_RANDOM);
  return anArray
    .map((value) => ({ value, sort: pseudoRandom.generateNumber() }))
    .toSorted((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
