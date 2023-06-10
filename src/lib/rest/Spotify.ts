import type { MeongLink, Player, SpotifyTrack } from 'meonglink';
import { fetch } from 'undici';

export class SpotifyService {
  public constructor(private manager: MeongLink) {
    if (typeof manager.spotify == 'undefined') throw new Error('Spotify is not enabled.');
  }

  private BASE_URL = 'https://api.spotify.com/v1';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private isTrack(data: any): data is SpotifyTrack {
    // eslint-disable-next-line dot-notation
    return data['type'] == 'track';
  }

  public async getRecommendation(player: Player) {
    if (![...player.queue.previous].reverse().find(x => x.uri.includes('open.spotify.com'))) {
      const track = await this.manager.spotify!.searchSpotify(
        player.queue.previous[player.queue.previous.length - 1]?.identifier ?? 'lofi',
        'track',
        1
      );
      if (!track?.items[0] || !this.isTrack(track.items[0])) throw new Error('No track found.');

      const params = new URLSearchParams({
        seed_tracks: track.items[0].id,
        limit: '1'
      });

      const res = await this.makeRequest<{ tracks: SpotifyTrack[] }>(
        `/recommendations?${params.toString()}`
      );

      return res.tracks[0];
    }

    const params = new URLSearchParams({
      seed_tracks: player.queue.previous
        .reverse()
        .filter(x => x.uri.includes('open.spotify.com'))
        .map(x => x.identifier)
        .slice(0, 5)
        .join(','),
      limit: '1'
    });

    const res = await this.makeRequest<{ tracks: SpotifyTrack[] }>(
      `/recommendations?${params.toString()}`
    );

    return res.tracks[0];
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = endpoint.startsWith('https://')
      ? endpoint
      : `${this.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const res: unknown = await fetch(
      `${url}${endpoint.includes('?') ? '&' : '?'}market=${this.manager.spotify!.options.market}`,
      {
        method: 'GET',
        headers: {
          Authorization: this.manager.spotify!.token
        }
      }
    ).then(x => x.json());

    return res as T;
  }
}
