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
  execSync(`git commit -m "更新package.json版本号到${version}"`)
  execSync(`git push`)
  console.log('推送package.json更新到git 成功')
}

function writePackageJson() {
  // 更新package.json
  fs.writeFileSync(
    pkgPath,
    JSON.stringify(Object.assign(pkgObject, {
      version: toPublishVersion,
    }), null, 2)
  )
}

function publish() {
  const currentPublishedVersion = getCurrentPublishedVersion()
  const toPublishVersion = semver.inc(currentPublishedVersion, getSemverType(SEMVER_TYPE))
  console.log(`当前线上${pkgObject.name}包的版本号为：${currentPublishedVersion}`)
  console.log(`开始发布npm包... 发布版本号为：${toPublishVersion}`)
  execSync(`npm publish`)
  console.log(`npm publish发布成功`)
  writePackageJson()
  updatePackageToGit(toPublishVersion)
}

function run() {
  publish()
}

run()
