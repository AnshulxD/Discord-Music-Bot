import DJS, { type PermissionsString } from 'discord.js';

export const options: DJS.ClientOptions = {
  intents: 3184383,
  allowedMentions: {
    parse: [],
    repliedUser: false,
    roles: [],
    users: []
  },
  failIfNotExists: false,
  shards: 'auto'
};

export const emojis = {
  success: '<:_:1000977479340654702>',
  error: '<:_:1000977481202937867>',
  info: '<:_:1000977482704490606>',
  warn: '<:_:1000977476480155690>',
  // music buttons
  play: '988409339851198495',
  pause: '861852632914198548',
  stop: '988409337837924422',
  skip: '988409335791124551',
  loop: '988409346637594744',
  loopOnce: '988409348826992680',
  shuffle: '988409354208313404',
  speakerHigh: '860133545544908802',
  speakerLow: '860133546278387763',
  wand: '875754473706893362',
  star: '859388127880544296',
  // arrows
  left: '860123643816312852',
  right: '859388126653186058',
  // utils
  empty: '<:_:1049510197992890478>',
  plus: '988409343743496232',
  minus: '859388129596014592',
  new: '964425853410893874',
  greenCircle: '892004694157848616',
  redCircle: '892004694120103946'
};

export const colors = {
  success: 0xcf9e6e,
  info: 0xcf9e6e,
  error: 0xcf9e6e,
  warn: 0xcf9e6e
};

export const TextBasedChannelTypes = [DJS.ChannelType.GuildText, DJS.ChannelType.GuildAnnouncement];
export const VoiceBasedChannelTypes = [DJS.ChannelType.GuildVoice, DJS.ChannelType.GuildStageVoice];

export const Permissions: Record<PermissionsString, string> = {
  AddReactions: 'Añadir reacciones',
  Administrator: 'Administrador',
  AttachFiles: 'Adjuntar archivos',
  BanMembers: 'Banear miembros',
  ChangeNickname: 'Cambiar apodo',
  Connect: 'Conectar',
  CreateInstantInvite: 'Crear invitación instantánea',
  CreatePrivateThreads: 'Crear hilos privados',
  CreatePublicThreads: 'Crear hilos públicos',
  DeafenMembers: 'Ensordecer miembros',
  EmbedLinks: 'Incrustar enlaces',
  KickMembers: 'Expulsar miembros',
  ManageChannels: 'Gestionar canales',
  ManageEmojisAndStickers: 'Gestionar emojis y stickers',
  ManageEvents: 'Gestionar eventos',
  ManageGuild: 'Gestionar servidor',
  ManageMessages: 'Gestionar mensajes',
  ManageNicknames: 'Gestionar apodos',
  ManageRoles: 'Gestionar roles',
  ManageThreads: 'Gestionar hilos',
  ManageWebhooks: 'Gestionar webhooks',
  MentionEveryone: 'Mencionar @everyone, @here y todos los roles',
  ModerateMembers: 'Aislar temporalmente a miembros',
  MoveMembers: 'Mover miembros',
  MuteMembers: 'Silenciar miembros',
  PrioritySpeaker: 'Prioridad de palabra',
  ReadMessageHistory: 'Leer el historial de mensajes',
  RequestToSpeak: 'Solicitud para hablar',
  SendMessages: 'Enviar mensajes',
  SendTTSMessages: 'Enviar mensajes de texto a voz',
  Speak: 'Hablar',
  Stream: 'Vídeo',
  UseApplicationCommands: 'Utilizar comandos de barra diagonal',
  UseExternalEmojis: 'Usar emojis externos',
  UseExternalStickers: 'Usar pegatinas externas',
  UseEmbeddedActivities: 'Usar Actividades',
  UseVAD: 'Usar actividad de voz',
  ViewAuditLog: 'Ver el registro de auditoría',
  ViewChannel: 'Leer mensajes',
  ViewGuildInsights: 'Ver información del servidor',
  SendMessagesInThreads: 'Enviar mensajes en hilos'
};

export const Presence = {
  development: {
    activities: [
      {
        name: 'in tests',
        type: DJS.ActivityType.Competing
      }
    ] as DJS.ActivitiesOptions[]
  },
  production: {
    status: 'idle' as const,
    activities: [
      {
        name: '/ping',
        type: DJS.ActivityType.Listening
      }
    ] as DJS.ActivitiesOptions[]
  }
};
