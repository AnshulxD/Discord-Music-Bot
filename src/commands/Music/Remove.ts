import { activePlayer, userInVC } from '@bot/preconditions';
import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'remove',
  topName: 'music',
  description: 'Remove a song from the queue.',
  options: [
    {
      name: 'index',
      description: 'The index of the song to remove (from current song).',
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

    const index = interaction.options.getInteger('index', true) - 1;
    const track = player.queue[index];

    if (!track) {
      return interaction.reply({
        content: this.client.message('That song does not exist.', 'error'),
        ephemeral: true
      });
    }

    player.queue.remove(index);

    return interaction.reply({
      content: this.client.message(`Removed **${track.title}** from the queue.`, 'success')
    });
  }
}
