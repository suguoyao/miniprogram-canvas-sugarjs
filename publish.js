/**
 * Created by Sugar on 2020/6/1.
 */

const {execSync} = require('child_process');
const semver = require('semver');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const pkgPath = path.resolve(__dirname, './package.json');
const yargs = require('yargs');
const argv = yargs.argv;
const VERSION_TO_PUBLISH = argv.version

function publish(newVersion) {
  console.log(`开始发布npm包，发布版本号为：${newVersion} ...`);
  execSync(`npm publish --tag ${VERSION_TAG}`);

  // 更新package.json的版本，递增
  fs.writeFileSync(
    pkgPath,
    JSON.stringify(Object.assign(pkgObject, {
      version: VERSION_TO_PUBLISH,
    }), null, '\t')
  );
}

function run() {
  publish(VERSION_TO_PUBLISH)
}

run()
