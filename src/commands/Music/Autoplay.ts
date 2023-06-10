import { activePlayer, userInVC } from '@bot/preconditions';
import { ApplyCommandData } from '@bot/decorators';
import type DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'autoplay',
  topName: 'music',
  description: 'Toggle autoplay.',
  preconditions: [userInVC, activePlayer]
})
export default class extends SubCommand {
  public override execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId)!;

    const prevValue = player.getProp<boolean | undefined>('autoplay') ?? false;
    player.setProp('autoplay', !prevValue);

    return interaction.reply({
      content: this.client.message(
        `Autoplay has been ${!prevValue ? 'enabled' : 'disabled'}`,
        'success'
      )
    });
  }
}
