import { activePlayer, userInVC } from '@bot/preconditions';
import { ApplyCommandData } from '@bot/decorators';
import type DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'clearqueue',
  topName: 'music',
  description: 'Remove all the tracks after current track',
  preconditions: [userInVC, activePlayer]
})
export default class extends SubCommand {
  public override execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId)!;

    if (player.queue.length === 0) {
      return interaction.reply({ content: 'There is no track in queue', ephemeral: true });
    }

    player.queue.clear();
    return interaction.reply({ content: 'Queue cleared', ephemeral: true });
  }
}
