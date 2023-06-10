import { glob as _glob } from 'glob';
import { promisify } from 'util';

export const glob = promisify(_glob);
