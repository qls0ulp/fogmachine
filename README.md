# FogMachine

## Install FogMachine From The Command Line

```shell
# Install From Git
git clone https://github.com/IrosTheBeggar/fogmachine.git
cd fogmachine
npm install --only=production
sudo npm link 
```

## Running & Configuring FogMachine

To test your installation, run the command `fogmachine`.  This will boot an FogMachine server on port 3000 and will use the current working directory as your music directory.  [Command line flags can be used to test different FogMachine configurations](docs/cli_arguments.md)

```shell
# change port (defaults to 3000)
fogmachine -p 4999

# setup user
# the login system will be disabled if these values are not set
fogmachine -u username -x password

# set media directory
# defaults to the current working directory if not set
fogmachine -m /path/to/music
```

## Configure fogmachine with a JSON file

* [JSON configuration docs page](docs/json_config.md)

Editing a JSON config by hand is tedious.  There's a number of special flags that will launch a prompt to guide you through editing the config

```shell
# Set a blank config
fogmachine --init config.json
# Set Media Folder
fogmachine -j config.json --mediapath /path/to/folder
# Add a User
fogmachine -j config.json --adduser
# Change the Port
fogmachine -j config.json --editport
# Generate a Secret
fogmachine -j config.json --makesecret
# Add SSL Key/Cert
fogmachine -j config.json --addkey <ssl key>
fogmachine -j config.json --addcert <ssl cert>

# Delete Users
fogmachine -j config.json --removeuser
```

## The API

FogMachine uses a JSON based REST API.  [The API is documented here](docs/API.md)

## The Docs

[All the details about FogMachine are available in the docs folder](docs/)
