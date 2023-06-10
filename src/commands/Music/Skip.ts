import { activePlayer, userInVC } from '@bot/preconditions';
import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'skip',
  topName: 'music',
  description: 'Skip a song.',
  options: [
    {
      name: 'amount',
      description: 'The amount of songs to jump.',
      type: DJS.ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 1
    }
  ],
  preconditions: [userInVC, activePlayer]
})
export default class extends SubCommand {
  public override execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId!);
    if (!player) return void 0;

    const index = interaction.options.getInteger('amount') ?? 1;
    const track = player.queue[index - 1];

    if (!track) {
      return interaction.reply({
        content: this.client.message('There is not enough songs in queue', 'error'),
        ephemeral: true
      });
    }

    player.skip(index - 1);

    return interaction.reply({
      content: this.client.message(`Skipped **${track.title}**.`, 'success')
    });
  }
}
