import { Prng, randomSeeded } from "jsr:@std/random";

export interface PseudoRandom {
  generateNumber(): number;
}

export class SeededPseudoRandom implements PseudoRandom {
  generate: Prng;
  constructor(seed: bigint) {
    this.generate = randomSeeded(seed);
  }

  // 💡Remember doctest exists
  //   https://docs.deno.com/runtime/fundamentals/testing/#documentation-tests

  generateNumber(): number {
    return this.generate();
  }
}
