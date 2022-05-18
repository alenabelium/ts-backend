#!/usr/bin/env node

import { app } from "./app";

import { iocContainer } from "./ioc";
import { ConfigurationService } from "./services/ConfigurationService";
import { LoggerService } from "./services/LoggerService";

const configurationService = iocContainer(null).get(ConfigurationService)

const logger = iocContainer(null).get(LoggerService).logger 

const server = app.listen(configurationService.webServerOptions.port, () =>
    // tslint:disable-next-line:no-console
    // console.log(`Server started listening at http://localhost:${ port }`)
    logger.info(`Server started listening at http://localhost:${configurationService.webServerOptions.port}`)
);






