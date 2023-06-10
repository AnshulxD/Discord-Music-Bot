import { MeongLink, type VoicePacket } from 'meonglink';
import type { BotClient } from './Client';
import { SpotifyService } from '@bot/rest/Spotify';

export class Music extends MeongLink {
  public constructor(private client: BotClient) {
    super({
      nodes: [
        {
          host: process.env.LAVALINK_HOST,
          password: process.env.LAVALINK_AUTH,
          name: 'main',
          port: Number(process.env.LAVALINK_PORT),
          secure: process.env.LAVALINK_SECURE === 'true'
        }
      ],
      searchOptions: {
        appleMusic: {
          enabled: true,
          market: 'US'
        },
        spotify: {
          enabled: true,
          clientId: process.env.SPOTIFY_CLIENT_ID,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
          market: 'US',
          useISRC: true,
          failIfNotFoundWithISRC: true
        },
        deezer: {
          enabled: true
        },
        defaultPlatform: 'youtube music'
      },
      sendFunction: (guildId, payload) => this.client.guilds.cache.get(guildId)?.shard.send(payload)
    });
  }

  public services = {
    spotify: new SpotifyService(this)
  };

  public sendData(data: VoicePacket) {
    this.updateVoiceState(data);
  }
}
