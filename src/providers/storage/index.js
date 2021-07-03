
import { storeJson as storeJsonBin, loadJson as loadJsonBin } from './json/jsonbin.js';
import { storeJson as storeJsonLocal, loadJson as loadJsonLocal } from './json/local.js';
import { storeJson as storeJsonDebug, loadJson as loadJsonDebug } from './json/debug.js';

import { storeImage as storeImageImgUr } from './image/imgur.js';
import { storeImage as storeImageLocal } from './image/local.js';
import { storeImage as storeImageDebug } from './image/debug.js';

const storeJson = {
  debug: storeJsonDebug,
  local: storeJsonLocal,
  jsonbin: storeJsonBin,
}

const loadJson = {
  debug: loadJsonDebug,
  local: loadJsonLocal,
  jsonbin: loadJsonBin,
}

const storeImage = {
  debug: storeImageDebug,
  local: storeImageLocal,
  imgur: storeImageImgUr,
}

const getStoreImage = () => storeImage[process.env.STORE_IMG] ? storeImage[process.env.STORE_IMG] : storeImage['debug'];
const getStoreJson = () => storeJson[process.env.STORE_JSON] ? storeJson[process.env.STORE_JSON] : storeJson['debug'];
const getLoadJson = () => loadJson[process.env.STORE_JSON] ? loadJson[process.env.STORE_JSON] : loadJson['debug'];

export { getStoreImage, getStoreJson, getLoadJson };