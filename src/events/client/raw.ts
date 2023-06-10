import { type BotClient, Event } from '@bot/base';
import type { VoicePacket } from 'meonglink';

export default class extends Event<'raw'> {
  public constructor(bot: BotClient) {
    super(bot, 'raw', false);
  }

  public override execute(data: VoicePacket) {
    this.bot.music.sendData(data);
  }
}
