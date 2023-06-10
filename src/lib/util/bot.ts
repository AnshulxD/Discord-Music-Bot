import { ActionRowBuilder, TextInputBuilder } from 'discord.js';

export class ModalTextInput extends TextInputBuilder {
  public build() {
    return new ActionRowBuilder<TextInputBuilder>().setComponents(TextInputBuilder.from(this));
  }
}
