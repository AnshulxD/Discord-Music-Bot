import { activePlayer, userInVC } from '@bot/preconditions';
import { ApplyCommandData } from '@bot/decorators';
import type DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'stop',
  topName: 'music',
  description: 'Stop the player without leaving the voice channel.',
  preconditions: [userInVC, activePlayer]
})
export default class extends SubCommand {
  public override execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId!);
    if (!player) return void 0;

    player.stop();

    return interaction.reply({
      content: this.client.message('Stopped the player.', 'success')
    });
  }
}
