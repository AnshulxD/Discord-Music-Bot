import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { Playlists } from '@bot/models';
import { SubCommand } from '@bot/base';
import { activePlayer } from '@bot/preconditions';

@ApplyCommandData({
  name: 'save',
  groupName: 'playlist',
  topName: 'music',
  description: 'Save the current track to a playlist',
  options: [
    {
      name: 'playlist',
      description: 'Choose a playlist',
      type: DJS.ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true
    }
  ],
  preconditions: [activePlayer]
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const playlists = await Playlists.find({ ownerId: interaction.user.id });

    const id = interaction.options.getString('playlist', true);
    const playlist = playlists.find(p => p._id === id);

    if (!playlist) {
      return interaction.reply({
        content: 'You do not have a playlist with that id',
        ephemeral: true
      });
    }

    const player = this.client.music.players.get(interaction.guildId!)!;
    const track = player.queue.current;

    if (!track) {
      return interaction.reply({ content: 'There is no track playing', ephemeral: true });
    }

    if (playlist.tracks.some(t => t.track === track.track)) {
      return interaction.reply({
        content: 'This playlist already has that track',
        ephemeral: true
      });
    }

    if (playlist.tracks.length >= 100) {
      return interaction.reply({
        content: 'You can only save up to 100 tracks per playlist',
        ephemeral: true
      });
    }

    playlist.tracks.push(track);
    await playlist.save();

    return interaction.reply({
      content: `Added [${track.title}](${track.uri}) to **${playlist.name}**`,
      ephemeral: true
    });
  }
}
