import { expect } from "jsr:@std/expect";
import { SeededPseudoRandom } from "../lib/PseudoRandom.ts";

const test = Deno.test;

test("seeded pseudo random", () => {
  const prng = new SeededPseudoRandom(1n);
  expect(prng.generate()).toBe(0.20176767697557807);
  expect(prng.generate()).toBe(0.4911644416861236);
  expect(prng.generate()).toBe(0.7924694607499987);
  expect(prng.generate()).toBe(0.0690375417470932);
});
