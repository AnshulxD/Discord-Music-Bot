import { type BotClient, MusicEvent } from '@bot/base';
import type { Node } from 'meonglink';

export default class extends MusicEvent<'NodeConnect'> {
  public constructor(client: BotClient) {
    super(client, 'NodeConnect', false);
  }

  public override execute(node: Node) {
    console.log(`🎶 Node ${node.options.name} connected!`);
  }
}
