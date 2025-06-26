import {inject} from "../_dependency_injection/dependency_container.ts";
import {InjectKey} from "../_dependency_injection/injection_keys.ts";
import {DiscordGuildMember} from "./discord_api.ts";
import {toShuffledArray} from "./array_shuffle.ts";

export async function membersInRoleNamed(roleName: string) {
    const discord = inject(InjectKey.DISCORD_API);
    const guildRole = await discord.getGuildRole(roleName);
    if (guildRole === null) {
        throw new Error("Could not find guild role named '" + roleName + "'");
    }
    const roleId = guildRole.id;

    const allMembers = await discord.getAllGuildMembers();
    return allMembers.filter((it) => it.roles.includes(roleId));
}

export type SubGroup = {
    name: string;
    members: DiscordGuildMember[];
};

export async function generateSubgroupMessage(
    roleName: string,
    maxSubgroupSize: number,
) {
    const groupNames = toShuffledArray(["A", "B", "C", "D", "E", "F"]);

    const membersInRole = await membersInRoleNamed(roleName);

    const groupCompositions = asGroupCompositions(membersInRole, maxSubgroupSize);
    // [ 4, 3, 3 ]

    return groupCompositions
        .reduce(toGroupIndexes, []) // [ [ 0, 1, 2, 3 ],  [ 4, 5, 6 ]   [ 7, 8, 9 ] ]
        .map(toSubGroup(groupNames, membersInRole)) // [ { name:"A", members: [...]}, ... ]
        .map(toSubgroupMessage)
        .join("\n\n");
}


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
