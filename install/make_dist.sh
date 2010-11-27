#!/bin/sh
# Distribution Maker
set -e
if [ "x${QOOXDOO_PATH:=$1}" = x ]; then
   echo usage: $0 qooxdoo-sdk-path
   echo    or set QOOXDOO_PATH
   exit 1
fi
V=1.0.0
Y=`date +%Y`
D=`date "+%Y-%m-%d"`
A=remocular
ROOT=`dirname "$0"`/..
BUILD=/tmp/${USER}_QX_BUILD/${A}-${V}
mkdir -p $BUILD
cp -rp $ROOT/* $BUILD
cd $BUILD
perl -i -p -e "s/#VERSION#/$V/g;s/#YEAR#/$Y/g;s/#DATE#/$D/g;" installer.sh frontend/Manifest.json README COPYRIGHT
cd frontend
$QOOXDOO_PATH/tool/bin/generator.py -m QOOXDOO_PATH:$QOOXDOO_PATH -m CACHE:${TMP:-/tmp}/${USER}_QX_CACHE build
perl -i -p -e "s/#VERSION#/$V/g;s/#YEAR#/$Y/g;" build/script/remocular.js
cd ../..
tar vzcf "$ROOT/$A-$V".tar.gz  --exclude "*~" --exclude .git "$A-$V"
rm -r $BUILD
