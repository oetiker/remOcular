#!/bin/sh
# Distribution Maker
set -e
if [ "x${QOOXDOO_PATH:=$1}" = x ]; then
   echo usage: $0 qooxdoo-sdk-path
   echo    or set QOOXDOO_PATH
   exit 1
fi
$QOOXDOO_PATH/tool/bin/generator.py -m QOOXDOO_PATH:$QOOXDOO_PATH -m CACHE:${TMP:-/tmp}/${USER}_QX_CACHE $1
