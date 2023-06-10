import { BotClient } from '@bot/base';

function main() {
  Array.prototype.randomSort = function () {
    return this.sort(() => Math.random() - 0.5);
  };

  const bot = new BotClient();
  bot.handleErrors();
  void bot.start();
}

main();
