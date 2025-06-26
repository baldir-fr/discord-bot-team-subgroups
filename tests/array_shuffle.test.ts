import {expect} from "jsr:@std/expect";
import {provide} from "../_dependency_injection/dependency_container.ts";
import {InjectKey} from "../_dependency_injection/injection_keys.ts";
import {SeededPseudoRandom} from "../lib/PseudoRandom.ts";
import {toShuffledArray} from "../lib/array_shuffle.ts";

Deno.test(
  "generate message with randomized subgroup for members of a role",
  () => {
    provide(InjectKey.PSEUDO_RANDOM, new SeededPseudoRandom(1n));

    const anArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    const shuffledArray = toShuffledArray(
      anArray,
    );

    // Use of seeded pseudo random generator makes this test deterministic
    expect(shuffledArray).toStrictEqual(
      ["10", "4", "8", "6", "1", "2", "3", "9", "7", "5"],
    );
    // Doesn't mutate original array
    expect(anArray).toStrictEqual(
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    );
  },
);
