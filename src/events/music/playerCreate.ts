import { type BotClient, MusicEvent } from '@bot/base';
import type { Player } from 'meonglink';
import { StageChannel } from 'discord.js';

export default class extends MusicEvent<'PlayerCreate'> {
  public constructor(client: BotClient) {
    super(client, 'PlayerCreate', false);
  }

  public override async execute(player: Player) {
    if (!player.textChannelId) return void 0;

    const channel = this.client.channels.cache.get(player.textChannelId);
    if (!channel?.isTextBased()) return void 0;

    setTimeout(() => {
      const vc = this.client.channels.cache.get(player.voiceChannelId || '');
      if (vc instanceof StageChannel) {
        void vc.guild.members.me?.voice.setSuppressed(false).catch(() => null);
      }
    }, this.client.ws.ping * 2);

    const m = await channel
      .send({
        content: `> \`🎧\` Joined <#${player.voiceChannelId}> and bound to <#${player.textChannelId}>`
      })
      .catch(() => null);

    if (m) {
      player.setProp('joinedvcmsg', m);
    }

    return void 0;
  }
}
