<h1 align="center">
<!-- Logo Credit: https://www.iconfinder.com/icons/1760341/chip_potato_chip_snack_icon
 -->
<img alt="chip" height="300" src="https://raw.githubusercontent.com/QDivision/chip/master/assets/chip.svg?sanitize=true">
</h1>

<div align="center">
  <h3><code>chip</code></h3>
</div>
<div align="center">
   Easily manage microservices and infrastructure for local development 
</div>

## Installation

Run the following command to install `chip` from NPM:

```
yarn global add @qdivision/chip
```

You can update your installation by running:

```
yarn global upgrade @qdivision/chip
```

## Development Installation

Run the following commands to clone the `chip` source code and set it up for development it on your machine.

```
git clone git@github.com:QDivision/chip.git
cd chip
yarn install
yarn build
yarn link
chip help
```

Note that you must run `yarn build` each time you make a change to the `.ts` source files in order for it to be picked up when you run `chip`.

If you are actively making changes to the source code you can run `yarn buildw` to start a process that will automatically detect changes to the source files and recompile the project for you. This is the fastest and easiest way to develop `chip`.

If chip was initially installed through Yarn and you want to switch to a development installation, you may need to run `yarn global unlink` in the chip directory and then rerun the above install, build, and link commands.

## Sample `chip.yml`

```yml
# Runs at start of every `install` and `run` subprocess
setup: |
  export sdkman_auto_answer=true
  source "$HOME/.sdkman/bin/sdkman-init.sh"

  export NVM_DIR="$HOME/.nvm"

  if [ -f "$NVM_DIR/nvm.sh" ]; then
      . "$NVM_DIR/nvm.sh"
  else
      . "/usr/local/opt/nvm/nvm.sh"
  fi

# Runs before `install` subprocesses for services
install: |
  echo "no" | sdk install java 11.0.2-open
  nvm install 10.16.3

# Runs at start of every service-level `install` and `run` subprocess,
# after `setup`
setup-service: |
  echo "no" | sdk use java 11.0.2-open
  nvm use 10.16.3

services:
  sandwich-ui:
    repo: 'git@github.com:QDivision/sandwich-ui.git'
    install: 'yarn install'
    run: 'yarn start'

  sandwich-api:
    repo: 'git@github.com:QDivision/sandwich-api.git'
    install: 'mvn clean package -D maven.test.skip=true'
    run: 'mvn spring-boot:run -D spring-boot.run.profiles=local'

  initializer:
    repo: 'git@github.com:QDivision/initializer.git'
    install: 'yarn install'
```

## Sample `secretchip.yml`

**WARNING:** The `secretchip.yml` file should not be committed to Git! Please be sure to add it to your `.gitignore`!

```yml
services:
  sandwich-ui:
    API_KEY: 'foo'

  sandwich-api:
    DB_USERNAME: 'qux'
    DB_PASSWORD: 'baz'

  initializer:
    DB_USERNAME: 'qux'
    DB_PASSWORD: 'baz'
```
