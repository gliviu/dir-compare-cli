import { getTests, Test } from "./tests"
import pjson = require('../package.json')

import colors = require('colors/safe')
import pathUtils = require('path')
import shelljs = require('shelljs')
import util = require('util')
import fs = require('fs')
import os = require('os')
import temp = require('temp')
import defaultPrint = require('../src/cli/print')
import Streams = require('memory-streams')
import untar = require('./untar')
import semver = require('semver')


// Usage: node runTests [unpacked] [test001_1] [showresult] [skipcli] [skipasync] [noReport]
interface RunOptions {
    // Use ./testdir instead of testdir.tar as test data.
    // Run 'node extract.js' to initialize ./testdir.
    // (note that regular untar will not work as it contains symlink loops)
    unpacked: boolean,

    // Specify a single test to run ie. 'test000_0'
    singleTestName: string,

    // Shows actual/expected for each test
    showResult: boolean,

    // Do not create report.txt
    noReport: boolean
}



let count = 0, failed = 0, successful = 0
let syncCount = 0, syncFailed = 0, syncSuccessful = 0
let asyncCount = 0, asyncFailed = 0, asyncSuccessful = 0
let cmdLineCount = 0, cmdLineFailed = 0, cmdLineSuccessful = 0

// Automatically track and cleanup files at exit
temp.track()


function passed(value, type) {
    count++
    if (value) {
        successful++
    } else {
        failed++
    }

    if (type === 'sync') {
        syncCount++
        if (value) {
            syncSuccessful++
        } else {
            syncFailed++
        }
    }

    if (type === 'async') {
        asyncCount++
        if (value) {
            asyncSuccessful++
        } else {
            asyncFailed++
        }
    }

    if (type === 'cmdLine') {
        cmdLineCount++
        if (value) {
            cmdLineSuccessful++
        } else {
            cmdLineFailed++
        }
    }

    return value ? colors.green('Passed') : colors.yellow('!!!!FAILED!!!!')
}


// Matches date (ie 2014-11-18T21:32:39.000Z)
const normalizeDateRegexp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/gm

function normalize(str) {
    str = str.replace(normalizeDateRegexp, 'x')
    str = str.replace(/\r\n/g, '\n')
    str = str.replace(/\\/g, '/')
    return str
}

const getExpected = function (test) {
    if (test.expected) {
        return test.expected.trim()
    } else {
        return normalize(fs.readFileSync(__dirname + '/expected/' + test.name + '.txt', 'utf8')).trim()
    }
}

function testCommandLineInternal(test, testDirPath, async, saveReport, runOptions: Partial<RunOptions>) {
    return new Promise<void>(function (resolve, reject) {
        const dircompareJs = pathUtils.normalize(__dirname + '/../src/cli/dircompare.js')
        process.chdir(testDirPath)
        let path1, path2
        if (test.withRelativePath) {
            path1 = test.path1
            path2 = test.path2
        } else {
            path1 = test.path1 ? testDirPath + '/' + test.path1 : ''
            path2 = test.path2 ? testDirPath + '/' + test.path2 : ''
        }
        const command = util.format("node %s %s %s %s %s",
            dircompareJs, test.commandLineOptions, async ? '--async' : '', path1, path2)
        const shelljsResult = shelljs.exec(command, {
            silent: true
        })
        const output = normalize(shelljsResult.output).trim()
        const exitCode = shelljsResult.code

        const expectedExitCode = test.exitCode
        let res
        let expectedOutput
        if (expectedExitCode === 2) {
            // output not relevant for error codes
            res = (exitCode === expectedExitCode)
        } else {
            expectedOutput = getExpected(test)
            res = expectedOutput === output && (exitCode === expectedExitCode)
        }
        if (runOptions.showResult) {
            printResult(output, expectedOutput)
        }
        const testDescription = 'command line ' + (async ? 'async' : 'sync')
        report(test.name, testDescription, output, exitCode, res, saveReport)
        console.log(test.name + ' ' + testDescription + ': ' + passed(res, 'cmdLine'))
        resolve()
    })
}

const testCommandLine = function (test, testDirPath, saveReport, runOptions: Partial<RunOptions>) {
    return Promise.all([
        testCommandLineInternal(test, testDirPath, false, saveReport, runOptions),
        testCommandLineInternal(test, testDirPath, true, saveReport, runOptions)
    ])
}

