#!/bin/bash

. `dirname $0`/sdbs.inc


for module in \
    MojoX::Dispatcher::Qooxdoo::Jsonrpc \
    Config::Grammar \
    IPC::Run \
; do
    perlmodule $module
done
