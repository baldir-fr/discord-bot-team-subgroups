import { Handlers } from "$fresh/server.ts";
import { inject } from "../../../_dependency_injection/container.ts";
import { InjectKey } from "../../../_dependency_injection/injection_keys.ts";
import { generateSubgroupMessage } from "../../../lib/team_subgroups.ts";
import {
  DiscordCreateMessageRequest,
  DiscordSnowflake,
} from "../../../lib/discord_api/index.ts";

export const handler: Handlers<string | null> = {
  async POST(_req, _ctx) {
    const discord = inject(InjectKey.DISCORD_API);

    // FIXME : get from params
    const message = await generateSubgroupMessage("promo-a", 4);

    const channelId: DiscordSnowflake = "foo";
    const messageRequest: DiscordCreateMessageRequest = { content: message };
    await discord.createMessage(channelId, messageRequest);

    return new Response();
  },
};
