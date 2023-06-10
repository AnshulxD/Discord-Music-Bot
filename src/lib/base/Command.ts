import type { BotClient } from './Client';
import type DJS from 'discord.js';

export interface CommandOptions {
  name: string;
  description: string;
  descriptionLocalizations?: DJS.LocalizationMap;
  bot_perms?: DJS.PermissionResolvable[];
  user_perms?: DJS.PermissionResolvable[];
  preconditions?: PreconditionFunction[];
  options?: DJS.ApplicationCommandOptionData[];
}

export abstract class Command<TOptions extends CommandOptions = CommandOptions> {
  public _options!: TOptions;
  public name: string;
  public bot_perms?: DJS.PermissionResolvable[];
  public user_perms?: DJS.PermissionResolvable[];
  public preconditions?: PreconditionFunction[];
  public client: BotClient;

  public constructor(bot: BotClient) {
    const options = this._options;
    this.client = bot;
    this.name = options.name;
    if (options.bot_perms) this.bot_perms = options.bot_perms;
    if (options.user_perms) this.user_perms = options.user_perms;
    if (options.preconditions) this.preconditions = options.preconditions;

    this.execute = this.execute.bind(this);
  }

  public get options(): TOptions {
    return this._options;
  }

  public abstract execute(
    interaction: DJS.ChatInputCommandInteraction<'cached'>
  ): CanBePromise<unknown>;
}

export type CanBePromise<T> = T | Promise<T>;

export type PreconditionFunction = (
  bot: BotClient,
  interaction: DJS.ChatInputCommandInteraction<'cached'>
) => boolean | Promise<boolean>;
