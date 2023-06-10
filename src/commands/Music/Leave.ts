import { ApplyCommandData } from '@bot/decorators';
import type DJS from 'discord.js';
import { SubCommand } from '@bot/base';
import { userInVC } from '@bot/preconditions';

@ApplyCommandData({
  name: 'leave',
  topName: 'music',
  description: 'Leave the current voice channel.',
  bot_perms: [],
  preconditions: [userInVC]
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const me = interaction.guild.members.me || (await interaction.guild.members.fetchMe());
    if (!me.voice.channel) {
      return interaction.reply({
        content: this.client.message('I am not in a voice channel!', 'error'),
        ephemeral: true
      });
    } else {
      const player = this.client.music.players.get(interaction.guildId);

      if (!player) {
        return interaction.reply({
          content: this.client.message('I am not in a voice channel!', 'error'),
          ephemeral: true
        });
      }

      if (player.state == 'Connected') {
        player.destroy();
        return interaction.reply({
          content: this.client.message('Left the voice channel!', 'success')
        });
      }

      return interaction.reply({
        content: this.client.message('I am not in a voice channel!', 'error'),
        ephemeral: true
      });
    }
  }
}
