import {DiscordGuildMember, InMemoryDiscordApi} from "../lib/discord_api.ts";
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
  provide(InjectKey.PSEUDO_RANDOM, new SeededPseudoRandom(1n));
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

type SubGroup = {
  name: string;
  members: DiscordGuildMember[];
};

async function generateSubgroupMessage(roleName: string, subgroupSize: number) {
  const groupNames = ["A", "B", "C", "D", "E", "F"];

  const membersInRole = await membersInRoleNamed(roleName);

  // Group size cannot be less than maxGroupSize-1
  // Ventilate 1 member in some groups

  const numberOfGroups = Math.floor(membersInRole.length / subgroupSize);

  // 3

  let membersWithoutGroup = membersInRole.length % subgroupSize;

  const groupCompositions: number[] = [];
  for (let i = 0; i < numberOfGroups; i++) {
    let extraMember = 0;
    if (membersWithoutGroup > 0) {
      extraMember++;
      membersWithoutGroup--;
    }
    groupCompositions.push(subgroupSize + extraMember);
  }
  // 3 + 1
  // 3
  // 3

  // [ 4, 3, 3 ]

  // current index
  let currentMemberIndex = 0;
  const groupsIndexes = groupCompositions.map((value) => {
    // [ 4, 3, 3 ]
    // 4 0 => [ 0, 1, 2, 3 ]
    // 3 1 => [
    // 3 2 =>

    const indexes: number[] = [];
    for (let i = 0; i < value; i++) {
      indexes.push(currentMemberIndex);
      currentMemberIndex++;
    }
    return indexes;
  });
  // [ [ 0, 1, 2, 3 ],  [ 4, 5, 6 ]   [ 7, 8, 9 ] ]

  const subgroups: SubGroup[] = groupsIndexes.map((membersIndexes, index) => ({
    name: groupNames[index],
    members: membersIndexes.map((mi) => membersInRole[mi]),
  }));

  const subgroupsMessages = subgroups
    .map((sg) => {
      const sgMembers = sg.members.map((m) => m.nick).join("\n- ");
      let s = `Groupe "${sg.name}" :
- ${sgMembers}`;
      return s;
    });

  return subgroupsMessages.join("\n\n");
}

test(
  "generate message with randomized subgroup for members of a role",
  async () => {
    provide(InjectKey.DISCORD_API, new InMemoryDiscordApi());
    provide(InjectKey.PSEUDO_RANDOM, new SeededPseudoRandom(1n));

    const message = await generateSubgroupMessage("promo-a", 3);
    expect(message).toBe(
      `Groupe "A" :
- Ada Lovelace
- Alistair Cockburn
- Jessica Kerr
- Daniel Terhorst-North

Groupe "B" :
- Felienne Hermans
- Grace Hopper
- Houleymatou Baldé

Groupe "C" :
- JB Rainsberger
- Kent Beck
- Niklaus Wirth`,
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
