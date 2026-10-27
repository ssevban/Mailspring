import plugin from '../package.json';
import selfhost from '../../../selfhost-config.json';

export const PLUGIN_NAME = plugin.title;
export const PLUGIN_ID = plugin.name;
export const PLUGIN_URL = selfhost.serverUrl;
