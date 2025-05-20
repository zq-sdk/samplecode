import { OfflineService } from './offline.js';

const offlineServer = new OfflineService();

export default {
	install: (app, options) => {
		app.provide('offlineServer', offlineServer);
	}
};

export {
	offlineServer,
};