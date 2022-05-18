# Server deployment

## Architecture

TODO

### Deployment

Deployment is carried out by the script `scripts/deploy-dev`. Detailed steps are in comments of the file.
Server must be properly prepared for script to work.

#### Initial preparation of server

- Start with Linux virtual machine.
- Create a user 'backend'. Deployment is done in home directory of this user. Set up ssh key login for this user and use 
- Install docker, docker compose. Docker is used for containers of CouchDB.
    - https://docs.docker.com/engine/install/ubuntu/
    - https://docs.docker.com/compose/install/ (see for Linux)
- Install node
    - See (Install an LTS Node): https://expeditedsecurity.com/blog/deploy-node-on-linux/
- Execute initial install.
- Create system service:
    - use third option, https://unix.stackexchange.com/questions/496982/restarting-systemd-service-only-as-a-specific-user
    - service configuration is `scripts/deploy-templates/di-gozd-dev.service`
    - for debugging, logs: https://unix.stackexchange.com/questions/225401/how-to-see-full-log-from-systemctl-status-service
    - `journalctl --user -u di-gozd-dev -r`

### Copied from https://unix.stackexchange.com/questions/496982/restarting-systemd-service-only-as-a-specific-user
A third option would be to make the service a user service, which does not need sudo or polkit configurations. This puts everything under the control of the user and only works if your actual service that is started with `/home/techops/publicapi start` can run without root privileges.

First you have to enable lingering for the user techops. This is needed to startup the user service on boot. As root execute:
```
loginctl enable-linger backend
```

Next you have to move the `systemd` unit file into the `backend` user directory. As user `backend` execute the commands as follows.

```
mkdir -p ~/.config/systemd/user
````

Copy `~/.config/systemd/user` `di-gozd-dev.service` to this folder.

Note that the `WantedBy` has to be `default.target` as there is no `multi-user.target` in the user context.

Now reload the configuration and enable the service. Again as user `backend` execute the commands.

```
systemctl --user daemon-reload
systemctl --user enable di-gozd-dev.service
systemctl --user start di-gozd-dev.service
```

In general you should place your systemd units in `/etc/systemd/system/` not directly in `/etc/systemd/system/multi-user.target.wants`. When you execute `systemctl enable publicapi.service` a symbolic link will be created in `etc/systemd/system/multi-user.target.wants` or whatever target is specified for that unit.

As already mentioned, if the service/process itself can be run without root privileges you should consider adding `User=techops` to your unit file to run the process with a non-privileged user account.


### TLS certificate HOWTO

* Run 
```
sudo certbot --webroot --webroot-path /var/www certonly -d db.af-coffee.com
````
* This generates certificates in `/etc/letsencrypt/db.af-coffee.com/live …``
* Copy configuration in `/etc/nginx/sites-available/coffee.matheo.si` to produce 
`/etc/nginx/sites-available/db.af-coffee.com`, make relevant updates, fix paths to certificates
* Add the new configuration with the soft link to `sites-enabled`
```
cd sites-enabled
sudo ln -s ../sites-available/foo.conf .
ls -l
```
* Restart nginx `sudo service ngnix restart`

```
sudo nginx -t 
sudo service nginx reload
```