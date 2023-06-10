import { type BotClient, Event } from '@bot/base';
import type DJS from 'discord.js';
import { Permissions } from '@bot/constants';

export default class extends Event<'interactionCreate'> {
  public constructor(bot: BotClient) {
    super(bot, 'interactionCreate');
  }

  public override async execute(interaction: DJS.Interaction<'cached'>) {
    if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;

    const commandName = this.getCommandName(interaction);
    const command = this.bot.commands.get(commandName);

    if (!command) {
      void interaction.reply({
        content: `No se encontró el comando </${commandName}:1>`,
        ephemeral: true
      });
      return;
    }

    if (command.preconditions?.length) {
      for (const precondition of command.preconditions) {
        const result = await precondition(this.bot, interaction);
        if (!result) return;
      }
    }

    if (!command.bot_perms) command.bot_perms = [];

    command.bot_perms.push('ViewChannel', 'ManageMessages', 'EmbedLinks', 'UseExternalEmojis');

    if (command.bot_perms.length) {
      const missingPerms = command.bot_perms
        .filter(p => !interaction.guild.members.me?.permissions.has(p))
        .map(p => `\`-\` ${Permissions[p as DJS.PermissionsString]}`);

      if (missingPerms.length) {
        void interaction.reply({
          content: this.bot.message(
            `Necesito los siguientes permisos:\n${missingPerms.join('\n')}`,
            'warn'
          ),
          ephemeral: true
        });
        return;
      }
    }

    if (command.user_perms?.length) {
      const missingPerms = command.user_perms
        .filter(p => !interaction.member.permissions.has(p))
        .map(p => `\`-\` ${Permissions[p as DJS.PermissionsString]}`);

      if (missingPerms.length) {
        void interaction.reply({
          content: this.bot.message(
            `Necesitas los siguientes permisos:\n${missingPerms.join('\n')}`,
            'warn'
          ),
          ephemeral: true
        });
        return;
      }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
    }

    return;
  }

  public getCommandName(interaction: DJS.ChatInputCommandInteraction<'cached' | 'raw'>) {
    let command: string;

    const { commandName } = interaction;
    const group = interaction.options.getSubcommandGroup(false);
    const subCommand = interaction.options.getSubcommand(false);

    if (subCommand) {
      if (group) {
        command = `${commandName}-${group}-${subCommand}`;
      } else {
        command = `${commandName}-${subCommand}`;
      }
    } else {
      command = commandName;
    }

    return command;
  }
}
