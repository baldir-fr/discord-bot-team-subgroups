import { Prng, randomSeeded } from "jsr:@std/random";

export interface Index {
  generateNumber(): number;
}

export class SeededPseudoRandom implements Index {
  generate: Prng;
  constructor(seed: bigint) {
    this.generate = randomSeeded(seed);
  }

  generateNumber(): number {
    return this.generate();
  }
}
