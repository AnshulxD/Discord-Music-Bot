import { type BotClient, MusicEvent } from '@bot/base';
import type DJS from 'discord.js';
import type { Player } from 'meonglink';

export default class extends MusicEvent<'PlayerDestroy'> {
  public constructor(client: BotClient) {
    super(client, 'PlayerDestroy', false);
  }

  public override async execute(player: Player) {
    if (!player.textChannelId) return void 0;

    const channel = this.client.channels.cache.get(player.textChannelId);
    if (!channel?.isTextBased()) return void 0;

    const playingMessage = player.getProp<DJS.Message | undefined>('playingmsg');
    const joinedVcMessage = player.getProp<DJS.Message | undefined>('joinedvcmsg');

    if (joinedVcMessage?.deletable) {
      await joinedVcMessage.delete().catch(() => null);
    }

    if (playingMessage?.deletable) {
      await playingMessage.delete().catch(() => null);
    }

    return channel.send({
      content: '> `👋` I was disconnected from the voice channel!'
    });
  }
}
