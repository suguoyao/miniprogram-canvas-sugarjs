/**
 * Created by Sugar on 2020/6/1.
 */

const {execSync} = require('child_process')
const semver = require('semver')
const fs = require('fs')
const path = require('path')
const pkgPath = path.resolve(__dirname, './package.json')
const pkgText = fs.readFileSync(pkgPath)
const pkgObject = JSON.parse(pkgText)
const yargs = require('yargs')
const argv = yargs.alias('s', 'semver').argv
const SEMVER_TYPE = argv.s ? argv.s : 3 // 默认为patch

function getCurrentPublishedVersion() {
  return execSync(`npm view ${pkgObject.name} dist-tags.latest`).toString()
}

function getSemverType(type) {
  if (+type === 1) {
    return 'major'
  }
  if (+type === 2) {
    return 'minor'
  }
  if (+type === 3) {
    return 'patch'
  }
}

function updatePackageToGit(version) {
  execSync(`git checkout master`)
  execSync(`git add package.json`)
  execSync(`git commit -m "更新版本号到${version}"`)
  execSync(`git push -u origin master`)
  console.log('推送package.json更新到git 成功')
}

function writePackageJson(version) {
  // 更新package.json
  fs.writeFileSync(
    pkgPath,
    JSON.stringify(Object.assign(pkgObject, {
      version: version,
    }), null, 2)
  )
}

function buildJS() {
  execSync(`yarn clean`)
  execSync(`yarn dist`)
}

function publish() {
  const currentPublishedVersion = getCurrentPublishedVersion()
  const toPublishVersion = semver.inc(currentPublishedVersion, getSemverType(SEMVER_TYPE))
  console.log(`开始编译打包JS`)
  buildJS()
  console.log(`编译打包成功，已生成miniprogram_dist文件夹`)
  console.log(`当前线上${pkgObject.name}包的版本号为：${currentPublishedVersion}`)
  console.log(`开始发布npm包... 发布版本号为：${toPublishVersion}`)
  writePackageJson(toPublishVersion)
  execSync(`npm config set registry http://registry.npmjs.org/`)
  execSync(`npm publish`)
  console.log(`npm publish发布成功`)
  execSync(`npm config set registry https://registry.npm.taobao.org`)
  updatePackageToGit(toPublishVersion)
}

function run() {
  publish()
}

run()
