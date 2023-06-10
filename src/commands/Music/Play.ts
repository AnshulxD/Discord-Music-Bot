import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { SubCommand } from '@bot/base';
import { implementSoundCloudThumbnail } from '@bot/rest';
import { toDurationString } from '@bot/util';
import { userInVC } from '@bot/preconditions';

@ApplyCommandData({
  name: 'play',
  topName: 'music',
  description: 'Play a song.',
  options: [
    {
      name: 'song',
      description: 'The song to play.',
      type: DJS.ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true
    }
  ],
  bot_perms: ['Connect', 'Speak'],
  preconditions: [userInVC]
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const node = this.client.music.nodes.get('main');
    const youtubeRegex =
      /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:music\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

    const query = interaction.options.getString('song', true);

    if (query.match(youtubeRegex)) {
      return interaction.reply({
        content: ':x: I cannot play YouTube songs.',
        ephemeral: true
      });
    }

    if (!node || !node.connected) {
      node?.connect();
      void interaction.reply({
        content: ':x: The music node is not connected.',
        ephemeral: true
      });
      return void 0;
    }

    if (!interaction.channel || !interaction.member.voice.channel) return void 0;

    const player = this.client.music.players.get(interaction.guildId!);

    if (!player || player.state != 'Connected') {
      return void interaction.reply({
        content: `:x: You must use ${this.client.getCommandMD('music-join')} first!`,
        ephemeral: true
      });
    }

    if (player.queue.length >= 100) {
      return void interaction.reply({
        content: ':x: The queue cannot exceed 100 songs.',
        ephemeral: true
      });
    }

    await interaction.deferReply();
    const search = await player.search({ query, platform: 'spotify', requester: interaction.user });

    switch (search.loadType) {
      case 'LoadFailed':
      case 'NoMatches':
        void interaction.followUp({
          content: ':x: No matches found.'
        });
        break;

      case 'PlaylistLoaded': {
        if (!search.playlistInfo) {
          void interaction.followUp({
            content: ':x: No playlist info found.'
          });
          break;
        }

        if (!search.tracks[0]) {
          return void interaction.followUp({
            content: ':x: No valid tracks found.'
          });
        }

        if (search.tracks.some(t => t.isStream)) {
          search.tracks = search.tracks.filter(t => !t.isStream);
        }

        if (search.tracks.some(t => t.uri.match(youtubeRegex))) {
          return interaction.followUp({
            content: ':x: I cannot play YouTube songs.'
          });
        }

        search.tracks = await Promise.all(
          search.tracks.map(t => {
            if (t.uri.includes('soundcloud.com')) {
              return implementSoundCloudThumbnail(t, interaction.user);
            } else return t;
          })
        );

        player.queue.add(search.tracks.filter(t => !t.isStream));

        if (
          !player.isPlaying &&
          !player.isPaused &&
          player.queue.totalLength == search.tracks.length
        ) {
          await player.play();
        }

        void interaction.followUp({
          embeds: [
            {
              author: { name: '🎶 Playlist loaded!' },
              title: search.playlistInfo.name,
              description: `Songs: \`${search.tracks.length}\`\nDuration: \`${toDurationString(
                search.tracks.reduce((acc, cur) => acc + cur.duration, 0)
              )}\``,
              thumbnail: {
                url:
                  search.playlistInfo.thumbnail ||
                  search.tracks[0]?.thumbnail ||
                  'https://example.com'
              },
              color: DJS.Colors.Blurple
            }
          ]
        });

        break;
      }

      case 'SearchResult':
      case 'TrackLoaded': {
        if (!search.tracks[0]) {
          return interaction.followUp({
            content: ':x: No valid tracks found.'
          });
        }

        if (search.tracks[0].isStream) {
          return interaction.followUp({
            content: ':x: I cannot play streams.'
          });
        }

        if (search.tracks[0].uri.match(youtubeRegex)) {
          return interaction.followUp({
            content: ':x: I cannot play YouTube songs.'
          });
        }

        let [track] = search.tracks;

        const isSoundCloud =
          new URL(track.uri || 'https://www.google.com').hostname == 'soundcloud.com';

        if (isSoundCloud) {
          track = await implementSoundCloudThumbnail(track, interaction.user);
        }

        player.queue.add(track);
        if (!player.isPlaying && !player.isPaused && !player.queue.length) {
          await player.play();
        }

        void interaction.followUp({
          embeds: [
            {
              author: {
                name: `♪ ${track.title}`,
                icon_url: track.thumbnail,
                url: track.uri
              },
              color: DJS.Colors.Red
            }
          ]
        });

        return void 0;
      }
    }

    return void 0;
  }
}
