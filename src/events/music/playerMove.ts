import { type BotClient, MusicEvent } from '@bot/base';
import DJS from 'discord.js';
import type { Player } from 'meonglink';

export default class extends MusicEvent<'PlayerMove'> {
  public constructor(client: BotClient) {
    super(client, 'PlayerMove', false);
  }

  public override execute(player: Player, oldChannel: string | undefined, newChannel: string) {
    if (!newChannel) {
      player
        .getProp<DJS.Message | undefined>('joinedvcmsg')
        ?.delete()
        .catch(() => null);

      player
        .getProp<DJS.Message | undefined>('playingmsg')
        ?.delete()
        .catch(() => null);

      player.destroy();
    } else {
      player.voiceChannelId = newChannel;
      if (player.isPaused) return;

      setTimeout(() => {
        player.pause(true);

        const vc = this.client.channels.cache.get(newChannel);
        if (vc instanceof DJS.StageChannel) {
          void vc.guild.members.me?.voice.setSuppressed(false).catch(() => null);
        }

        setTimeout(() => player.pause(false), this.client.ws.ping * 2);

        if (!player.textChannelId) return void 0;

        const channel = this.client.channels.cache.get(player.textChannelId);
        if (!channel?.isTextBased()) return void 0;

        return void channel.send({
          content: `> \`✨\` Moved from <#${oldChannel}> to <#${newChannel}>!`
        });
      }, this.client.ws.ping * 2);
    }
  }
}
