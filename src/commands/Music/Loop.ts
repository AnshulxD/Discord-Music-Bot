import { activePlayer, userInVC } from '@bot/preconditions';
import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'loop',
  topName: 'music',
  description: 'Set the loop mode of the player',
  options: [
    {
      name: 'mode',
      description: 'The mode of the loop',
      required: true,
      type: DJS.ApplicationCommandOptionType.String,
      choices: [
        { name: 'Track', value: 'track' },
        { name: 'Queue', value: 'queue' },
        { name: 'Disable', value: 'disabled' }
      ]
    }
  ],
  preconditions: [userInVC, activePlayer]
})
export default class extends SubCommand {
  public override execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId)!;
    const mode = interaction.options.getString('mode', true) as 'track' | 'queue' | 'disabled';

    player.setLoopType(mode);

    return interaction.reply({ content: `Loop mode set to ${mode}`, ephemeral: true });
  }
}
