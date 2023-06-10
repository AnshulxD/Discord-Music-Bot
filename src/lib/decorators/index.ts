import type { SubCommand, SubCommandOptions } from '@bot/base';

export function ApplyCommandData(data: SubCommandOptions) {
  return (target: typeof SubCommand) => {
    target.prototype._options = data;
  };
}
