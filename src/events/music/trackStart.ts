import { type BotClient, MusicEvent } from '@bot/base';
import type { Player, Track } from 'meonglink';
import DJS from 'discord.js';
import { toDurationString } from '@bot/util';

export default class extends MusicEvent<'TrackStart'> {
  public constructor(client: BotClient) {
    super(client, 'TrackStart', false);
  }

  public override async execute(player: Player, track: Track) {
    if (!player.textChannelId) return void 0;

    const channel = this.client.channels.cache.get(player.textChannelId);
    if (!channel?.isTextBased()) return void 0;

    if (player.queue.previous.length >= 50) {
      player.queue.previous.splice(50, player.queue.previous.length - 50);
    }

    const m = await channel.send({
      embeds: [
        new DJS.EmbedBuilder({
          author: {
            name: 'Now Playing',
            iconURL: (track.requester as DJS.User | undefined)?.displayAvatarURL()
          },
          description: `[${track.title}](${track.uri})\n> Duration:${toDurationString(
            track.duration
          )}`,
          thumbnail: {
            url: track.thumbnail ?? 'https://example.com'
          },
          footer: {
            text: `Artist: ${track.authors[0]?.name ?? 'Unknown Author'}`,
            icon_url: track.authors[0]?.avatar
          }
        })
      ]
    });

    const prevPlaying = player.getProp<DJS.Message | undefined>('playingmsg');
    if (prevPlaying?.deletable) {
      await prevPlaying.delete().catch(() => null);
    }

    player.setProp('playingmsg', m);

    return void 0;
  }
}
