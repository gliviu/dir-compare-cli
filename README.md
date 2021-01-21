dir-compare-cli
==========
This is the command line utility for [dir-compare](https://github.com/gliviu/dir-compare).

[![Build Status](https://travis-ci.com/gliviu/dir-compare-cli.svg?branch=main)](https://travis-ci.com/gliviu/dir-compare-cli)
[![Build status](https://ci.appveyor.com/api/projects/status/8yylihr3naarrt39?svg=true)](https://ci.appveyor.com/project/gliviu/dir-compare-cli)

# Installation
```shell
$ npm install -g dir-compare-cli
```

# Usage
```
  Usage: dircompare [options] leftdir rightdir

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -c, --compare-content    compare files by content
    -D, --compare-date       compare files by date
    --date-tolerance [type]  tolerance to be used in date comparison (milliseconds)
    --compare-symlink        compare files and directories by symlink
    -f, --filter [type]      file name filter
    -x, --exclude [type]     file/directory name exclude filter
    -S, --skip-subdirs       do not recurse into subdirectories
    -L, --skip-symlinks      ignore symlinks
    -i, --ignore-case        ignores case when comparing file names
    -l, --show-left          report - show entries occurring in left dir
    -r, --show-right         report - show entries occurring in right dir
    -e, --show-equal         report - show identic entries occurring in both dirs
    -d, --show-distinct      report - show distinct entries occurring in both dirs
    -a, --show-all           report - show all entries
    -w, --whole-report       report - include directories in detailed report
    --reason                 report - show reason when entries are distinct
    --csv                    report - print details as csv
    --nocolors               don't use console colors
    --async                  Make use of multiple cores

  By default files are compared by size.
  --date-tolerance defaults to 1000 ms. Two files are considered to have
  the same date if the difference between their modification dates fits
  within date tolerance.

  Exit codes:
    0 - entries are identical
    1 - entries are different
    2 - error occurred

  Examples:
  compare by content         dircompare -c dir1 dir2
  show only different files  dircompare -d dir1 dir2

  exclude filter             dircompare -x ".git,node_modules" dir1 dir2
                             dircompare -x "/tests/expected" dir1 dir2
                             dircompare -x "**/expected" dir1 dir2
                             dircompare -x "**/tests/**/*.ts" dir1 dir2
  
  include filter             dircompare -f "*.js,*.yml" dir1 dir2
                             dircompare -f "/tests/**/*.js" dir1 dir2
                             dircompare -f "**/tests/**/*.ts" dir1 dir2
```

