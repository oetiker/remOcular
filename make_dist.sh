#!/bin/sh
# $Id$
# Distribution Maker
set -e
V=1.0.0
Y=`date +%Y`
D=`date "+%Y-%m-%d"`
A=remocular
ROOT=`dirname $0`
url=`svn info $ROOT | grep URL | sed 's/.* //'`
svn export $url $A-$V
cd $A-$V/client
ln -s ../../../../../../../usr/pack/qooxdoo-0.8svn-to/frontend qooxdoo
perl -i -p -e "s/#VERSION#/$V/g;s/#YEAR#/$Y/g;s/#DATE#/$D/g;" installer.sh client/Manifest.json README COPYRIGHT
./generate.py build
perl -i -p -e "s/#VERSION#/$V/g;s/#YEAR#/$Y/g;" client/build/script/remocular.js
rm qooxdoo
cd ../..
tar vzcf $A-$V.tar.gz $A-$V
rm -rf $A-$V
