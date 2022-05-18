# TS Backend

A template backend project using the library TSOA, a Typescript upgrade of express server that includes support for dependency injection. 
It also includes TypeORM.

## Getting started 

```
yarn
yarn dev
```

The project is based on [TSOA](https://tsoa-community.github.io/docs/). 


## API documentation

- check `http://localhost:9500/api-doc/` for testing.


#### Database configuration

Use MySQL Workbench. Connect to database as administrator. Right-click on empty space (bottom-left) below the listing of schemas. Choose `Create schema`.

- Schema name: `tsbackdb`
- Character set: utf8mb4

Create user `tsbackuser`
Choose `Users and Privileges`, add new user (username + password, by pressing `Add Account` button)
On user set in `Schema privileges` tab: `Add entry` button, select schema `tsbackdb`, set `Select all` (privileges), Apply.    

## Creation of the database on a server

```
sudo mysql
CREATE USER 'tsbackuser'@'localhost' IDENTIFIED BY '********';
create database tsbackdb
GRANT ALL PRIVILEGES ON tsbackdb.* TO 'tsbackuser'@'localhost';
FLUSH PRIVILEGES;
```

## Development process

If controllers or types are changed run 
```bash
yarn routes
```

If TypeORM entities are changed, run
```bash
yarn build
```

## Migrations

[Docs](https://typeorm.io/#/migrations) and [tutorial](https://betterprogramming.pub/typeorm-migrations-explained-fdb4f27cb1b3)

- Migrations are stored in folder `src/migration/`.
- To turn on migrations in file `src/services/databaseService.ts` set following: `synchronize: false` and `migrationsRun: true`.
- To create a migration user following command `typeorm migration:generate -n <nameOfMigrationFile>` and new migration template will be created in folder `src/migration/` .
  -  Fill in `up` function with desired migration. Fill in `down` function with reversed migration or just simply put `return`.
