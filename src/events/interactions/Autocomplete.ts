import { type BotClient, Event } from '@bot/base';
import type { SpotifyAlbum, SpotifyArtist, SpotifyPlaylist, SpotifyTrack } from 'meonglink';
import { getEmojis, textOverflow } from '@bot/util';
import type DJS from 'discord.js';
import { Playlists } from '@bot/models';

export default class extends Event<'interactionCreate'> {
  public constructor(client: BotClient) {
    super(client, 'interactionCreate');
  }

  private client = this.bot;

  public override async execute(interaction: DJS.Interaction<'cached'>) {
    if (!interaction.isAutocomplete() || !interaction.inCachedGuild()) return;
    const commandName = this.getCommandName(interaction);

    switch (commandName) {
      case 'music-playlist-load':
      case 'music-playlist-delete':
      case 'music-playlist-remove':
      case 'music-playlist-save': {
        const query = interaction.options.getString('playlist', true);
        const playlists = await Playlists.find({ ownerId: interaction.user.id });

        const results = playlists.filter(
          p => p._id === query || p.name.toLowerCase().includes(query.toLowerCase())
        );

        if (!results.length) {
          void interaction.respond([]);
          return;
        }

        void interaction.respond(
          results.map(p => ({
            name: `${p.name} (${p.tracks.length} tracks)`,
            value: p._id
          }))
        );
        return;
      }

      case 'music-play':
      case 'music-lyrics': {
        const query = interaction.options.getString('song', true);

        if (!query.length) {
          void interaction.respond([]);
          return;
        }

        // easter egg?
        if (query.toLowerCase() == '%put-random-song-here%') {
          void interaction.respond([]);
          return;
        }

        // check if query is url
        if (/^(ftp|http|https):\/\/[^ "]+$/.test(query)) {
          const spotifyRegex =
            /https?:\/\/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/;
          const deezerRegex = /https?:\/\/deezer\.page\.link\/([a-zA-Z0-9]+)/;
          const youtubeRegex = /https?:\/\/(www\.)?youtu(be\.com\/watch\?v=|\.be\/)([a-zA-Z0-9]+)/;

          if (spotifyRegex.test(query)) {
            const [, type, id] = query.match(spotifyRegex)!;

            if (type == 'track') {
              const res = await this.client.music.spotify!.getTrack(id!).catch(() => null);
              if (!res || res.error) {
                void interaction.respond([]);
                return;
              }

              const [track] = res.tracks;

              if (!track) {
                void interaction.respond([]);
                return;
              }

              void interaction.respond([
                {
                  name: `🎵 ${textOverflow(track.name, 30)} - ${textOverflow(
                    track.artists[0]!.name,
                    30
                  )}`,
                  value: track.external_urls.spotify
                }
              ]);
              return;
            } else if (type == 'album') {
              const res = await this.client.music.spotify!.getAlbumTracks(id!).catch(() => null);
              if (!res || res.error) {
                void interaction.respond([]);
                return;
              }

              const { tracks, ...album } = res;

              if (!tracks.length) {
                void interaction.respond([]);
                return;
              }

              void interaction.respond([
                {
                  name: `💽 ${textOverflow(album.name!, 30)} - ${textOverflow(
                    tracks[0]!.artists[0]!.name,
                    30
                  )}`,
                  value: query
                },
                ...tracks.slice(0, 19).map(track => ({
                  name: `🎵 ${textOverflow(track.name, 30)} - ${textOverflow(
                    track.artists[0]!.name,
                    30
                  )}`,
                  value: track.external_urls.spotify
                }))
              ]);
              return;
            } else if (type == 'playlist') {
              const res = await this.client.music.spotify!.getPlaylistTracks(id!).catch(() => null);
              if (!res || res.error) {
                void interaction.respond([]);
                return;
              }

              const { tracks, ...playlist } = res;

              if (!tracks.length) {
                void interaction.respond([]);
                return;
              }

              void interaction.respond([
                {
                  name: `📃 ${textOverflow(playlist.name!, 30)} - ${tracks.length} tracks`,
                  value: query
                },
                ...tracks.slice(0, 19).map(track => ({
                  name: `🎵 ${textOverflow(track.name, 30)} - ${textOverflow(
                    track.artists[0]!.name,
                    30
                  )}`,
                  value: track.external_urls.spotify
                }))
              ]);
              return;
            }
          }

          if (deezerRegex.test(query)) {
            const [, id] = query.match(deezerRegex)!;

            const track = await this.client.music.deezer!.getTrack(id!).catch(() => null);
            if (!track || track.error) {
              void interaction.respond([]);
              return;
            }

            void interaction.respond([
              {
                name: `🎵 ${textOverflow(track.name!, 30)} - ${textOverflow(
                  track.tracks[0]!.artist.name!,
                  30
                )}`,
                value: track.tracks[0]!.link
              }
            ]);
          }

          if (youtubeRegex.test(query)) {
            void interaction.respond([
              {
                name: '❌ Youtube is not supported',
                value: ''
              }
            ]);
            return;
          }
        }

        const tracks = await this.client.music.spotify?.searchSpotify(query, 'track', 5);
        const albums = await this.client.music.spotify?.searchSpotify(query, 'album', 5);
        const playlists = await this.client.music.spotify?.searchSpotify(query, 'playlist', 5);
        const artists = await this.client.music.spotify?.searchSpotify(query, 'artist', 5);

        const res = [
          tracks?.items.slice(0, 20).map(x => {
            if (!this.isTrack(x)) return undefined;
            return {
              name: `🎶 ${textOverflow(x.name, 30)} - ${textOverflow(x.artists[0]!.name, 30)}`,
              value: x.external_urls.spotify
            };
          }),
          albums?.items.slice(0, 20).map(x => {
            if (!this.isAlbum(x)) return undefined;
            return {
              name: `💽 ${textOverflow(x.name, 30)} - ${textOverflow(x.artists[0]!.name, 30)}`,
              value: x.external_urls.spotify
            };
          }),
          playlists?.items.slice(0, 20).map(x => {
            if (!this.isPlaylist(x)) return undefined;
            return {
              name: `📃 ${textOverflow(x.name, 30)} - ${
                x.tracks['total' as keyof typeof x.tracks]
              } tracks`,
              value: `https://open.spotify.com/playlist/${x.id}`
            };
          }),
          artists?.items.slice(0, 20).map(x => {
            if (!this.isArtist(x)) return undefined;
            return {
              name: `👤 ${textOverflow(x.name, 30)}`,
              value: x.external_urls.spotify
            };
          })
        ]
          .filter((x): x is Array<{ name: string; value: string }> => !!x)
          .flat();

        void interaction.respond(res);
        return;
      }

      default: {
        const focused = interaction.options.getFocused(true);

        switch (focused.name) {
          case 'emoji': {
            const unicodes = getEmojis(focused.value);

            if (unicodes?.length) {
              void interaction.respond(
                unicodes.map(u => ({
                  name: `${u} (Unicode)`,
                  value: u
                }))
              );
              return;
            }

            const emojis = await interaction.guild.emojis.fetch();
            void interaction.respond(
              emojis
                .filter(
                  e =>
                    e.name?.toLowerCase().includes(focused.value.toLowerCase()) ||
                    e.id.includes(focused.value)
                )
                .map(e => ({
                  name: `${e.name ?? e.id} ${e.animated ? '(animated)' : ''}`,
                  value: e.id
                }))
                .slice(0, 20)
            );
            return;
          }

          default:
            return;
        }
      }
    }
  }

  public getCommandName(interaction: DJS.AutocompleteInteraction<'cached' | 'raw'>) {
    let command: string;

    const { commandName } = interaction;
    const group = interaction.options.getSubcommandGroup(false);
    const subCommand = interaction.options.getSubcommand(false);

    if (subCommand) {
      if (group) {
        command = `${commandName}-${group}-${subCommand}`;
      } else {
        command = `${commandName}-${subCommand}`;
      }
    } else {
      command = commandName;
    }

    return command;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isTrack(data: Record<string, any>): data is SpotifyTrack {
    // eslint-disable-next-line dot-notation
    return data['type'] == 'track';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isAlbum(data: Record<string, any>): data is SpotifyAlbum {
    // eslint-disable-next-line dot-notation
    return data['type'] == 'album';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isPlaylist(data: Record<string, any>): data is SpotifyPlaylist {
    // eslint-disable-next-line dot-notation
    return data['type'] == 'playlist';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isArtist(data: Record<string, any>): data is SpotifyArtist {
    // eslint-disable-next-line dot-notation
    return data['type'] == 'artist';
  }
}
