#!/bin/bash
# $Id: build_missing_perlmodules.sh 365 2010-02-03 13:48:55Z oetiker $
## other decision structure
set -o errexit
# don't try to remember where things are
set +o hashall
## do not tollerate unset variables
set -u

if [ x$1 = 'x' ]; then
   echo "Missing destination directory."
   exit 1
fi

export LD_LIBRARY_PATH=

export PREFIX=$1

. `dirname $0`/module_builder.inc
perlmodule Config::Grammar
perlmodule IPC::Run
perlmodule Mojolicious
