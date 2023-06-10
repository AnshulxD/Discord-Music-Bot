import { type BotClient, type Command, SubCommand } from '@bot/base';
import DJS from 'discord.js';
import { Store } from './Store';
import { glob } from '@bot/util';
import { join } from 'path';

export class CommandStore extends Store<Command> {
  public constructor(bot: BotClient) {
    super(bot);
  }

  public async load(): Promise<void> {
    const files = await glob('./src/commands/**/*.ts');
    const subcommands: Record<string, SubCommand[]> = {};
    const commandGroups: Record<string, [string, SubCommand[]]> = {};

    const commandsToPush: DJS.ChatInputApplicationCommandData[] = [];

    for (const file of files) {
      delete require.cache[file];
      const command = (await this.import(join(process.cwd(), file))) as Command | SubCommand;

      let commandName = '';

      if (command instanceof SubCommand) {
        const { groupName } = command.options;
        const topLevelName = command.options.topName;

        if (groupName) {
          const prev = commandGroups[groupName]?.[1] ?? [];

          commandGroups[groupName] = [topLevelName, [...prev, command]];
          commandName = `${topLevelName}-${groupName}-${command.name}`;
        } else if (topLevelName) {
          const prevSubCommands = subcommands[topLevelName] ?? [];
          subcommands[topLevelName] = [...prevSubCommands, command];
          commandName = `${topLevelName}-${command.name}`;
        }
        console.log(`💻 SubCommand "${command.name}" loaded (${file.split('/').pop()!})`);
      } else {
        commandName = command.name;

        const data: DJS.ApplicationCommandData = {
          type: DJS.ApplicationCommandType.ChatInput,
          name: command.name,
          description: command.options.description,
          descriptionLocalizations: command.options.descriptionLocalizations,
          options: command.options.options ?? []
        };

        commandsToPush.push(data);
        console.log(`💻 Command "${command.name}" ready to push (${file.split('/').pop()!})`);
      }
      this.set(commandName, command);
    }

    for (const topLevelName in subcommands) {
      const cmds = subcommands[topLevelName]!;

      const data: DJS.ChatInputApplicationCommandData = {
        type: DJS.ApplicationCommandType.ChatInput,
        name: topLevelName,
        description: `${topLevelName} commands`,
        // @ts-expect-error 2322
        options: cmds.map(v => v.options)
      };

      commandsToPush.push(data);
      console.log(`💻 Top level command "${topLevelName}" ready to push`);
    }

    const groupCache = [];

    for (const groupName in commandGroups) {
      if (!(groupName in commandGroups)) continue;

      const [topLevelName, cmds] = commandGroups[groupName]!;

      const groupData = {
        type: DJS.ApplicationCommandOptionType.SubcommandGroup,
        name: groupName,
        description: `${groupName} sub commands`,
        options: cmds.map(v => v.options)
      };

      groupCache.push(groupData);

      if (commandsToPush.some(x => x.name == topLevelName)) {
        const index = commandsToPush.findIndex(x => x.name == topLevelName);
        // @ts-expect-error 2322
        commandsToPush[index]?.options?.push(groupData);
        continue;
      } else {
        const data: DJS.ChatInputApplicationCommandData = {
          type: DJS.ApplicationCommandType.ChatInput,
          name: topLevelName,
          description: `${topLevelName} commands`,
          // @ts-expect-error 2322
          options: [...groupCache]
        };

        commandsToPush.push(data);
        console.log(`💻 Command group "${topLevelName}" ready to push`);
      }
    }

    this.bot.once('ready', async () => {
      let uploaded: DJS.Collection<
        string,
        DJS.ApplicationCommand<{
          guild: DJS.GuildResolvable;
        }>
      >;

      if (process.env.NODE_ENV == 'development') {
        uploaded = await this.bot.application.commands.set(
          commandsToPush,
          process.env.TEST_GUILD_ID
        );

        console.log(`📤 Pushed ${uploaded.size} commands to test guild`);
      } else {
        uploaded = await this.bot.application.commands.set(commandsToPush);
        console.log(`📤 Pushed ${uploaded.size} commands globally`);
      }

      uploaded.forEach(c => {
        const cmds = this.stored.map((v, k) => [k, v] as const);
        const cmd = cmds.filter(v => v[0].split('-')[0] === c.name);

        if (cmd.length) {
          cmd.forEach(v => {
            this.bot.commandIds.set(v[0], `</${v[0].split('-').join(' ')}:${c.id}>`);
          });
        }
      });
    });
  }
}
