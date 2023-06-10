import { Client, Collection } from 'discord.js';
import { CommandStore, EventStore } from '@bot/stores';
import { colors, emojis, options } from '@bot/constants';
import { Music } from './Music';
import { connect } from 'mongoose';
import { getEmojis } from '@bot/util';

export class BotClient extends Client<true> {
  public constructor() {
    super(options);
  }

  public commands = new CommandStore(this);
  public events = new EventStore(this);
  public commandIds = new Collection<string, string>();

  public music = new Music(this);

  private isHandlingErrors = false;

  public async start() {
    console.log('🚀 Starting botClient...');

    await connect(process.env.MONGO_URI)
      .then(() => {
        console.log('☁ MongoDB connection established');
      })
      .catch(err => {
        console.error('☁ MongoDB connection failed', err);
      });

    void this.events.load();
    await this.commands.load();
    void this.login(process.env.DISCORD_TOKEN);
  }

  public message(content: string, messageType: 'error' | 'success' | 'info' | 'warn') {
    return `${emojis[messageType]} ${content}`;
  }

  public colors(messageType: 'error' | 'success' | 'info' | 'warn') {
    return colors[messageType];
  }

  public getCommandMD(key: string) {
    return this.commandIds.get(key) ?? `</${key}:1>`;
  }

  public handleErrors() {
    if (this.isHandlingErrors) return;

    process.on('unhandledRejection', error => {
      console.error(error);
    });

    process.on('uncaughtException', error => {
      console.error(error);
    });

    this.isHandlingErrors = true;
    return;
  }

  public getEmojiResolvable(emoji: string) {
    // check if emoji is a custom emoji
    const customEmoji = /<a?:\w+:(\d+)>/.exec(emoji);
    if (customEmoji?.[1]) {
      const discordEmoji = this.emojis.cache.get(customEmoji[1]);
      if (discordEmoji) return { id: discordEmoji.id };
    }

    // check if emoji is an id
    const idEmoji = /(\d+)/.exec(emoji);
    if (idEmoji?.[1]) {
      const discordEmoji = this.emojis.cache.get(idEmoji[1]);
      if (discordEmoji) return { id: discordEmoji.id };
    }

    // check if emoji is a unicode emoji
    const unicode = getEmojis(emoji);
    if (!unicode) return undefined;

    return { name: unicode[0] };
  }
}
