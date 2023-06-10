import type { LyricsResponse, SoundCloudOEmbed } from 'typings/music';
import { type Track, Utils } from 'meonglink';
import axios from 'axios';

export async function getLyrics({ title, author }: { title: string; author: string }) {
  const base_url = 'https://apic-desktop.musixmatch.com/ws/1.1/macro.subtitles.get';

  const request: { data: LyricsResponse | null } = await axios
    .get(base_url, {
      headers: {
        Cookie: process.env.LYRICS_COOKIE
      },
      params: {
        format: 'json',
        q_track: title,
        q_artist: author.split(';')[0],
        user_language: 'es',
        tags: 'nowplaying',
        namespace: 'lyrics_synched',
        part: 'lyrics_crowd,user,lyrics_verified_by',
        f_subtitle_length_max_deviation: '1',
        subtitle_format: 'mxm',
        usertoken: '191231a5ea353397cca5b11ab22048db1f50f515a99e174078b148',
        signature: 'd9UI+QhfKS2hrs2BbiIKkBZykgs=',
        signature_protocol: 'sha1',
        app_id: 'web-desktop-app-v1.0'
      }
    })
    .catch(() => ({ data: null }));

  if (!request.data) return undefined;
  return request.data.message.body.macro_calls['track.lyrics.get'].message.body?.lyrics;
}

// check if url is valid image, then return base64 string
export async function imageURLToString(url: string) {
  try {
    const image = await axios.get(url, { responseType: 'arraybuffer' });
    if (!image.data || !image.headers['content-type']?.startsWith('image/')) return false;
    const [, format] = image.headers['content-type'].split('/');
    if (!format || !['png', 'jpg', 'jpeg'].includes(format)) return false;

    return Buffer.from(image.data as string, 'binary').toString('base64');
  } catch {
    return false;
  }
}

export async function implementSoundCloudThumbnail(track: Track, requester: unknown) {
  const res = await axios
    .get('https://soundcloud.com/oembed', {
      params: {
        format: 'json',
        url: track.uri
      }
    })
    .then(x => x.data as SoundCloudOEmbed | undefined)
    .catch(() => undefined);

  if (res) {
    const trackData = {
      track: track.track,
      info: {
        title: track.title,
        identifier: track.identifier,
        author: track.authors[0]!.name,
        length: track.duration,
        isSeekable: track.isSeekable,
        isStream: track.isStream,
        uri: track.uri,
        thumbnail: res.thumbnail_url || null
      }
    };
    return Utils.buildTrackFromRaw(trackData, requester, undefined);
  } else return track;
}
