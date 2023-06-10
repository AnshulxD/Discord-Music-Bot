// @ts-check
import type {
  Node,
  Player,
  Track,
  TrackEndEvent,
  TrackExceptionEvent,
  TrackStartEvent,
  TrackStuckEvent,
  WebSocketClosedEvent
} from 'meonglink';
import type DJS from 'discord.js';

export interface MusicEvents {
  nodeCreate: [node: Node];
  nodeDestroy: [node: Node];
  nodeConnect: [node: Node];
  nodeReconnect: [node: Node];
  nodeDisconnect: [node: Node, reason: ErelaDisconnectReason];
  nodeError: [node: Node, error: Error];
  nodeRaw: [payload: unknown];
  playerCreate: [player: Player];
  playerDestroy: [player: Player];
  queueEnd: [player: Player, track: Track, payload: TrackEndEvent];
  playerMove: [player: Player, initChannel: string, newChannel: string];
  playerDisconnect: [player: Player, oldChannel: string];
  trackStart: [player: Player, track: Track, payload: TrackStartEvent];
  trackEnd: [player: Player, track: Track, payload: TrackEndEvent];
  trackStuck: [player: Player, track: Track, payload: TrackStuckEvent];
  trackError: [player: Player, track: Track | UnresolvedTrack, payload: TrackExceptionEvent];
  socketClosed: [player: Player, payload: WebSocketClosedEvent];
}

interface ErelaDisconnectReason {
  code?: number;
  reason?: string;
}

export interface PlayerOptions {
  guild: DJS.Guild;
  channel: DJS.TextBasedChannel;
  voiceChannel: DJS.VoiceBasedChannel;
}

export interface SoundCloudOEmbed {
  version: number;
  type: 'rich';
  provider_name: 'SoundCloud';
  provider_url: 'https://soundcloud.com';
  height: number;
  width: `${number}%`;
  title: string;
  description: string;
  thumbnail_url?: string;
  html: string;
  author_name: string;
  s;
  author_url: string;
}

export interface LyricsResponse {
  message: {
    header: {
      status_code: number;
    };
    body: {
      macro_calls: {
        'track.lyrics.get': {
          message: {
            header: {
              status_code: number;
            };
            body?: {
              lyrics?: {
                lyrics_id: number;
                verified: 0 | 1;
                restricted: 0 | 1;
                instrumental: 0 | 1;
                explicit: 0 | 1;
                lyrics_body?: string;
                lyrics_language: string;
                lyrics_language_description: string;
                backlink_url: string;
                updated_time: string;
                lyrics_user: {
                  user: {
                    user_name: string;
                    user_profile_photo: string;
                    has_private_profile: 0 | 1;
                  };
                };
                lyrics_verified_by: unknown[];
              };
            };
          };
        };
      };
    };
  };
}
