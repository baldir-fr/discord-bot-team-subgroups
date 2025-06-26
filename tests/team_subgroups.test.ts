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

async function generateSubgroupMessage(
  roleName: string,
  maxSubgroupSize: number,
) {
  const groupNames = ["A", "B", "C", "D", "E", "F"];

  const membersInRole = await membersInRoleNamed(roleName);

  const groupCompositions = asGroupCompositions(membersInRole, maxSubgroupSize);
  // [ 4, 3, 3 ]

  return groupCompositions
    .reduce(toGroupIndexes, []) // [ [ 0, 1, 2, 3 ],  [ 4, 5, 6 ]   [ 7, 8, 9 ] ]
    .map(toSubGroup(groupNames, membersInRole)) // [ { name:"A", members: [...]}, ... ]
    .map(toSubgroupMessage)
    .join("\n\n");
}

test(
  "generate message with randomized subgroup for members of a role",
  async () => {
    provide(InjectKey.DISCORD_API, new InMemoryDiscordApi());
    provide(InjectKey.PSEUDO_RANDOM, new SeededPseudoRandom(1n));

    const message = await generateSubgroupMessage("promo-a", 4);
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

/**
 * Reducer from an array of sizes to arrays of consecutive indexes beginning with 0.
 *
 * ```ts
 * import {expect} from "jsr:@std/expect";
 *
 * const groupCompositions = [
 *   3,
 *   4,
 *   2
 * ]
 *
 * const groupIndexes = groupCompositions.reduce(toGroupIndexes, []);
 *
 * expect(groupIndexes).toStrictEqual([
 *     [0, 1, 2],
 *     [3, 4, 5, 6],
 *     [7, 8]
 *   ])
 * ```
 * @param previousValue
 * @param currentGroupNumberOfMembers
 */
export function toGroupIndexes(
  previousValue: number[][],
  currentGroupNumberOfMembers: number,
) {
  let memberIndexInCurrentGroup = previousValue.flat().length;
  const group: number[] = [];
  for (let i = 0; i < currentGroupNumberOfMembers; i++) {
    group.push(memberIndexInCurrentGroup);
    memberIndexInCurrentGroup++;
  }
  return [...previousValue, group];
}

/**
 * ```ts
 * import {expect} from "jsr:@std/expect";
 *
 * const maxSubgroupSize = 4
 * const anArray=[
 *   "a", "b", "c", "d",
 *   "e", "f", "g",
 *   "h", "i", "j"
 *   ]
 *
 * const groupCompositions = asGroupCompositions(anArray,maxSubgroupSize)
 *
 * expect(groupCompositions).toStrictEqual([ 4, 3, 3 ])
 * ```
 * @return number of members per subgroups
 */
export function asGroupCompositions(
  anArray: unknown[],
  maxSubgroupSize: number,
): number[] {

  const subGroupSize = maxSubgroupSize - 1;
  const numberOfGroups = Math.floor(anArray.length / subGroupSize);

  let membersWithoutGroup = anArray.length % subGroupSize;
  const groupCompositions: number[] = [];
  for (let i = 0; i < numberOfGroups; i++) {
    let extraMember = 0;
    if (membersWithoutGroup > 0) {
      extraMember++;
      membersWithoutGroup--;
    }
    groupCompositions.push(subGroupSize + extraMember);
  }
  return groupCompositions;
}

export function toSubgroupMessage(subGroup: SubGroup) {
  const membersList = subGroup.members
    .map((member) => member.nick)
    .join("\n- ");

  return `Groupe "${subGroup.name}" :
- ${membersList}`;
}

export function toSubGroup(
  groupNames: string[],
  membersInRole: DiscordGuildMember[],
) {
  return (membersIndexes: number[], index: number) => ({
    name: groupNames[index],
    members: membersIndexes.map((memberIndex) => membersInRole[memberIndex]),
  });
}
