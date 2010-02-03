#!/bin/sh
# $Id$
# Distribution Maker
set -e
V=1.0.0
Y=`date +%Y`
D=`date "+%Y-%m-%d"`
A=remocular
ROOT=`dirname "$0"`
url=`svn info "$ROOT" | grep URL | sed 's/.* //'`

[ -d "$A-$V" ] && rm -r "$A-$V"
svn export "$url" "$A-$V"

cd "$A-$V"
perl -i -p -e "s/#VERSION#/$V/g;s/#YEAR#/$Y/g;s/#DATE#/$D/g;" installer.sh client/Manifest.json README COPYRIGHT
cd client
ln -s ../../../../../../../usr/pack/qooxdoo-0.8svn-to/frontend qooxdoo
./generate.py build
perl -i -p -e "s/#VERSION#/$V/g;s/#YEAR#/$Y/g;" build/script/remocular.js
rm qooxdoo
cd ../..
tar vzcf "$A-$V".tar.gz "$A-$V"
rm -r "$A-$V"
