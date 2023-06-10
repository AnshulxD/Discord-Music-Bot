import { type BotClient, MusicEvent } from '@bot/base';
import type { Node } from 'meonglink';

export default class extends MusicEvent<'NodeError'> {
  public constructor(client: BotClient) {
    super(client, 'NodeError', false);
  }

  public override execute(node: Node, err: Error) {
    console.log(`🎶 Node ${node.options.name} has an error: ${err.message}`);
  }
}
