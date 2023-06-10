import { Command, type CommandOptions } from './Command';
import DJS from 'discord.js';

export interface SubCommandOptions extends CommandOptions {
  topName: string;
  groupName?: string;
}

export abstract class SubCommand extends Command<SubCommandOptions> {
  public override get options(): SubCommandOptions & {
    type: DJS.ApplicationCommandOptionType.Subcommand;
  } {
    return {
      type: DJS.ApplicationCommandOptionType.Subcommand,
      ...this._options
    };
  }
}
