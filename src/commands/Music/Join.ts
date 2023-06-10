import { ApplyCommandData } from '@bot/decorators';
import DJS from 'discord.js';
import { SubCommand } from '@bot/base';

@ApplyCommandData({
  name: 'join',
  topName: 'music',
  description: 'Join a voice channel.',
  options: [
    {
      name: 'channel',
      description: 'Channel to join',
      type: DJS.ApplicationCommandOptionType.Channel,
      channelTypes: [DJS.ChannelType.GuildVoice, DJS.ChannelType.GuildStageVoice]
    }
  ],
  bot_perms: ['Connect', 'Speak'],
  preconditions: []
})
export default class extends SubCommand {
  public override async execute(interaction: DJS.ChatInputCommandInteraction<'cached'>) {
    const prev_player = this.client.music.players.get(interaction.guildId);
    if (prev_player) {
      if (prev_player.state == 'Connected') {
        return interaction.reply({
          content: this.client.message('I am already in a voice channel!', 'error'),
          ephemeral: true
        });
      }
    }

    const vc = (interaction.options.getChannel('channel') || interaction.member.voice.channel) as
      | DJS.VoiceChannel
      | DJS.StageChannel
      | undefined;

    const me = interaction.guild.members.me || (await interaction.guild.members.fetchMe());
    if (me.voice.channel) {
      return interaction.reply({
        content: this.client.message('I am already in a voice channel!', 'error'),
        ephemeral: true
      });
    } else {
      if (!interaction.member.voice.channel && !vc) {
        return interaction.reply({
          content: this.client.message('Join or select a voice channel before!', 'error'),
          ephemeral: true
        });
      }

      if (vc && !vc.joinable) {
        return interaction.reply({
          content: this.client.message('I cannot join that voice channel!', 'error'),
          ephemeral: true
        });
      }

      const player = this.client.music.createPlayer({
        textChannelId: interaction.channelId,
        guildId: interaction.guildId,
        voiceChannelId: interaction.member.voice.channelId!
      });

      if (player.state != 'Connected') {
        player.connect();
      }

      setTimeout(async () => {
        if (player.state != 'Connected') {
          return void interaction.reply({
            content: this.client.message('I cannot join that voice channel!', 'error'),
            ephemeral: true
          });
        }

        if (me.voice.channel?.type == DJS.ChannelType.GuildStageVoice && me.voice.suppress) {
          try {
            await me.voice.setSuppressed(false);
          } catch (error) {
            return interaction.reply({
              content: this.client.message('I cannot speak in that voice channel!', 'error')
            });
          }
        }

        return interaction.reply({
          content: this.client.message('I have joined the voice channel!', 'success')
        });
      }, this.client.ws.ping * 2);

      return void 0;
    }
  }
}
