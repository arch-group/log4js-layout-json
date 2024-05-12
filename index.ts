import util from "node:util";
import { isNativeError } from "node:util/types";

import type log4js from "log4js";

interface Output {
	time: Date; // ISO-8601 format
	category: string; // categoy name of log4js instance
	level: string; // log4js.Level.levelStr;
	msg: string; // data passed to log argument, formated using `util.format`
}

function formatter(
	event: log4js.LoggingEvent,
	config: Config,
): Output {
	let output = {
		time: event.startTime,
		category: event.categoryName,
		level: event.level.levelStr,
		msg: "",
	} as Output;

	if (config.withContext) {
		Object.assign(output, event.context);
	}

	let messages: Array<any> | undefined;
	if (Array.isArray(event.data)) {
		messages = event.data;
	} else {
		messages = [event.data];
	}

	messages = messages
		.filter((m) => isNativeError(m) || typeof m !== "object")
		.filter(Boolean);

	output.msg = util.format(...messages);

	return output;
}

export interface Config {
	/**
	 * Include context added using `log.addContext()`
	 * @default true
	 */
	withContext?: boolean;
}

const defaults: Config = {
	withContext: true,
};

export function jsonLayout(config?: Config): log4js.LayoutFunction {
	config = Object.assign({}, config, defaults);

	return function layout(event: log4js.LoggingEvent): string {
		const formated = formatter(event, config);

		const output = JSON.stringify(formated);
		return output;
	};
}

export default jsonLayout;
module.exports = jsonLayout;
