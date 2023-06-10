import { activePlayer, userInVC } from '@bot/preconditions';
import { ApplyCommandData } from '@bot/decorators';
import type DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'pause',
  topName: 'music',
  description: 'Pause the player',
  preconditions: [userInVC, activePlayer]
})
export default class extends SubCommand {
  public override execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId!);
    if (!player) return void 0;

    if (player.isPaused) {
      return interaction.reply({
        content: this.client.message('The player is already paused.', 'error'),
        ephemeral: true
      });
    }

    player.pause(true);

    return interaction.reply({
      content: this.client.message('Paused the player.', 'success')
    });
  }
}
