import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { Pagination } from '@bot/util';
import { SubCommand } from '@bot/base';
import { getLyrics } from '@bot/rest';

@ApplyCommandData({
  name: 'lyrics',
  topName: 'music',
  description: 'Discover the lyrics of a song.',
  options: [
    {
      name: 'song',
      description: 'Provide a song title.',
      type: DJS.ApplicationCommandOptionType.String,
      required: false,
      autocomplete: true
    }
  ],
  preconditions: []
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    let song = interaction.options.getString('song');

    const player = this.client.music.players.get(interaction.guildId);
    if (player?.queue.current) {
      if (!song?.length) song = player.queue.current.uri;
    }

    if (!song?.length) {
      return interaction.reply({
        content: this.client.message('Debes proporcionar una canción.', 'error'),
        ephemeral: true
      });
    }

    const regexp =
      /(?:https:\/\/open\.spotify\.com\/|spotify:)(?:.+)?(track|playlist|album|artist)[/:]([A-Za-z0-9]+)/;

    const [, , id] = song.match(regexp) ?? [null, null, null];

    if (!id) {
      return interaction.reply({
        content: this.client.message('I only accept Spotify links.', 'error'),
        ephemeral: true
      });
    }

    const data = await this.client.music.spotify!.getTrack(id).catch(() => null);
    if (!data || data.error) {
      return interaction.reply({
        content: this.client.message('I did not find that song', 'error'),
        ephemeral: true
      });
    }

    const [track] = data.tracks;

    if (!track) {
      return interaction.reply({
        content: this.client.message('I did not find that song', 'error'),
        ephemeral: true
      });
    }

    const lyrics = await getLyrics({
      title: track.name,
      author: track.artists.map(x => x.name).join(', ')
    });
    if (!lyrics?.lyrics_body) {
      return interaction.reply({
        content: this.client.message('That song does not have lyrics on Musixmatch', 'error'),
        ephemeral: true
      });
    }

    const embeds = [];
    const chunks = lyrics.lyrics_body
      .split('\n\n')
      .map((lyrics, index) => ({ lyrics, index: index + 1 }));

    for (const chunk of chunks) {
      const embed = new DJS.EmbedBuilder({
        color: this.client.colors('info'),
        author: {
          name: `${track.name} - Lyrics`,
          iconURL: interaction.member.displayAvatarURL()
        },
        description: chunk.lyrics,
        footer: {
          text: `Page ${chunk.index} of ${chunks.length} ・ www.musixmatch.com`
        },
        thumbnail: {
          url: track.album.images.sort((a, b) => b.width - a.width)[0]!.url
        }
      });

      embeds.push(embed);
    }

    const pagination = new Pagination(embeds, this.client);
    return pagination.send(interaction, 'reply');
  }
}
