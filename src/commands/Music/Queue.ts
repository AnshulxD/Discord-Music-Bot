import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { Pagination } from '@bot/util/pagination';
import { SubCommand } from '@bot/base';
import type { Track } from 'meonglink';
import _ from 'lodash';
import { activePlayer } from '@bot/preconditions';
import { toDurationString } from '@bot/util';

@ApplyCommandData({
  name: 'queue',
  topName: 'music',
  description: 'Show the queue.',
  options: [],
  preconditions: [activePlayer]
})
export default class extends SubCommand {
  public override execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId)!;

    const { queue } = player;
    const { current } = queue;

    if (!current || !queue.totalLength) {
      return interaction.reply({
        content: this.client.message('There is no songs in queue', 'error'),
        ephemeral: true
      });
    }

    const description = [
      `**[${current.title}](${current.uri})**`,
      `${current.authors.map(x => x.name).join(', ')} - ${toDurationString(current.duration || 0)}`,
      `Skip: ${this.client.getCommandMD('music-skip')}`,
      ''
    ];

    if (!queue.length && !queue.previous.length) {
      return interaction.reply({
        embeds: [
          new DJS.EmbedBuilder({
            author: {
              name: 'Server queue',
              iconURL: this.client.user.displayAvatarURL()
            },
            title: 'Now Playing',
            description: description.join('\n'),
            color: DJS.Colors.Blurple,
            thumbnail: { url: current.thumbnail || 'https://i.imgur.com/cCtlm5f.jpg' }
          })
        ]
      });
    }

    const { previous } = queue;
    const curr = { ...current, current: true };
    const full: Array<Track & { current?: true }> = previous.concat(curr, ...queue);

    const tracks = full.map((t, i) => ({ ...t, i }));
    const chunks = _.chunk(tracks, 10).map(chunk =>
      chunk.map(
        track =>
          `${track.current ? '⠀⠀⬐ *now playing*\n' : ''}\`${track.i + 1}\` [${track.title}](${
            track.uri
          }) - ${track.authors[0]?.name || 'Unknown'}${track.current ? '\n⠀⠀⬑ *now playing*' : ''}`
      )
    );

    const embeds = chunks.map(
      ch =>
        new DJS.EmbedBuilder({
          author: {
            name: 'Server queue',
            iconURL: this.client.user.displayAvatarURL()
          },
          title: 'Now playing',
          description: [...description, `**${queue.length}** songs left.`, ...ch].join('\n'),
          color: DJS.Colors.Blurple,
          thumbnail: { url: current.thumbnail || 'https://i.imgur.com/cCtlm5f.jpg' }
        })
    );

    const pagination = new Pagination(embeds, this.client);
    return pagination.send(interaction, 'reply');
  }
}
