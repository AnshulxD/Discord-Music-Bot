import type { ClientEvents } from 'discord.js';
import type { VoicePacket } from '@drgatoxd/erelajs';

export interface BotEvents extends ClientEvents {
  raw: [data: VoicePacket];
  [k: string]: [...unknown[]];
}
