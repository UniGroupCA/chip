<h1 align="center">
<!-- Logo Credit: https://www.iconfinder.com/icons/1760341/chip_potato_chip_snack_icon
 -->
<img alt="chip" height="300" src="assets/chip.svg">
</h1>

<div align="center">
  <h3><code>chip</code></h3>
</div>
<div align="center">
   Easily manage microservices and infrastructure for local development 
</div>

## Developer Installation

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
