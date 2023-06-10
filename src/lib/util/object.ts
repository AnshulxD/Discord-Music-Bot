import { isObject } from 'lodash';

export function assign(
  key: string,
  value: JSONType,
  global_object: Record<string | number | symbol, JSONType>,
  split_obj = '.'
) {
  const [...args] = key.split(split_obj);
  let object_data = global_object;

  for (const key of args) {
    if (key == args[args.length - 1]) {
      object_data[key as keyof typeof object_data] = value;
      break;
    }

    if (!Object.prototype.hasOwnProperty.call(object_data, key)) {
      object_data = object_data[key] = {};
    } else {
      object_data = !isObject(object_data[key])
        ? (object_data[key] = {})
        : (object_data[key] as Record<string, JSONType>);
    }
  }

  return global_object;
}

type JSONType = string | number | boolean | null | JSONType[] | { [key: string]: JSONType };

export function jsonify(object: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(object));
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
