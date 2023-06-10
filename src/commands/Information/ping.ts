import { ApplyCommandData } from '@bot/decorators';
import type DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'ping',
  topName: 'info',
  description: 'Calculate the ping of the bot.'
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    await interaction.reply({
      content: this.client.message(`Pong! ${this.client.ws.ping}ms`, 'info')
    });
  }
}
