import {InMemoryDiscordApi} from "../lib/discord_api.ts";
import {createHandler, ServeHandlerInfo} from "$fresh/server.ts";
import manifest from "../fresh.gen.ts";
import config from "../fresh.config.ts";
import {expect} from "jsr:@std/expect";
import {inject, provide,} from "../_dependency_injection/dependency_container.ts";
import {InjectKey} from "../_dependency_injection/injection_keys.ts";
import {SeededPseudoRandom} from "../lib/PseudoRandom.ts";

const test = Deno.test;
const acceptance_test = Deno.test;

const CONN_INFO: ServeHandlerInfo = <ServeHandlerInfo> {
  remoteAddr: { hostname: "127.0.0.1", port: 53496, transport: "tcp" },
};

acceptance_test("HTTP assert test.", async (t) => {
  provide(InjectKey.DISCORD_API, new InMemoryDiscordApi());
  // provide(InjectKey.RANDOMNESS, new ());
  const handler = await createHandler(manifest, config);

  await t.step("#2 POST /interactions", async () => {
    const formData = new FormData();
    formData.append("text", "Deno!");
    const req = new Request("http://127.0.0.1/api/interactions", {
      method: "POST",
      body: formData,
    });
    const resp = await handler(req, CONN_INFO);
    const text = await resp.text();
    expect(text).toContain(`Le sous-groupe "Foobar" sera composé de:
    - Foo Bar
    - Baz Buzz
    - Bizz Boos`);
  });
});

async function membersInRoleNamed(roleName: string) {
  const discord = inject(InjectKey.DISCORD_API);
  const guildRole = await discord.getGuildRole(roleName);
  if (guildRole === null) {
    throw new Error("Could not find guild role named '" + roleName + "'");
  }
  const roleId = guildRole.id;

  const allMembers = await discord.getAllGuildMembers();
  return allMembers.filter((it) => it.roles.includes(roleId));
}

async function generateMessage(roleName: string, maxGroupSize: number) {
  const membersInRole = await membersInRoleNamed(roleName);
  return membersInRole.map((it) => it.nick).join(", ");
}

test(
  "generate message with randomized subgroup for members of a role",
  async () => {
    provide(InjectKey.DISCORD_API, new InMemoryDiscordApi());
    provide(InjectKey.PSEUDO_RANDOM, new SeededPseudoRandom(1n));

    const message = await generateMessage("promo-a", 3);
    expect(message).toBe(
      "Ada Lovelace, Alistair Cockburn, Jessica Kerr, Daniel Terhorst-North, Felienne Hermans, Grace Hopper, Houleymatou Baldé, JB Rainsberger, Kent Beck, Niklaus Wirth",
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
