# JSON config

Using a JSON config with FogMachine allows for more advanced configurations.  This example contains all configurable params for reference purposes.  

```
{
  "port": 3030,
  "userinterface":"public",
  "secret": "b6j7j5e6u5g36ubn536uyn536unm5m67u5365vby435y54ymn",
  "database": "/path/to/fog.db"
  "albumArtDir": "/media/album-art",
  "media": "/path/to/media"
  "users": {
    "paul": {
      "password":"p@ssword"
    },
    "james": {
      "password":"qwerty"
    }
  },
  "ssl": {
    "key": "/path/to/key.pem",
    "cert": "/path/to/cert.pem"
  }
}
```

All these params have default values. Technically, an empty objects would be valid.  It's the same as running `fogmachine` without any config options

```
# This is valid
{ }
```