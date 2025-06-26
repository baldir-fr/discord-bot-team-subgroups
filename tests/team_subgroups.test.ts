import { createHandler, ServeHandlerInfo } from "$fresh/server.ts";
import manifest from "../fresh.gen.ts";
import config from "../fresh.config.ts";
import { expect } from "jsr:@std/expect";
import { provide } from "../_dependency_injection/dependency_container.ts";
import { InjectKey } from "../_dependency_injection/injection_keys.ts";
import { SeededPseudoRandom } from "../lib/pseudo_random/index.ts";
import { generateSubgroupMessage } from "../lib/team_subgroups.ts";
import { InMemoryDiscordApi } from "../lib/discord_api/in_memory.ts";

const test = Deno.test;
const acceptance_test = Deno.test;

const CONN_INFO: ServeHandlerInfo = <ServeHandlerInfo> {
  remoteAddr: { hostname: "127.0.0.1", port: 53496, transport: "tcp" },
};

acceptance_test("HTTP assert test.", async (t) => {
  const inMemoryDiscordApi = new InMemoryDiscordApi();
  provide(InjectKey.DISCORD_API, inMemoryDiscordApi);
  provide(InjectKey.PSEUDO_RANDOM, new SeededPseudoRandom(1n));
  const handler = await createHandler(manifest, config);

  await t.step("#2 POST /interactions", async () => {
    const formData = new FormData();
    // FIXME: change with real params
    formData.append("text", "Deno!");

    const req = new Request("http://127.0.0.1/api/interactions", {
      method: "POST",
      body: formData,
    });
    await handler(req, CONN_INFO);

    expect(inMemoryDiscordApi.sentMessages).toStrictEqual([
      {
        channelId: "foo",
        message: `Groupe "D" :
- JB Rainsberger
- Daniel Terhorst-North
- Alistair Cockburn
- Grace Hopper

Groupe "F" :
- Kent Beck
- Felienne Hermans
- Houleymatou Baldé

Groupe "A" :
- Niklaus Wirth
- Jessica Kerr
- Ada Lovelace`,
      },
    ]);
  });
});

test(
  "generate message with randomized subgroup for members of a role",
  async () => {
    provide(InjectKey.DISCORD_API, new InMemoryDiscordApi());
    provide(InjectKey.PSEUDO_RANDOM, new SeededPseudoRandom(1n));

    const message = await generateSubgroupMessage("promo-a", 4);
    expect(message).toBe(
      `Groupe "D" :
- JB Rainsberger
- Daniel Terhorst-North
- Alistair Cockburn
- Grace Hopper

Groupe "F" :
- Kent Beck
- Felienne Hermans
- Houleymatou Baldé

Groupe "A" :
- Niklaus Wirth
- Jessica Kerr
- Ada Lovelace`,
    );
  },
);

/*

- récupérer la liste d'utilisteurs à partir d'un rôle
	- https://discord.com/developers/docs/resources/guild
	- Récupérer infos d'un rôle : https://discord.com/developers/docs/resources/guild#get-guild-role
		- permet d'obtenir le snowflake du rôle
	- Lister tous les membres de la guilde
		- https://discord.com/developers/docs/resources/guild#list-guild-members
		- membre : https://discord.com/developers/docs/resources/guild#guild-member-object
			- roles (snowflakes)
- envoyer un message sur le chat
	- https://discord.com/developers/docs/resources/message#create-message
- commande /
	- https://discord.com/developers/docs/interactions/application-commands
		- autocomplete pour le nom des rôles de guilde (ex. promo-a, promo-b)
			- https://discord.com/developers/docs/interactions/application-commands#autocomplete
 */
