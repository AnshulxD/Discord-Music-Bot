import type {
  APIActionRowComponent,
  APIButtonComponentWithCustomId,
  APIEmbed,
  APIMessageActionRowComponent,
  ActionRow,
  CommandInteraction,
  EmbedBuilder,
  JSONEncodable,
  MessageActionRowComponent,
  MessageActionRowComponentBuilder,
  MessageComponentInteraction
} from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import type { BotClient } from '@bot/base';
import { emojis } from '@bot/constants';

export class Pagination {
  public constructor(private embeds: Array<APIEmbed | EmbedBuilder>, private bot: BotClient) {}

  private left_button: APIButtonComponentWithCustomId = {
    custom_id: 'pagination-left',
    emoji: { id: emojis.left },
    style: 2,
    type: 2
  };

  private right_button: APIButtonComponentWithCustomId = {
    custom_id: 'pagination-right',
    emoji: { id: emojis.right },
    style: 2,
    type: 2
  };

  private getActionRow(disabled: 'left' | 'right' | 'all' | 'none' = 'none') {
    const left = {
      ...this.left_button,
      disabled: disabled == 'left' || disabled == 'all'
    };
    const right = {
      ...this.right_button,
      disabled: disabled == 'right' || disabled == 'all'
    };

    return new ActionRowBuilder<MessageActionRowComponentBuilder>({
      components: [left, right]
    });
  }

  public async send<T extends ValidInteraction>(
    interaction: T,
    replyType: T extends CommandInteraction<'cached'> ? Exclude<ReplyType, 'update'> : ReplyType,
    restOfComponents: Array<
      ActionRowBuilder<MessageActionRowComponentBuilder> | ActionRow<MessageActionRowComponent>
    > = [],
    ephemeral = false,
    duplicateIfUserNotEqualToAuthor = true
  ) {
    if (!this.embeds[0]) {
      throw new Error('No embeds to send');
    }

    if (!interaction.isRepliable()) {
      throw new Error('Interaction is not repliable');
    }

    const hasMoreEmbeds = this.embeds.length > 1;

    const components: MessageComponents = [this.getActionRow(hasMoreEmbeds ? 'left' : 'all')];

    if (restOfComponents.length) components.push(...restOfComponents);

    if ('update' in interaction && replyType == 'update') {
      await interaction.update({
        embeds: [this.embeds[0]],
        components
      });
    } else {
      await interaction[replyType == 'followUp' ? 'followUp' : 'reply']({
        embeds: [this.embeds[0]],
        components,
        ephemeral
      });
    }

    if (!hasMoreEmbeds) return;
    const msg = await interaction.fetchReply();

    const collector = msg.createMessageComponentCollector({
      idle: 120000,
      filter: c => {
        if (![this.left_button.custom_id, this.right_button.custom_id].includes(c.customId)) {
          return false;
        }

        if (c.user.id != interaction.user.id) {
          if (duplicateIfUserNotEqualToAuthor) {
            const ephemeralPagination = new Pagination(this.embeds, this.bot);
            void ephemeralPagination.send(c, 'reply', [], true);
          } else {
            void c.reply({
              content: this.bot.message('No puedes interactuar con este menú', 'error'),
              ephemeral: true
            });
          }
          return false;
        } else return true;
      }
    });

    let index = 0;

    collector
      .on('collect', component => {
        if (component.customId === this.left_button.custom_id) {
          index = Math.max(0, index - 1);
        } else if (component.customId === this.right_button.custom_id) {
          index = Math.min(this.embeds.length - 1, index + 1);
        }

        const components: MessageComponents = [
          ...(index == 0
            ? [this.getActionRow('left')]
            : index == this.embeds.length - 1
            ? [this.getActionRow('right')]
            : [this.getActionRow('none')])
        ];

        if (restOfComponents.length) {
          components.push(...restOfComponents);
        }

        return void component
          .update({
            embeds: [this.embeds[index]!],
            components
          })
          .catch(() => void 0);
      })
      .once('end', () => {
        const components: MessageComponents = [this.getActionRow('all')];

        if (restOfComponents.length) {
          components.push(...restOfComponents);
        }

        void msg
          .edit({
            embeds: [this.embeds[index]!],
            components
          })
          .catch(() => void 0);
      });
  }
}

type ValidInteraction = CommandInteraction<'cached'> | MessageComponentInteraction<'cached'>;
type ReplyType = 'reply' | 'followUp' | 'update';
type MessageComponents = Array<JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>>;
