import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { Playlists } from '@bot/models';
import { SubCommand } from '@bot/base';
import { generateId } from '@bot/util';

@ApplyCommandData({
  name: 'create',
  groupName: 'playlist',
  topName: 'music',
  description: 'Create a playlist',
  options: [
    {
      name: 'name',
      description: 'The name of the playlist',
      type: DJS.ApplicationCommandOptionType.String,
      required: true,
      min_length: 1,
      max_length: 20
    },
    {
      name: 'description',
      description: 'Set a description for your playlist',
      type: DJS.ApplicationCommandOptionType.String,
      min_length: 1,
      max_length: 100
    }
  ]
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const playlists = await Playlists.find({ ownerId: interaction.user.id });

    if (playlists.length >= 10) {
      return interaction.reply({
        content: 'You can only save up to 10 playlists',
        ephemeral: true
      });
    }

    const name = interaction.options.getString('name', true);
    const description = interaction.options.getString('description', false);

    if (playlists.some(p => p.name === name)) {
      return interaction.reply({
        content: 'You already have a playlist with that name',
        ephemeral: true
      });
    }

    const playlist = new Playlists({
      _id: generateId({ idArray: playlists.map(p => p._id), length: 10 }),
      ownerId: interaction.user.id,
      name,
      description,
      tracks: []
    });

    await playlist.save();

    return interaction.reply({
      content: `Successfully saved the queue to **${name}**`,
      ephemeral: true
    });
  }
}
