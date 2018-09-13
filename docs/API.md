# mStream API

mStream uses a REST based API for everything.  

All calls to the API are done through GET and POST requests.  Make sure to set your `Content-Type` header to `application/json` when making a POST request

If you have the user system enabled, make sure to attach your tokens to the `x-access-token` header of each request 

## Streaming Files

To stream a file you need a three pieces  of information:
- The filepath - this is the relative filepath as it would show up on your disk

To stream a file create a URL with the following structure
```
http://yourserver.com/media/path/to/song.mp3?token=XXXXXXXX
```


## File Explorer

[/dirparser](API/dirparser.md)

## Download

[/download](API/download.md)

## Login System & Authentication

mStream uses a token based authentication.  The token you get when logging in can be used to access the API endpoints and the music files.

Login Functions:

* [/login](API/login.md)
* [/ping](API/ping.md)
* /change-password - Coming Soon

Failure Endpoints:

* /login-failed
* /access-denied
* /guest-access-denied

The security layer is written as a plugin.  If you don't set the username and password on boot the plugin won't load and your server will be accessible by to anyone.  All API endpoints require a token to access if the login system is enabled.  Tokens can be passed in through the GET or POST param token.  Tokens can also be put in the request header under 'x-access-token'

If you want your tokens to work between reboots you can set the `secret` flag when booting by using `mstream -s YOUR_SECERT_STRING_HERE`.  The secret key is used to sign the tokens. If you do not set the secret key mStream will generate a random key on boot

## Admin

These endpoints are all behind the login system

* [/upload](API/download.md)
