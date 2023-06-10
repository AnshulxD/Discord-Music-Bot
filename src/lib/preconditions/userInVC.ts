import type { BotClient } from '@bot/base';
import type DJS from 'discord.js';

export async function userInVC(client: BotClient, interaction: DJS.RepliableInteraction<'cached'>) {
  const me = interaction.guild.members.me || (await interaction.guild.members.fetchMe());
  if (me.voice.channel) {
    if (interaction.member.voice.channelId != me.voice.channelId) {
      void interaction.reply({
        content: client.message(`Join my voice channel: <#${me.voice.channelId}>`, 'error'),
        ephemeral: true
      });
      return false;
    }
    return true;
  } else {
    if (!interaction.member.voice.channel) {
      void interaction.reply({
        content: client.message('Join a voice channel first!', 'error'),
        ephemeral: true
      });
      return false;
    }
    return true;
  }
}
