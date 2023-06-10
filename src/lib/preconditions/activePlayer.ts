import type { BotClient } from '@bot/base';
import type DJS from 'discord.js';

export function activePlayer(client: BotClient, interaction: DJS.RepliableInteraction<'cached'>) {
  const player = client.music.players.get(interaction.guildId!);
  if (!player || player.state != 'Connected') {
    void interaction.reply({
      content: `:x: You must use ${client.getCommandMD('music-join')} first!`,
      ephemeral: true
    });
    return false;
  }
  return true;
}
