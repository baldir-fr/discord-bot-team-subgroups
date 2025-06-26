export interface DiscordApi {
  getGuildRole(roleName: string): Promise<DiscordGuildRole | null>;
  getAllGuildMembers(): Promise<Array<DiscordGuildMember>>;
  createMessage(
    channelId: DiscordSnowflake,
    message: DiscordCreateMessageRequest,
  ): Promise<void>;
}

// ============================================================================
// Type definitions
// ============================================================================

/**
 * @see https://discord.com/developers/docs/resources/message#create-message-jsonform-params
 */
export type DiscordCreateMessageRequest = {
  content: string;
};

export type DiscordSnowflake = string;
/**
 * @see https://discord.com/developers/docs/topics/permissions#role-object
 */
export type DiscordGuildRole = {
  id: DiscordSnowflake;
  name: string;
};

/**
 * @see https://discord.com/developers/docs/resources/guild#guild-member-object
 */
export type DiscordGuildMember = {
  id: DiscordSnowflake;
  nick: string;
  roles: DiscordSnowflake[];
};

export enum DiscordApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  /** 	Any integer between -2^53 and 2^53 */
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  /** 	Includes all channel types + categories */
  CHANNEL = 7,
  ROLE = 8,
  /** 	Includes users and roles */
  MENTIONABLE = 9,
  /** 	Any double between -2^53 and 2^53 */
  NUMBER = 10,
  /** 	attachment object */
  ATTACHMENT = 11,
}
/** @see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure */
export type DiscordApplicationCommandOption = {
  type: DiscordApplicationCommandOptionType;
  /** 	1-32 character name
   * @see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-naming */
  name: string;
  /** 	1-100 character description */
  description: string;
};

export type DiscordApplicationCommand = {
  id: DiscordSnowflake;
  name: string;
  /** *	array of command options	Parameters for the command, max of 25	CHAT_INPUT. */
  options: DiscordApplicationCommandOption;
  type: DiscordApplicationCommandType;
  /** ID of the parent application. */
  application_id: DiscordSnowflake;
  /** Guild ID of the command, if not global. */
  guild_id: DiscordSnowflake;
  /**
   * Description for CHAT_INPUT commands, 1-100 characters.
   * Empty string for USER and MESSAGE commands .
   */
  description: string;
};

/** @see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-types */
export enum DiscordApplicationCommandType {
  /** Slash commands; a text-based command that shows up when a user types. */
  CHAT_INPUT = 1,
  /** A UI-based command that shows up when you right click or tap on a user. */
  USER = 2,
  /** A UI-based command that shows up when you right click or tap on a message. */
  MESSAGE = 3,
  /** A UI-based command that represents the primary way to invoke an app's Activity/ */
  PRIMARY_ENTRY_POINT = 4,
}
