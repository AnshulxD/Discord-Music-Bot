import { activePlayer, userInVC } from '@bot/preconditions';
import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { Playlists } from '@bot/models';
import { SubCommand } from '@bot/base';
import { generateId } from '@bot/util';

@ApplyCommandData({
  name: 'savequeue',
  topName: 'music',
  description: 'Save the current queue to a playlist',
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
      name: 'save-previous',
      description: 'Save tracks before the current track',
      type: DJS.ApplicationCommandOptionType.Boolean
    }
  ],
  preconditions: [userInVC, activePlayer]
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const player = this.client.music.players.get(interaction.guildId)!;

    if (player.queue.length === 0) {
      return interaction.reply({ content: 'There is no track in queue', ephemeral: true });
    }

    const playlists = await Playlists.find({ ownerId: interaction.user.id });

    if (playlists.length >= 10) {
      return interaction.reply({
        content: 'You can only save up to 10 playlists',
        ephemeral: true
      });
    }

    const name = interaction.options.getString('name', true);
    const savePrevious = interaction.options.getBoolean('save-previous', false) ?? false;

    if (playlists.some(p => p.name === name)) {
      return interaction.reply({
        content: 'You already have a playlist with that name',
        ephemeral: true
      });
    }

    const tracks = [player.queue.current!, ...player.queue.slice(0, 99)];

    if (savePrevious) {
      tracks.unshift(...player.queue.previous);
    }

    if (tracks.length > 100) {
      tracks.splice(100, tracks.length - 100);
    }

    const playlist = new Playlists({
      _id: generateId({ idArray: playlists.map(p => p._id), length: 10 }),
      ownerId: interaction.user.id,
      name,
      description: `Queue saved at ${new Date().toLocaleString()}`,
      tracks
    });

    await playlist.save();

    return interaction.reply({
      content: `Successfully saved ${tracks.length} tracks from the queue to **${name}**`,
      ephemeral: true
    });
  }
}
