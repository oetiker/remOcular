#!/usr/sepp/bin/perl-5.12.1 -w

use strict;
use warnings;
use 5.12.0;
use FindBin;
use lib "$FindBin::Bin/../lib";
use lib "$FindBin::Bin/../../thirdparty/lib";
                
use Mojolicious::Commands;
use remOcular::MojoApp;

$ENV{MOJO_APP} = remOcular::MojoApp->new;
           
# Start commands
Mojolicious::Commands->start;
