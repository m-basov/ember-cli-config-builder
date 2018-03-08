import fs from 'fs';
import path from 'path';
import { parse } from './ast-utils/common';
import adapters from './adapters';

const DEFAULT_CHARSET = 'utf-8';
const ADAPTERS = {...adapters};

function getAdapterName(configPath) {
  return path.parse(configPath).name;
}

function getAdapter(name) {
  let adapter = ADAPTERS[name];
  if (!adapter) throw new Error(`There are no adapter named: "${name}". You can register it with "#registerAdapter()" method.`);
  return adapter;
}

function parseFile(configPath, charset = DEFAULT_CHARSET) {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, charset, (err, content) => {
      if (err) reject(err);
      resolve(parse(content));
    });
  });
}

export default {
  async create(configPath, options: { charset?: string, adapter?: string } = {}) {
    let absolutePath = path.resolve(configPath);
    let charset = options.charset || DEFAULT_CHARSET;
    let ast = await parseFile(absolutePath, charset);

    let adapterName = options.adapter || getAdapterName(absolutePath);
    let Adapter = getAdapter(adapterName);

    return new Adapter({
      path: absolutePath,
      charset,
      ast
    });
  },

  registerAdapter(name: string, adapter) {
    ADAPTERS[name] = adapter;
    return ADAPTERS;
  }
}
