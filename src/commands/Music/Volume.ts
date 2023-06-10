import { activePlayer, userInVC } from '@bot/preconditions';
import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'volume',
  topName: 'music',
  description: 'Set the volume of the player',
  options: [
    {
      name: 'amount',
      description: 'The amount of volume',
      required: true,
      type: DJS.ApplicationCommandOptionType.Integer,
      min_value: 0,
      max_value: 100
    }
  ],
  preconditions: [userInVC, activePlayer]
})
export default class extends SubCommand {
  public override execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId)!;
    const amount = interaction.options.getInteger('amount', true);

    player.setVolume(amount);

    return interaction.reply({ content: `Volume set to ${amount}`, ephemeral: true });
  }
}
