import { Schema, model } from 'mongoose';
import type { Track } from 'meonglink';

export const Playlists = model(
  'playlist',
  new Schema<DefPlaylist>({
    _id: String,
    ownerId: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    tracks: [Object]
  })
);

interface DefPlaylist {
  _id: string;
  ownerId: string;
  name: string;
  description?: string;
  tracks: Track[];
}
