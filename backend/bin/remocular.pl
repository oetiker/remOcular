#!/usr/bin/env perl

use strict;
use warnings;
use FindBin;
use lib "$FindBin::Bin/../lib";
use lib "$FindBin::Bin/../../thirdparty/lib/perl5"; # PERL5LIB
use Mojolicious::Commands;
use remOcular::MojoApp;

$ENV{MOJO_APP} = remOcular->new;

# Start commands
Mojolicious::Commands->start;
