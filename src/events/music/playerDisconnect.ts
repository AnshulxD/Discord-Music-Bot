import { type BotClient, MusicEvent } from '@bot/base';
import type { Player } from 'meonglink';

export default class extends MusicEvent<'PlayerDisconnect'> {
  public constructor(client: BotClient) {
    super(client, 'PlayerDisconnect', false);
  }

  public override execute(player: Player) {
    return player.destroy();
  }
}
