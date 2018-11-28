# FogMachine

## Install FogMachine From The Command Line

```shell
# Install From Git
git clone https://github.com/IrosTheBeggar/fogmachine.git
cd fogmachine
npm install --only=production
sudo npm link 
```

## Configure Fogmachine with a JSON file

* [JSON configuration docs page](docs/json_config.md)

```shell
# Brings up an interactive shell program to edit all things in the config
fogmachine --wizard /path/to/config.json
# Boots fogmachine from JSON config file
fogmachine -j /path/to/config.json
```

## Quick Start

There are a number of flags that can be used to test different fogmachine configurations

```shell
# change port (defaults to 3000)
fogmachine -p 4999
# the login system will be disabled if these values are not set
fogmachine -u username -x password
```

## The API

FogMachine uses a JSON based REST API.  [The API is documented here](docs/API.md)

## The Docs

[All the details about FogMachine are available in the docs folder](docs/)
