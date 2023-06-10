import type { BotClient } from './Client';
import type { BotEvents } from '../../typings/events';

export abstract class Event<K extends keyof BotEvents> {
  public constructor(
    public readonly bot: BotClient,
    public readonly name: K,
    public readonly once: boolean = false
  ) {}

  public abstract execute(...args: BotEvents[K]): unknown;
}
