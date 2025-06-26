import {
  DiscordApi,
  DiscordCreateMessageRequest,
  DiscordGuildMember,
  DiscordGuildRole,
  DiscordSnowflake,
} from "./index.ts";

export const FixtureIds = {
  ROLE_PROMO_A: "12D118F1-985D-4374-B3EE-329DFAC4F31F",
  ROLE_PROMO_B: "49AF75D8-28C2-4D72-8EF0-3A1C1E4DB640",

  MEMBER_A_ADA: "985BAE90-B7D1-431A-BE60-70DF3BDC6E56",
  MEMBER_A_GRACE: "75D97D2B-4097-4432-A63C-FCE4A52A48CF",
  MEMBER_A_HOULEYMATOU: "221FB022-9DA8-4DCA-BBB3-50210928A6B6",
  MEMBER_A_FELIENNE: "5649D4D7-93E4-4A83-A683-D088042691D4",
  MEMBER_A_JESSICA: "72118B05-D3E1-4ACB-B00F-3621052AAFA3",
  MEMBER_A_DANIEL: "E125B95A-9608-4EE6-912D-AF0CA861138D",
  MEMBER_A_JB: "FD1C8D4D-0EE6-427C-8557-836F666CD641",
  MEMBER_A_KENT: "ED8D51F1-EDB7-4F83-A75C-DA1C3225381A",
  MEMBER_A_NIKLAUS: "BAEB7BF3-5CB0-42DB-9375-14229D537F43",
  MEMBER_A_ALISTAIR: "B6E401E4-AA20-4F41-94DC-EA26F41C1DA8",

  MEMBER_B_EMILY: "51DDED67-1EB3-4CAF-90FC-C9B9193ACD30",
  MEMBER_B_HEDY: "1DC8423E-B8FD-4C29-9085-EF8FC38EF9CB",
  MEMBER_B_MARGARET: "7B1323CC-648D-4B13-92DF-35C4F98F2B08",
  MEMBER_B_CECILIA: "1DE90C9B-EBC0-45AF-A28B-258F66FCDC1D",
  MEMBER_B_DIANA: "D49E4D08-03D6-45B9-8CCB-7DB79CD9991A",
  MEMBER_B_RON: "1566B352-A90D-4163-9CD4-CB75D8416290",
  MEMBER_B_KEVLIN: "C954A0B8-2244-44BC-BD4E-507462C58BE2",
  MEMBER_B_GERALD: "FFE292D0-4294-445E-A00B-1A35A0BF0E57",
  MEMBER_B_DAVE: "EC63500E-C2C3-41A8-9C82-32E3E7DAF42F",
  MEMBER_B_WARD: "00B8E9AB-4A84-49EF-A1F1-4CC49F823EAE",
};

export class InMemoryDiscordApi implements DiscordApi {
  get sentMessages(): { channelId: string; message: string }[] {
    return this._sentMessages;
  }
  roles: DiscordGuildRole[] = [
    { id: FixtureIds.ROLE_PROMO_A, name: "promo-a" },
    { id: FixtureIds.ROLE_PROMO_B, name: "promo-b" },
  ];

  // deno-fmt-ignore
  members: DiscordGuildMember[] = [
        { id: FixtureIds.MEMBER_A_ADA, nick: "Ada Lovelace", roles: [FixtureIds.ROLE_PROMO_A] },
        { id: FixtureIds.MEMBER_A_ALISTAIR, nick: "Alistair Cockburn", roles: [FixtureIds.ROLE_PROMO_A] },
        { id: FixtureIds.MEMBER_A_JESSICA, nick: "Jessica Kerr", roles: [FixtureIds.ROLE_PROMO_A] },
        { id: FixtureIds.MEMBER_A_DANIEL, nick: "Daniel Terhorst-North", roles: [FixtureIds.ROLE_PROMO_A] },
        { id: FixtureIds.MEMBER_A_FELIENNE, nick: "Felienne Hermans", roles: [FixtureIds.ROLE_PROMO_A] },
        { id: FixtureIds.MEMBER_A_GRACE, nick: "Grace Hopper", roles: [FixtureIds.ROLE_PROMO_A] },
        { id: FixtureIds.MEMBER_A_HOULEYMATOU, nick: "Houleymatou Baldé", roles: [FixtureIds.ROLE_PROMO_A] },
        { id: FixtureIds.MEMBER_A_JB, nick: "JB Rainsberger", roles: [FixtureIds.ROLE_PROMO_A] },
        { id: FixtureIds.MEMBER_A_KENT, nick: "Kent Beck", roles: [FixtureIds.ROLE_PROMO_A] },
        { id: FixtureIds.MEMBER_A_NIKLAUS, nick: "Niklaus Wirth", roles: [FixtureIds.ROLE_PROMO_A] },

        { id: FixtureIds.MEMBER_B_CECILIA, nick: "Cecilia Bossard", roles: [FixtureIds.ROLE_PROMO_B] },
        { id: FixtureIds.MEMBER_B_DAVE, nick: `"Prag" Dave Thomas`, roles: [FixtureIds.ROLE_PROMO_B] },
        { id: FixtureIds.MEMBER_B_DIANA, nick: "Diana Montalion", roles: [FixtureIds.ROLE_PROMO_B] },
        { id: FixtureIds.MEMBER_B_EMILY, nick: "Emily Bache", roles: [FixtureIds.ROLE_PROMO_B] },
        { id: FixtureIds.MEMBER_B_GERALD, nick: "Gerald Jay Sussman", roles: [FixtureIds.ROLE_PROMO_B] },
        { id: FixtureIds.MEMBER_B_HEDY, nick: "Hedy Lamarr", roles: [FixtureIds.ROLE_PROMO_B] },
        { id: FixtureIds.MEMBER_B_KEVLIN, nick: "Kevlin Henney", roles: [FixtureIds.ROLE_PROMO_B] },
        { id: FixtureIds.MEMBER_B_MARGARET, nick: "Margaret Hamilton", roles: [FixtureIds.ROLE_PROMO_B] },
        { id: FixtureIds.MEMBER_B_RON, nick: "Ron Jeffries", roles: [FixtureIds.ROLE_PROMO_B] },
        { id: FixtureIds.MEMBER_B_WARD, nick: "Ward Cunningham", roles: [FixtureIds.ROLE_PROMO_B] },

    ];
  private _sentMessages: { channelId: string; message: string }[] = [];

  // deno-lint-ignore require-await
  async createMessage(
    channelId: DiscordSnowflake,
    messageRequest: DiscordCreateMessageRequest,
  ): Promise<void> {
    this._sentMessages.push({ channelId, message: messageRequest.content });
  }
  // deno-lint-ignore require-await
  async getAllGuildMembers(): Promise<Array<DiscordGuildMember>> {
    return this.members;
  }
  // deno-lint-ignore require-await
  async getGuildRole(roleName: string): Promise<DiscordGuildRole | null> {
    return this.roles.find((it) => it.name === roleName) ?? null;
  }
}
