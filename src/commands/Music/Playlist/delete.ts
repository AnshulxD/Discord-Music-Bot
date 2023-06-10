import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { Playlists } from '@bot/models';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'delete',
  groupName: 'playlist',
  topName: 'music',
  description: 'Delete a playlist',
  options: [
    {
      name: 'playlist',
      description: 'Choose a playlist',
      type: DJS.ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true
    }
  ]
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const id = interaction.options.getString('playlist', true);
    const playlist = await Playlists.findOne({ _id: id });

    if (!playlist) {
      return interaction.reply({
        content: 'You do not have a playlist with that id',
        ephemeral: true
      });
    }

    if (playlist.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: 'You do not own this playlist',
        ephemeral: true
      });
    }

    await playlist.delete();

    return interaction.reply({
      content: 'Successfully deleted the playlist',
      ephemeral: true
    });
  }
}
