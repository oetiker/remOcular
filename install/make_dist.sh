#!/bin/sh
# Distribution Maker
set -x
set -e
if [ "x${QOOXDOO_PATH:=$1}" = x ]; then
   echo usage: $0 qooxdoo-sdk-path
   echo    or set QOOXDOO_PATH
   exit 1
fi
V=0.8
Y=`date +%Y`
D=`date "+%Y-%m-%d"`
A=remocular
R=`dirname "$0"`/..
ROOT=`cd $R;pwd`
BUILD=/tmp/${USER}_QX_BUILD/${A}-${V}
mkdir -p $BUILD
git archive --format=tar $V | tar xvf - -C $BUILD
cd $BUILD
perl -i -p -e "s/#VERSION#/$V/g;s/#YEAR#/$Y/g;s/#DATE#/$D/g;" installer.sh frontend/Manifest.json README COPYRIGHT
cd frontend
./generator.sh $QOOXDOO_PATH build
perl -i -p -e "s/#VERSION#/$V/g;s/#YEAR#/$Y/g;" build/script/remocular.js
cd $BUILD/..
tar vzcf "$ROOT/$A-$V".tar.gz  --exclude "*~" --exclude .git "$A-$V"
rm -r $BUILD
