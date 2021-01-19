import { Options, Statistics, SymlinkStatistics } from "dir-compare"
import util = require('util')
import path from 'path'

export interface DisplayOptions {
    showAll: boolean,
    wholeReport: boolean,
    nocolors: boolean,
    csv: boolean,
    noDiffIndicator: boolean,
    reason: boolean
}

export interface Test {
    // Test name. This represents also the name of the file holding expected result unless overriden by 'expected' param.
    name: string
    path1: string
    path2: string
    // Short test description.
    description: string
    // Expected result.
    expected: string
    // Left/right dirs will be relative to current process.
    withRelativePath: boolean
    // Options sent to command line test. Should match 'options'.
    commandLineOptions: string
    // Command line expected exit code.
    exitCode: number
    // Display parameters for print method.
    displayOptions: Partial<DisplayOptions>
    // Prints test result. If missing 'defaultPrint()' is used.
    print: any
    // only apply for synchronous compare
    onlySync: boolean
    // only apply for synchronous compare
    onlyAsync: boolean
    // limit test to specific node versions; ie. '>=2.5.0'
    nodeVersionSupport: string
    // exclude platform from run test; by default all platforms are allowed
    excludePlatform: Platform[]
    // Custom validation function
    customValidator: (result: Statistics) => boolean
}

type Platform = 'aix' | 'android' | 'darwin' | 'freebsd' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin' | 'netbsd'

