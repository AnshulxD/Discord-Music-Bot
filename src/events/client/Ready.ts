import { type BotClient, Event } from '@bot/base';
import { Presence } from '@bot/constants';

export default class extends Event<'ready'> {
  public constructor(bot: BotClient) {
    super(bot, 'ready', true);
  }

  public override async execute() {
    console.log(`🤖 Logged in as ${this.bot.user.tag}!`);

    this.bot.user.setPresence(Presence[process.env.NODE_ENV]);
    this.bot.music.init(this.bot.user.id);

    for (const [, guild] of this.bot.guilds.cache) {
      await guild.fetch();
      console.log(`📚 ${guild.name} (${guild.id})`);
    }
    return void 0;
  }
}
