import type { BotClient } from '@bot/base';
import type DJS from 'discord.js';

export async function ownerOnly(
  bot: BotClient,
  interaction: DJS.ChatInputCommandInteraction<'cached'>
) {
  if (interaction.user.id != interaction.guild.ownerId) {
    await interaction.reply({
      content: bot.message('Solo el propietario del servidor puede usar este comando.', 'error')
    });
    return false;
  }

  return true;
}
