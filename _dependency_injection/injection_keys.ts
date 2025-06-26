import { key } from "npm:piqure";
import { Index } from "../lib/pseudo_random/index.ts";
import { DiscordApi } from "../lib/discord_api/index.ts";

export const InjectKey = {
  DISCORD_API: key<DiscordApi>("DiscordApi"),
  PSEUDO_RANDOM: key<Index>("PseudoRandom.ts"),
};
