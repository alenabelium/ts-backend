import { Factory, Inject, Singleton } from "typescript-ioc";
import { ConfigurationService, DatabaseConnectOptions } from "./ConfigurationService";
import { Connection, createConnection } from "typeorm";
import { LoggerService } from "./LoggerService";
import { AttLogger, logException } from "../logger/logger";
import { sleepms } from "../utils/utils";


@Singleton
@Factory(() => new DatabaseService())
export class DatabaseService {

   @Inject
   configurationService: ConfigurationService;

   @Inject
   loggerService: LoggerService

   logger: AttLogger;

   // private logger!: AttLogger;

   _connection!: Connection;

   private databaseName = ""
   private connectionName: ""

   private options: DatabaseConnectOptions;

   public constructor() {
      this.options = this.configurationService.databaseConnectOptions;
      this.logger = this.loggerService.logger;
      this.connect()      
   }

   private async connect() {
      // Typeorm/ES6/Typescript issue with importing modules
      let path = this.databaseName;
      if (path !== "") path += "/";
      const entities = process.env.NODE_ENV === 'development'
         ? `src/entity/${path}**/*.ts`
         : `dist/src/entity/${path}**/*.js`

      const migrations = process.env.NODE_ENV === 'development'
         ? `src/migration/${this.databaseName}*.ts`
         : `dist/src/migration/${this.databaseName}*.js`

      this.logger.info(`^Yconnecting to database ^g^K${this.databaseName}^^ at ${this.options.host} on port ${this.options.port} as ${this.options.username} (^W${process.env.NODE_ENV}^^)`);
      this.logger.debug2(`entity: ${entities}`);

      let type: "mysql" | "mariadb" | "postgres" | "cockroachdb" | "sqlite" | "mssql" | "sap" | "oracle" | "cordova" | "nativescript" | "react-native" | "sqljs" | "mongodb" | "aurora-data-api" | "aurora-data-api-pg" | "expo" | "better-sqlite3" | "capacitor";

      type = "mysql";

      switch (this.options.type) {
         case "mysql": type = "mysql"; break;
         case "postgres": type = "postgres"; break;
         case "sqlite": type = "sqlite"; break;
      }

      let options;

      if (type === "sqlite") {
         options = {
            name: this.connectionName,
            type: type,
            database: this.options.database!,
            entities: [entities],
            migrations: [migrations],
            synchronize: true,
            logging: false,
         }

      }
      else {
         options = {
            name: this.connectionName,
            type: type,
            host: this.options.host,
            port: this.options.port,
            username: this.options.username,
            password: this.options.password,
            database: this.options.database,
            entities: [entities],
            migrations: [migrations],
            synchronize: true,
            migrationsRun: false,
            logging: false,
         }
      }

      createConnection(options).then(async conn => {
         this.logger.info(`^Gconnected to database ^g^K${this.databaseName}^^`);
         this._connection = await conn
         return
      }).catch(async e => {
         logException(e, `connect`);

         await sleepms(3000)
         this.connect()
      })
   }

   public get connection() {
      return this._connection;
   }

   public get manager() {
      if (this._connection) return this._connection.manager
      throw Error(`no database connection ${this.databaseName}`)
   }

   async waitForDBConnection() {
      while (true) {
         try {
            if (!this.connection) {
               this.logger.debug(`waiting for database connection ^b^K${this.databaseName}^^`);
               await sleepms(1000);
               continue;
            }
         }
         catch (error) {
            logException(error, `waitForDBConnection`);
            await sleepms(1000);
            continue;
         }
         break;
      }
   }
}