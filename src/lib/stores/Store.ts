import type { BotClient } from '@bot/base';
import { Collection } from 'discord.js';

export abstract class Store<T> {
  public constructor(public bot: BotClient) {}
  public stored = new Collection<string, T>();

  public get(key: string) {
    return this.stored.get(key);
  }

  public has(key: string) {
    return this.stored.has(key);
  }

  public find(fn: (value: T, key: string) => boolean) {
    return this.stored.find(fn);
  }

  public filter(fn: (value: T) => boolean) {
    return this.stored.filter(fn);
  }

  public all() {
    return this.stored.toJSON();
  }

  public set(key: string, value: T) {
    this.stored.set(key, value);
  }

  public async import(path: string) {
    // eslint-disable-next-line
    const data: { default: T } = await import(path);
    // eslint-disable-next-line
    return new (data.default as any)(this.bot) as T;
  }

  public get size() {
    return this.stored.size;
  }

  public abstract load(): void | Promise<void>;
}
