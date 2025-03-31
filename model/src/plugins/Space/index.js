import { Space } from './descriptor.js';

export default {
	install: (app, options) => {
		const space = new Space(app);

		app.provide('space', space);
	}
};