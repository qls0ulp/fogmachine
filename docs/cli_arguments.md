This document covers all the stable configuration options for mStream. 

Please note that all paths to folders and files must be absolute.  Relative paths will not work.  This is a compromise made early on to prevent bugs when running FogMachine on Windows.

## Set Port
Use the `-p` command to set the port.  Will default to 3000 if not set

```shell
mstream -p 5050
```

## Set Media Directory
Use the `-m` command to set the media directory.  This must be a full path.  Relative paths will not work!

Will default to current working directory if not set

```shell
mstream -m /path/to/music
```

## Album Art Directory

Use the `-I` command to set the album art directory.  All album art scraped from metadata will be stored here.  Make sure mStream has write access to this folder.

Defaults to the `image-cache` directory in the project if not set

```shell
mstream -I /path/to/album-art
```

## SSL

All you need to do is set the cert and key file and mStream will do the rest

```shell
mstream -c /path/to/cert.pem -k /path/to/key.pem
```

## User System

mStream can have a single user and guest.  If the user is not set (default behavior), mStream will permit unrestricted access to the system.

```shell
# Set User
mstream -u [username] -x [password]

mstream -u admin -x password
```

## Login Secret

You can set your login secret key  with the `-s` command
```
mstream -s /path/to/secret/file
```

If not set mStream will generate a random string to use as the secret key on boot.  If rebooted, the secret key will be regenerated and any previous keys will no longer work

## Database Path

mStream automatically makes a DB file in the folder of the directory it is run from.  You can change the database path with the `-d` command

```shell
mstream -d /path/to/mstream.db
```

## Choose the UI folder

mStream pulls serves the frontend files from the `public` folder by default.  You can change the frontend folder by using the `-i` command.  This is meant to be used for development to test help build a new frontend.  In the future mStream can also be given skins that can be changed by just downloading a folder and setting the path with this command.

```
mstream -i my-ui-folder
```

In order for UI folder to work, you will need three files:

* public.html
* admin.html

These files will be served by the `/` and `/admin` respectively.
