#!/bin/bash
PACKAGER=to
VERSION=x
PROD=CPV


if [ x$1 = 'x' ]; then
   echo "Missing destination directory."
   echo " eg. $0 /opt/smoketrace/support"
   exit 1
fi

export LD_LIBRARY_PATH=
export PREFIX=$1
mkdir -p $PREFIX
export VPREFIX=$PREFIX
export EPREFIX=$PREFIX
export WORKDIR=$PREFIX/src
[ -d $WORKDIR ] || mkdir -p $WORKDIR

. `dirname $0`/build_software.helpers

function gmake () {
     make "$@"
}


perlmodule FCGI
perlmodule CGI::Fast
perlmodule CGI::Session
perlmodule JSON
perlmodule Config::Grammar
perlmodule IPC::Run
