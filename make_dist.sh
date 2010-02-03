#!/bin/sh
# $Id$
# Distribution Maker
set -e
V=1.0.0
Y=`date +%Y`
A=remocular
ROOT=`dirname $0`
url=`info svn info $ROOT | grep URL | sed 's/.* //'`
svn export $url $A-$V
cd $A-$V/client
ln -s ../../../../../../../usr/pack/qooxdoo-0.8svn-to/frontend qooxdoo
./generate.py build
rm qooxdoo
cd ..
perl -i -p -e "s/#VERSION#/$V/g;s/#YEAR#/$Y/g;" client/build/script/remocular.js installer.sh
cd ..
tar vzcf $A-$V.tar.gz $A-$V
rm -rf $A-$V
