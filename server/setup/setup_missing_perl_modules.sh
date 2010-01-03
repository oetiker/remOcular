#!/bin/bash
PACKAGER=to
VERSION=x
PROD=remocular


if [ x$1 = 'x' ]; then
   echo "Missing destination directory."
   echo " eg. $0 /opt/remocular/support"
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


condperl FCGI
condperl CGI::Fast
condperl JSON
condperl Config::Grammar
condperl IPC::Run
