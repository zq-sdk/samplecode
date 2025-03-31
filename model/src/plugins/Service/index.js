import { ModelService } from './model.js';

const modelServer = new ModelService();

export default {
	install: (app, options) => {
		app.provide('modelServer', modelServer);
	}
};

export {
	modelServer
};