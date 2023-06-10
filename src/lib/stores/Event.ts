import type { BotClient, Event, MusicEvent } from '@bot/base';
import { Store } from './Store';
import { glob } from '@bot/util';
import { join } from 'path';

export class EventStore extends Store<Event<'ready'>> {
  public constructor(bot: BotClient) {
    super(bot);
  }

  public override async load(): Promise<void> {
    void this.loadMusicEvents();

    const files = await glob('./src/events/!(music)/*.ts');
    for (const file of files) {
      // eslint-disable-next-line
      const { default: Ev } = await import(join(process.cwd(), file));
      // eslint-disable-next-line
      const event = new Ev(this.bot) as Event<'ready'>;
      // eslint-disable-next-line
      this.set(event.name, event);

      if (event.once) {
        this.bot.once(event.name, (...args) => void event.execute(...args));
      } else {
        this.bot.on(event.name, (...args) => void event.execute(...args));
      }

      console.log(`🔔 Listening to event "${event.name}" (${file.split('/').pop()!})`);
    }
  }

  public async loadMusicEvents(): Promise<void> {
    const files = await glob('./src/events/music/*.ts');
    for (const file of files) {
      // eslint-disable-next-line
      const { default: Event } = await import(join(process.cwd(), file));
      // eslint-disable-next-line
      const event = new Event(this.bot) as MusicEvent<'NodeConnect'>;

      if (event.once) {
        this.bot.music.once(event.name, (...args) => event.execute(...args));
      } else {
        this.bot.music.on(event.name, (...args) => event.execute(...args));
      }

      console.log(`🎧 Listening to music event "${event.name}" (${file.split('/').pop()!})`);
    }
  }
}
