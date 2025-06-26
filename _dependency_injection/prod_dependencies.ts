import { provide } from "./dependency_container.ts";
import { InjectKey } from "./injection_keys.ts";
import { SeededPseudoRandom } from "../lib/pseudo_random/index.ts";
import { InMemoryDiscordApi } from "../lib/discord_api/in_memory.ts";

export const provideProdDependencies = () => {
  provide(InjectKey.DISCORD_API, new InMemoryDiscordApi());
  provide(
    InjectKey.PSEUDO_RANDOM,
    new SeededPseudoRandom(BigInt(new Date().getTime())),
  );
};
