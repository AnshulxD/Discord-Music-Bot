import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { Playlists } from '@bot/models';
import { SubCommand } from '@bot/base';
import { userInVC } from '@bot/preconditions';

@ApplyCommandData({
  name: 'load',
  groupName: 'playlist',
  topName: 'music',
  description: 'Play your playlist',
  options: [
    {
      name: 'playlist',
      description: 'Choose a playlist',
      type: DJS.ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true
    }
  ],
  preconditions: [userInVC]
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

    if (!playlist.tracks.length) {
      return interaction.reply({
        content: 'This playlist is empty',
        ephemeral: true
      });
    }

    const player =
      this.client.music.players.get(interaction.guildId) ??
      this.client.music.createPlayer({
        guildId: interaction.guildId,
        voiceChannelId: interaction.member.voice.channelId!,
        textChannelId: interaction.channelId
      });

    if (player.state != 'Connected') {
      player.connect();
    }

    player.queue.add(
      playlist.tracks.slice(0, 100).map(s => ({ ...s, requester: interaction.user }))
    );

    if (
      !player.isPlaying &&
      !player.isPaused &&
      player.queue.totalLength == playlist.tracks.length
    ) {
      await player.play();
    }

    return interaction.reply({
      content: `> Playing **${playlist.name}**`
    });
  }
}
