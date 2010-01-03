#!/usr/bin/perl -w
use strict;
use FindBin;
use Data::Dumper;
use lib "$FindBin::Bin/../lib";
use lib "$FindBin::Bin/../../support/lib";
my $plugin = shift @ARGV or die "Usage $0 plugin\n";
eval "require RemOcular::Plugin::${plugin};";
if ($@){
    die $@;
}
my $hand;
eval '$hand ='."RemOcular::Plugin::${plugin}->new();";
if ($@){
    die $@;
}
my $cfg = $hand->get_config()->{task}{form};
my %def;
for my $par (@$cfg){
    $def{$par->{name}} = $par->{initial};
}
my $params = {
    %def,
    map {my ($k,$v) = split /\s*=\s*/,$_,2;if ($v =~ /^(\d+(?:\.\d+)?)$/){$v = int($1)};($k,$v)} @ARGV
};
print Dumper $params;
$hand->start_instance('/dev/stdout',$params);

