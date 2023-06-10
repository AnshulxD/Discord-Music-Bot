declare global {
  interface Array<T> {
    randomSort(): T[];
  }

  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: 'development' | 'production';

      readonly DISCORD_TOKEN: string;
      readonly MONGO_URI: string;
      readonly TEST_GUILD_ID: string;

      readonly LAVALINK_HOST: string;
      readonly LAVALINK_PORT: string;
      readonly LAVALINK_AUTH: string;
      readonly LAVALINK_SECURE: string;

      readonly SPOTIFY_CLIENT_ID: string;
      readonly SPOTIFY_CLIENT_SECRET: string;

      readonly LYRICS_COOKIE: string;
    }
  }
}

export {};
