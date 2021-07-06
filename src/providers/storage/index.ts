
import { storeJson as storeJsonBin, loadJson as loadJsonBin } from './json/jsonbin';
import { storeJson as storeJsonLocal, loadJson as loadJsonLocal } from './json/local';
import { storeJson as storeJsonDebug, loadJson as loadJsonDebug } from './json/debug';

import { storeImage as storeImageImgUr } from './image/imgur';
import { storeImage as storeImageLocal } from './image/local';
import { storeImage as storeImageDebug } from './image/debug';

const storeJson = {
  'debug': storeJsonDebug,
  'local': storeJsonLocal,
  'jsonbin': storeJsonBin,
};

const loadJson = {
  'debug': loadJsonDebug,
  'local': loadJsonLocal,
  'jsonbin': loadJsonBin,
};

const storeImage = {
  'debug': storeImageDebug,
  'local': storeImageLocal,
  'imgur': storeImageImgUr,
};

const getStoreImage = () => {
  switch (process.env.STORE_IMG) {
    case 'jsonbin':
      return storeImage['imgur'];
    case 'local':
      return storeImage['local'];
    default:
      return storeImage['debug'];
  }
};

const getStoreJson = () => {
  switch (process.env.STORE_JSON) {
    case 'jsonbin':
      return storeJson['jsonbin'];
    case 'local':
      return storeJson['local'];
    default:
      return storeJson['debug'];
  }
};

const getLoadJson = () => {
  switch (process.env.STORE_JSON) {
    case 'jsonbin':
      return loadJson['jsonbin'];
    case 'local':
      return loadJson['local'];
    default:
      return loadJson['debug'];
  }
};

export { getStoreImage, getStoreJson, getLoadJson };