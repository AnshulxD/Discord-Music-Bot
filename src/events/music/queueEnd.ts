import { type BotClient, MusicEvent } from '@bot/base';
import type { Player, Track } from 'meonglink';

export default class extends MusicEvent<'QueueEnd'> {
  public constructor(client: BotClient) {
    super(client, 'QueueEnd', false);
  }

  public override async execute(player: Player, track: Track) {
    if (player.getProp<boolean | undefined>('autoplay') ?? false) {
      if (!player.queue.previous.length) {
        player.queue.previous.push(track);
      }
      const fromApi = await this.client.music.services.spotify.getRecommendation(player);
      if (fromApi) {
        const track = await this.client.music.spotify!.search(
          player,
          fromApi.uri!,
          this.client.user,
          'track'
        );

        player.queue.add(track.tracks[0]!);
        return player.play();
      }
    }

    if (!player.textChannelId) return void 0;

    const channel = this.client.channels.cache.get(player.textChannelId);
    if (!channel?.isTextBased()) return void 0;

    return channel
      .send({
        content: '> `💽` Queue has ended!'
      })
      .catch(() => null);
  }
}