export function getTests() {
    const res: Array<Partial<Test>> = [
        {
            name: 'test001_1', path1: 'd1', path2: 'd2',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        {
            name: 'test001_2', path1: 'd1', path2: 'd2',

            displayOptions: { showAll: true, wholeReport: true, csv: true, nocolors: true },
            commandLineOptions: '-aw --csv',
            exitCode: 1,
        },
        {
            name: 'test001_3', path1: 'd3', path2: 'd4',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        {
            name: 'test001_4', path1: 'd4', path2: 'd4',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test001_5', path1: 'd8', path2: 'd9',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a',
            exitCode: 1,
        },
        {
            name: 'test001_6', path1: 'd8', path2: 'd9',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        {
            name: 'test001_8', path1: 'd1', path2: 'd2',
            displayOptions: { nocolors: true },
            commandLineOptions: '',
            exitCode: 1,
        },
        {
            name: 'test001_9', path1: 'd1/a1.txt', path2: 'd2/a1.txt',
            description: 'should compare two files',
            displayOptions: { nocolors: true },
            commandLineOptions: '',
            exitCode: 0,
        },
        {
            name: 'test001_11', path1: 'd37', path2: 'd38',
            description: 'provides reason when entries are distinct',
            displayOptions: { showAll: true, nocolors: true, reason: true, wholeReport: true },
            commandLineOptions: '-awcD --reason',
            exitCode: 1,
        },
        {
            name: 'test001_12', path1: 'd37', path2: 'd38',
            description: 'provides reason when entries are distinct (csv)',
            displayOptions: { showAll: true, nocolors: true, reason: true, wholeReport: true, csv: true },
            commandLineOptions: '-awcD --csv',
            exitCode: 1,
        },


        ////////////////////////////////////////////////////
        // Filters                                        //
        ////////////////////////////////////////////////////
        {
            description: 'include files by name',
            name: 'test002_0', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -f "*.e1"',
            exitCode: 1,
        },
        {
            description: 'include files by name; show directories in report',
            name: 'test002_1', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw -f "*.e1"',
            exitCode: 1,
        },
        {
            description: 'exclude directories by name; show directories in report',
            name: 'test002_2', path1: 'd1', path2: 'd10',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw -x .x',
            exitCode: 1,
        },
        {
            description: 'exclude files by name',
            name: 'test002_3', path1: 'd1', path2: 'd2',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -x "*.txt"',
            exitCode: 1,
        },
        {
            description: 'exclude files by name; show directories in report',
            name: 'test002_4', path1: 'd1', path2: 'd2',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw -x "*.txt"',
            exitCode: 1,
        },
        {
            description: 'exclude files and directories by name with multiple patterns; match names beginning with dot',
            name: 'test002_5', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -x "*.e1,*.e2"',
            exitCode: 1,
        },
        {
            description: 'exclude files by name with multiple patterns;  match names beginning with dot; show directories in report',
            name: 'test002_6', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw -x "*.e1,*.e2"',
            exitCode: 1,
        },
        {
            description: 'include files by path',
            name: 'test002_7', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -f "**/A2/**/*.e*"',
            exitCode: 1,
        },
        {
            description: 'exclude directories by path',
            name: 'test002_8', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -x "**/A4/**"',
            exitCode: 1,
        },
        {
            description: 'exclude files by path',
            name: 'test002_9', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -x "**/A2/**/*.e*"',
            exitCode: 1,
        },
        {
            description: 'simultaneous use of include/exclude patterns',
            name: 'test002_10', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -f "*.txt" -x A2',
            exitCode: 1,
        },
        {
            description: 'include directories by relative path ("/...")',
            name: 'test002_11', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -f "/A2/**"',
            exitCode: 1,
        },
        {
            description: 'include files by relative path ("/...")',
            name: 'test002_12', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -f "/A2/**/*.txt"',
            exitCode: 1,
        },
        {
            description: 'exclude files and directories by relative path ("/...")',
            name: 'test002_13', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -x "/A2/**/*.txt,/.A3/**,/A1.e1"',
            exitCode: 1,
        },
        {
            description: 'include all files in root directory',
            name: 'test002_14', path1: 'd6', path2: 'd7',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-a -f "/*"',
            exitCode: 1,
        },

        ////////////////////////////////////////////////////
        // Compare by content                             //
        ////////////////////////////////////////////////////
        {
            name: 'test003_0', path1: 'd11', path2: 'd12',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-ac',
            exitCode: 1,
        },
        {
            name: 'test003_1', path1: 'd1', path2: 'd2',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awc',
            exitCode: 1,
        },
        {
            name: 'test003_3', path1: 'd39/a', path2: 'd39/b',
            description: 'compare only by size',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            exitCode: 1,
        },
        ////////////////////////////////////////////////////
        // Command line                                   //
        ////////////////////////////////////////////////////
        {
            name: 'test004_0', path1: 'd11', path2: 'd11',
            commandLineOptions: '',
            exitCode: 0,
        },
        {
            name: 'test004_1', path1: 'd11', path2: 'd12',
            commandLineOptions: '-c',
            exitCode: 1,
        },
        {
            name: 'test004_2', path1: 'd11', path2: 'd11',
            commandLineOptions: '--WRONGCMD ',
            exitCode: 2,
        },
        {
            name: 'test004_3', path1: 'd11', path2: '',
            commandLineOptions: '',
            exitCode: 2,
        },
        {
            name: 'test004_4', path1: 'd11', path2: 'miss',
            commandLineOptions: '',
            exitCode: 2,
        },
        {
            name: 'test004_5', path1: 'd11', path2: 'd1',
            commandLineOptions: '-ABCD',
            exitCode: 2,
        },
        {
            name: 'test004_6', path1: 'd11', path2: 'd1',
            commandLineOptions: '-ABCD --csv',
            exitCode: 2,
        },
        {
            name: 'test004_7', path1: 'd11', path2: 'd1',
            commandLineOptions: '--csv -ABCD --csv',
            exitCode: 2,
        },
        {
            name: 'test004_8', path1: 'd11', path2: 'd1',
            commandLineOptions: '--csv -ABCD',
            exitCode: 2,
        },
        {
            name: 'test004_9', path1: 'd11', path2: 'd1',
            commandLineOptions: '--ABC --async -x --async',
            exitCode: 2,
        },

        ////////////////////////////////////////////////////
        // Symlinks                                      //
        ////////////////////////////////////////////////////
        {
            name: 'test005_0', path1: 'd13', path2: 'd14',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awL',
            exitCode: 1,
        },
        {
            name: 'test005_1', path1: 'd17', path2: 'd17',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_1_1', path1: 'd17', path2: 'd17', withRelativePath: true,
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_2', path1: 'd17', path2: 'd17',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awL',
            exitCode: 0,
        },
        {
            name: 'test005_3', path1: 'd17', path2: 'd18',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        {
            name: 'test005_4', path1: 'd22', path2: 'd22',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_5', path1: 'd19', path2: 'd19',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_5_1', path1: 'd19', path2: 'd19', withRelativePath: true,
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_6', path1: 'd19', path2: 'd19',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awL',
            exitCode: 0,
        },
        {
            name: 'test005_7', path1: 'd20', path2: 'd20',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_8', path1: 'd21', path2: 'd21',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_9', path1: 'd20', path2: 'd21',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        {
            name: 'test005_10', path1: 'd21', path2: 'd20',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        {
            name: 'test005_11', path1: 'd20', path2: 'd22',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        {
            name: 'test005_12', path1: 'd22', path2: 'd20',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        {
            name: 'test005_13', path1: 'd23', path2: 'd23',
            description: 'be able to compare symlinks to files',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_14', path1: 'd24', path2: 'd24',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_15', path1: 'd25', path2: 'd25',
            description: 'do not fail when broken symlinks are encountered and skipSymlinks option is used',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw --skip-symlinks',
            exitCode: 0,
        },
        {
            name: 'test005_16', path1: 'd26', path2: 'd27',
            description: 'detect symbolic link loops; loops span between left/right directories',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        {
            name: 'test005_17', path1: 'd28', path2: 'd28',
            description: 'detect symbolic link loops; loop back to root directory',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_18', path1: 'd29', path2: 'd30',
            description: 'compare two symlinks',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test005_19', path1: 'd34_symlink/d', path2: 'd34_symlink/d',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },

        ////////////////////////////////////////////////////
        // Broken symlinks                                //
        ////////////////////////////////////////////////////
        {
            name: 'test005_30', path1: '#16/02/b', path2: '#16/02/a',
            description: "evaluate single broken link on both sides as different",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            exitCode: 1,
        },
        {
            name: 'test005_31', path1: '#16/03/b', path2: '#16/03/a',
            description: "report broken links before files or directories",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            exitCode: 1,
        },
        {
            name: 'test005_32', path1: '#16/01/a', path2: '#16/01/b',
            description: "handle broken links (left)",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            exitCode: 1,
        },
        {
            name: 'test005_33', path1: '#16/01/b', path2: '#16/01/a',
            description: "handle broken links (right)",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            exitCode: 1,
        },
        {
            name: 'test005_34', path1: '#16/03/b', path2: '#16/03/a',
            description: "ignores broken links if skipSymlinks is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --skip-symlinks',
            exitCode: 0,
        },
        {
            name: 'test005_35', path1: '#16/01/a', path2: '#16/01/b',
            description: "count broken links when no option is used in cli",
            commandLineOptions: '',
            exitCode: 1,
        },

        ////////////////////////////////////////////////////
        // Compare symlinks                               //
        ////////////////////////////////////////////////////
        {
            name: 'test005_50', path1: '#19/01/a', path2: '#19/01/b',
            description: "evaluate identical file symlinks pointing to identical files as equal when compare-symlink is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --compare-symlink',
            customValidator: stats => validateSymlinks(stats.symlinks, { distinctSymlinks: 0, equalSymlinks: 1, leftSymlinks: 0, rightSymlinks: 0, differencesSymlinks: 0, totalSymlinks: 1 }),
            excludePlatform: ['win32'],
            exitCode: 0,
        },
        {
            name: 'test005_51', path1: '#19/01/a', path2: '#19/01/b',
            description: "evaluate identical file symlinks pointing to identical files as equal when compare-symlink is not used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            customValidator: stats => !stats.symlinks,
            excludePlatform: ['win32'],
            exitCode: 0,
        },
        {
            name: 'test005_52', path1: '#19/06/a', path2: '#19/06/b',
            description: "evaluate identical file symlinks pointing to different files as different when compare-symlink is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --compare-symlink',
            customValidator: stats => validateSymlinks(stats.symlinks, { distinctSymlinks: 0, equalSymlinks: 1, leftSymlinks: 0, rightSymlinks: 0, differencesSymlinks: 0, totalSymlinks: 1 }),
            excludePlatform: ['win32'],
            exitCode: 1,
        },
        {
            name: 'test005_53', path1: '#19/06/a', path2: '#19/06/b',
            description: "evaluate identical file symlinks pointing to different files as different when compare-symlink is not used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            customValidator: stats => !stats.symlinks,
            excludePlatform: ['win32'],
            exitCode: 1,
        },
        {
            name: 'test005_54', path1: '#19/05/a', path2: '#19/05/b',
            description: "evaluate identical directory symlinks as equal when compare-symlink option is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --compare-symlink',
            customValidator: stats => validateSymlinks(stats.symlinks, { distinctSymlinks: 0, equalSymlinks: 1, leftSymlinks: 0, rightSymlinks: 0, differencesSymlinks: 0, totalSymlinks: 1 }),
            excludePlatform: ['win32'],
            exitCode: 0,
        },
        {
            name: 'test005_55', path1: '#19/05/a', path2: '#19/05/b',
            description: "evaluate identical directory symlinks as equal when compare-symlink option is not used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            customValidator: stats => !stats.symlinks,
            excludePlatform: ['win32'],
            exitCode: 0,
        },
        {
            name: 'test005_56', path1: '#19/02/a', path2: '#19/02/b',
            description: "evaluate different file symlinks pointing to identical files as distinct when compare-symlink is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --compare-symlink',
            customValidator: stats => validateSymlinks(stats.symlinks, { distinctSymlinks: 1, equalSymlinks: 0, leftSymlinks: 0, rightSymlinks: 0, differencesSymlinks: 1, totalSymlinks: 1 }),
            excludePlatform: ['win32'],
            exitCode: 1,
        },
        {
            name: 'test005_57', path1: '#19/02/a', path2: '#19/02/b',
            description: "evaluate different file symlinks pointing to identical files as equal if compare-symlink option is not used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            customValidator: stats => !stats.symlinks,
            excludePlatform: ['win32'],
            exitCode: 0,
        },
        {
            name: 'test005_58', path1: '#19/07/a', path2: '#19/07/b',
            description: "evaluate different directory symlinks as distinct when compare-symlink is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --compare-symlink',
            customValidator: stats => validateSymlinks(stats.symlinks, { distinctSymlinks: 1, equalSymlinks: 0, leftSymlinks: 0, rightSymlinks: 0, differencesSymlinks: 1, totalSymlinks: 1 }),
            excludePlatform: ['win32'],
            exitCode: 1,
        },
        {
            name: 'test005_59', path1: '#19/07/a', path2: '#19/07/b',
            description: "evaluate different directory symlinks as equal if compare-symlink option is not used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            customValidator: stats => !stats.symlinks,
            excludePlatform: ['win32'],
            exitCode: 0,
        },
        {
            name: 'test005_60', path1: '#19/03/a', path2: '#19/03/b',
            description: "evaluate mixed file/symlink as distinct when compare-symlink is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --compare-symlink',
            customValidator: stats => validateSymlinks(stats.symlinks, { distinctSymlinks: 1, equalSymlinks: 0, leftSymlinks: 0, rightSymlinks: 0, differencesSymlinks: 1, totalSymlinks: 1 }),
            excludePlatform: ['win32'],
            exitCode: 1,
        },
        {
            name: 'test005_61', path1: '#19/03/a', path2: '#19/03/b',
            description: "evaluate mixed file/symlink as equal when compare-symlink is not used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            customValidator: stats => !stats.symlinks,
            excludePlatform: ['win32'],
            exitCode: 0,
        },
        {
            name: 'test005_62', path1: '#19/08/a', path2: '#19/08/b',
            description: "evaluate mixed directory/symlink as distinct when compare-symlink is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --compare-symlink',
            customValidator: stats => validateSymlinks(stats.symlinks, { distinctSymlinks: 1, equalSymlinks: 0, leftSymlinks: 0, rightSymlinks: 0, differencesSymlinks: 1, totalSymlinks: 1 }),
            excludePlatform: ['win32'],
            exitCode: 1,
        },
        {
            name: 'test005_63', path1: '#19/08/a', path2: '#19/08/b',
            description: "evaluate mixed directory/symlink as equal when compare-symlink is not used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            customValidator: stats => !stats.symlinks,
            excludePlatform: ['win32'],
            exitCode: 0,
        },
        {
            name: 'test005_64', path1: '#19/04/a', path2: '#19/04/b',
            description: "evaluate mixed file symlink and directory symlink as different when compare-symlink is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --compare-symlink',
            customValidator: stats => validateSymlinks(stats.symlinks, { distinctSymlinks: 0, equalSymlinks: 0, leftSymlinks: 1, rightSymlinks: 1, differencesSymlinks: 2, totalSymlinks: 2 }),
            excludePlatform: ['win32'],
            exitCode: 1,
        },
        {
            name: 'test005_65', path1: '#19/04/a', path2: '#19/04/b',
            description: "evaluate mixed file symlink and directory symlink as different when compare-symlink is not used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason',
            customValidator: stats => !stats.symlinks,
            excludePlatform: ['win32'],
            exitCode: 1,
        },
        {
            name: 'test005_66', path1: '#19/07/a', path2: '#19/07/b',
            description: "no symlink is compared if skipSymlink is used",
            displayOptions: { showAll: true, wholeReport: true, nocolors: true, reason: true },
            commandLineOptions: '-aw --reason --compare-symlink --skip-symlinks',
            customValidator: stats => validateSymlinks(stats.symlinks, { distinctSymlinks: 0, equalSymlinks: 0, leftSymlinks: 0, rightSymlinks: 0, differencesSymlinks: 0, totalSymlinks: 0 }),
            excludePlatform: ['win32'],
            exitCode: 0,
        },

        ////////////////////////////////////////////////////
        // Skip subdirs                                   //
        ////////////////////////////////////////////////////
        {
            name: 'test006_0', path1: 'd1', path2: 'd2',
            displayOptions: { showAll: true, nocolors: true },
            commandLineOptions: '-aS',
            exitCode: 1,
        },
        {
            name: 'test006_1', path1: 'd1', path2: 'd2',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awS',
            exitCode: 1,
        },
        ////////////////////////////////////////////////////
        // Ignore case                                    //
        ////////////////////////////////////////////////////
        {
            name: 'test007_0', path1: 'd15', path2: 'd16',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awi',
            exitCode: 0,
        },
        {
            name: 'test007_1', path1: 'd15', path2: 'd16',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 1,
        },
        ////////////////////////////////////////////////////
        // Compare date                                   //
        ////////////////////////////////////////////////////
        {
            name: 'test010_0', path1: 'd31', path2: 'd32',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-aw',
            exitCode: 0,
        },
        {
            name: 'test010_1', path1: 'd31', path2: 'd32',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awD',
            exitCode: 1,
        },
        {
            name: 'test010_2', path1: 'd31', path2: 'd32',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awc',
            exitCode: 1,
        },
        {
            name: 'test010_3', path1: 'd31', path2: 'd32',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awcD',
            exitCode: 1,
        },
        {
            name: 'test010_4', path1: 'd33/1', path2: 'd33/2',
            description: 'should correctly use tolerance in date comparison',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awD --date-tolerance 5000',
            exitCode: 1,
        },
        {
            name: 'test010_5', path1: 'd33/1', path2: 'd33/2',
            description: 'should correctly use tolerance in date comparison',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awD --date-tolerance 9000',
            exitCode: 0,
        },
        {
            name: 'test010_6', path1: 'd33/1', path2: 'd33/2',
            description: 'should default to 1000 ms for date tolerance',
            displayOptions: { showAll: true, wholeReport: true, nocolors: true },
            commandLineOptions: '-awD',
            exitCode: 1,
        },
    ]
    return res
}




function validateSymlinks(expected: SymlinkStatistics | undefined, actual: SymlinkStatistics) {
    return JSON.stringify(expected) === JSON.stringify(actual)
}