function initReport(saveReport) {
    if (saveReport) {
        if (fs.existsSync(REPORT_FILE)) {
            fs.unlinkSync(REPORT_FILE)
        }
        fs.appendFileSync(REPORT_FILE, util.format('Date: %s, Node version: %s. OS platform: %s, OS release: %s, dir-compare version: %s\n',
            new Date(), process.version, os.platform(), os.release(), pjson.version))
    }
}

const REPORT_FILE = __dirname + "/report.txt"
function report(testName, testDescription, output, exitCode, result, saveReport) {
    if (saveReport && !result) {
        fs.appendFileSync(REPORT_FILE, util.format(
            "\n%s %s failed - result: %s, exitCode: %s, output: %s\n", testName, testDescription, result,
            exitCode ? exitCode : 'n/a', output ? output : 'n/a'))
    }

}

function endReport(saveReport) {
    if (saveReport) {
        fs.appendFileSync(REPORT_FILE, 'Tests: ' + count + ', failed: ' + failed + ', succeeded: ' + successful)
    }
}

const printResult = function (output, expected) {
    console.log('Actual:')
    console.log(output)
    console.log('Expected:')
    console.log(expected)
    console.log('Result: ' + (output === expected))
}

function validatePlatform(test: Partial<Test>) {
    if(!test.excludePlatform || test.excludePlatform.length===0) {
        return true
    }

    return !includes(test.excludePlatform, os.platform())
}

function includes<T>(arr: T[], item: T): boolean {
    return arr.filter(v => v === item).length === 1
}

// testDirPath: path to test data
// singleTestName: if defined, represents the test name to be executed in format
//                 otherwise all tests are executed
function executeTests(testDirPath, runOptions: Partial<RunOptions>) {
    console.log('Test dir: ' + testDirPath)
    const saveReport = !runOptions.noReport
    initReport(saveReport)
    Promise.resolve(getTests(testDirPath)).then(function (tests) {
        // Run command line tests
        const commandLinePromises: Array<Promise<any>> = []
        getTests(testDirPath).filter(function (test) { return !test.onlyLibrary; })
            .filter(function (test) { return test.nodeVersionSupport === undefined || semver.satisfies(process.version, test.nodeVersionSupport) })
            .filter(test => validatePlatform(test))
            .filter(function (test) { return runOptions.singleTestName ? test.name === runOptions.singleTestName : true; })
            .forEach(function (test) {
                commandLinePromises.push(testCommandLine(test, testDirPath, saveReport, runOptions))
            })
        return Promise.all(commandLinePromises)
    }).then(function () {
        console.log()
        console.log('Command line tests: ' + cmdLineCount + ', failed: ' + colors.yellow(cmdLineFailed.toString()) + ', succeeded: ' + colors.green(cmdLineSuccessful.toString()))
    }).then(function () {
        console.log()
        console.log('All tests: ' + count + ', failed: ' + colors.yellow(failed.toString()) + ', succeeded: ' + colors.green(successful.toString()))
        endReport(saveReport)
        process.exitCode = failed > 0 ? 1 : 0
        process.chdir(__dirname);  // allow temp dir to be removed
    }).catch(error => {
        console.error(error);
        process.exit(1)
    })
}


const main = function () {
    const args = process.argv
    const runOptions: Partial<RunOptions> = {
        unpacked: false,
        showResult: false,
        noReport: false,
        singleTestName: undefined
    }
    args.forEach(function (arg) {
        if (arg.match('unpacked')) {
            runOptions.unpacked = true
        }
        if (arg.match('showresult')) {
            runOptions.showResult = true
        }
        if (arg.match('noreport')) {
            runOptions.noReport = true
        }
        if (arg.match(/test\d\d\d_\d/)) {
            runOptions.singleTestName = arg
        }
    })

    if (runOptions.unpacked) {
        executeTests(__dirname + '/testdir', runOptions)
    }
    else {
        temp.mkdir('dircompare-test', function (err, testDirPath) {
            if (err) {
                throw err
            }

            function onError(error) {
                console.error('Error occurred:', error)
            }
            untar(__dirname + "/testdir.tar", testDirPath, function () { executeTests(testDirPath, runOptions) }, onError)
        })
    }
}

main()
