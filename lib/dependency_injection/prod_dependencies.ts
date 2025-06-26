import { provide } from "./container.ts";
import { InjectKey } from "./injection_keys.ts";
import { SeededPseudoRandom } from "../pseudo_random/index.ts";
import { InMemoryDiscordApi } from "../discord_api/in_memory.ts";

export const provideProdDependencies = () => {
  provide(InjectKey.DISCORD_API, new InMemoryDiscordApi());
  provide(
    InjectKey.PSEUDO_RANDOM,
    new SeededPseudoRandom(BigInt(new Date().getTime())),
  );
};
