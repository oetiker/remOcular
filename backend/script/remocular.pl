#!/usr/bin/perl -w

use strict;
use warnings;
use v5.8;
use FindBin;
use lib "$FindBin::Bin/../lib";
use lib "$FindBin::Bin/../../thirdparty/lib";
                
use Mojolicious::Commands;
use remOcular::MojoApp;

$ENV{MOJO_APP} = remOcular::MojoApp->new;
           
# Start commands
Mojolicious::Commands->start;
