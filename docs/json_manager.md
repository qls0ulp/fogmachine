Writing JSON config files by hand is tedious and leads to errors.  FogMachine comes with a command line tools to manage your config file.  

## Init

Use the `--init` flag to generate a json file or reset the file to an empty state

```
fogmachine --init config.json
```

## Set Media Path

```
fogmachine -j config.json --mediapath /path/to/media
```

## Add a user

You need to add a folder before adding users

```
fogmachine -j config.json --adduser
```

## Change Port

```
fogmachine -j config.json --editport
```

## Generate Secret

The secret is used to sign all JSON Web Tokens. If you don't have a secret, a random one will be generated on server boot and all previous JWTs will be invalidated.  Having a secret in the config will keep JWTs valid between server reboots

```
fogmachine -j config.json --makesecret
```

## Add SSL Key

```
fogmachine -j config.json --addkey /path/to/key
```

## Add SSL Cert

```
fogmachine -j config.json --addcert /path/to/cert
```

## Delete User

```
fogmachine -j config.json --removeuser
```
