import type { BotClient } from './Client';
import type { MeongEvents } from 'meonglink';

export abstract class MusicEvent<K extends keyof MeongEvents> {
  public constructor(
    public readonly client: BotClient,
    public readonly name: K,
    public readonly once: boolean = false
  ) {}

  public abstract execute(...args: MeongEvents[K]): unknown;
}
