import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { SubCommand } from '@bot/base';
import { activePlayer } from '@bot/preconditions';
import { generate } from 'spotify-card';
import { toDurationString } from '@bot/util';

@ApplyCommandData({
  name: 'nowplaying',
  topName: 'music',
  description: 'Show the current playing song.',
  bot_perms: ['EmbedLinks', 'AttachFiles'],
  preconditions: [activePlayer]
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId!);
    if (!player) return void 0;

    const { current } = player.queue;

    if (!current) {
      return interaction.reply({
        content: this.client.message('I am not playing any song now.', 'error'),
        ephemeral: true
      });
    }

    const { title, thumbnail, authors, uri } = current;

    const card = await generate({
      songData: {
        title,
        artist: authors[0]?.name || 'Unknown artist',
        album: authors[0]?.name || 'Unknown artist',
        cover: thumbnail || 'https://i.imgur.com/e21YX4W.jpg'
      }
    });

    const embed = new DJS.EmbedBuilder({
      image: { url: 'attachment://card.png' },
      author: { name: '♪ Now playing' },
      title,
      url: uri,
      description: authors[0]?.name || 'Unknown artist',
      fields: [
        {
          name: 'Duration',
          value: `${toDurationString(player.position)}/${toDurationString(current.duration)}`,
          inline: true
        },
        {
          name: 'Requested by',
          value: current.requester.toString(),
          inline: true
        },
        {
          name: 'Tracks left',
          value: `${player.queue.length} tracks left`,
          inline: true
        }
      ],
      footer: {
        text: `🔊 Volume: ${player.volume}% ・ ✨ Filter: ${player.filter}`
      }
    });

    const attachment = new DJS.AttachmentBuilder(card, { name: 'card.png' });

    return interaction.reply({
      embeds: [embed],
      files: [attachment]
    });
  }
}
