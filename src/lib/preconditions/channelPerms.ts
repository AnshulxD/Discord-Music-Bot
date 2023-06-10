import type { ChannelType, GuildBasedChannel, PermissionsString } from 'discord.js';

export function checkChannelPermissions(
  channel: GuildBasedChannel,
  bot_permissions: PermissionsString[],
  type?: ChannelType[]
) {
  if (Array.isArray(type) && !type.includes(channel.type)) {
    return {
      error: true,
      reason: 'not_found'
    } as const;
  }

  if (!channel.permissionsFor(channel.client.user)?.has([bot_permissions])) {
    return {
      error: true,
      reason: 'no_perms'
    } as const;
  }

  return {
    error: false,
    reason: ''
  } as const;
}
