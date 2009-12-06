package RemOcular::JsonRpc::smoketrace;
use strict;
use POSIX 'setsid';
use Fcntl ':flock'; # import LOCK_* constants 

use RemOcular::PluginHelper;
use Time::HiRes qw(usleep);

###############################################################
#use RemOcular::Plugin::Top;
use RemOcular::Plugin::Df;
use RemOcular::Plugin::TraceRoute;
use RemOcular::Plugin::IoStat;
#use RemOcular::Plugin::Top;
use RemOcular::Plugin::MpStat;

my %plug = (
#    Top=>RemOcular::Plugin::Top->new(),
    IoStat=>RemOcular::Plugin::IoStat->new(),
    TraceRoute=>RemOcular::Plugin::TraceRoute->new(),
    Df=>RemOcular::Plugin::Df->new(),
    MpStat=>RemOcular::Plugin::MpStat->new()
);

my @plug = qw(TraceRoute MpStat Df IoStat);
my $tmp_prefix = "/tmp/RemOcular.";
###############################################################

$SIG{CHLD} = 'IGNORE';
    
=head1 NAME

RemOcular::JsonRpc::smoketrace - RPC services for SmokeTrace

=head1 SYNOPSIS

This module gets called by L<jsonrpc.fcgi>.

=head1 DESCRIPTION

This is not a class as in normal perl OO programming, but rather a
collection of functions as required by L<Qooxdoo::JSONRPC>.

It implements the following functions:

=head2 GetAccessibility(method,access,session)

The functions is called for every method call. It determines if the method should run or not.

=cut 

sub GetAccessibility {
     my $method = shift;
     my $access = shift;
     my $session = shift;
     return 'public';
}


=head2 method_getConfig(error)

Returns a complex data structure describing the available plugins.

=cut  

sub method_config {
    my $error = shift;
    my $session = $error->{session};
    my @cfg;
    for my $p (@plug){
        push @cfg, $plug{$p}->get_config();
    }
    return \@cfg;
}


=head2 method_start(error,args)

start a plugin

=cut  

sub method_start {
    my $error = shift;
    my $session = $error->{session};
    my $par = shift;
    my $plugin = $par->{plugin};
    my $args = $par->{args};
    my ($caption,$interval,$err) = $plug{$plugin}->check_params($args);
    if ($err){
        $error->set_error(110, $err);
        return $error;
    }        
    print STDERR "Starting Plugin $plugin\n";
    my $handle = sprintf("h%.0f",rand(1e6-1));
    defined(my $pid = fork()) or die "Can't fork: $!";
    if ( $pid == 0 ){ # child
        # avoid a race condition regarding
        # session saving ... 
        # the kid thinks the session is unset
        $session->{_STATUS} = CGI::Session::STATUS_UNSET;
        $session = undef;
        # behave like a daemon
        chdir '/'               or die "Can't chdir to /: $!";
        setsid;
        # no more magic error handling
        local $SIG{__DIE__};
        local $SIG{__WARN__};
        # since fcgi ties the standard io handles
        # we have to untie them first
        untie *STDOUT if tied (*STDOUT);
        untie *STDIN if tied (*STDIN);
        untie *STDERR if tied (*STDERR);
        # shut down the connections to the rest of the world
        open STDIN, '</dev/null' or die "Can't read /dev/null: $!";
        open STDOUT, '>/dev/null' or die "Can't write to /dev/null: $!";
        open STDERR, '>&STDOUT' or die "Can't dup stdout: $!";
        # ready to start the plugin
        $plug{$plugin}->start_instance($tmp_prefix.$handle,$args);
        exit 0;
    } else {
        $session->param($handle,$pid); 
        $session->flush();       
        # start by clearing the table
        RemOcular::PluginHelper::save($tmp_prefix.$handle,"#CLEAR\n");
        # warn "Save Params '$handle' '$pid'\n".$session->dump();
        return { handle => $handle,
                 interval => $interval,
                 caption => $caption,
        }
    }
}

=head2 method_stop(error,handle)

Pull details about a participant based on his part_id.
returns a hash/map

=cut  

sub method_stop {
    my $error = shift;
    my $session = $error->{session};
    my $handle = shift;
    my $pid =  $session->param($handle);
    if ($pid){ 
        my $running = 0;
        for (my $i = 0; $i < 40; $i++){
            $running = kill 9,$pid;
            last if $running == 0;
            usleep 100000;
        }
        unlink $tmp_prefix.$handle;
        $session->clear([$handle]);
        $session->flush();
        if ($running > 0){
            $error->set_error(113, "Process $pid did not die within the 4 seconds I waited.");
            return $error;
        }        
    } else {
        $error->set_error(114, "Handle $handle is not under my control");
        return $error;
    }        
}

=head2 method_poll(error,handles);

fetch all the callers data and ship it.

=cut  

sub method_poll {
    my $error = shift;
    my $session = $error->{session};
#   warn "Session Status: ".$session->dump();
    my $handles = shift;
    my %data;
    for my $handle (@$handles){
        my $pid = $session->param($handle);
        if (not $pid){
            # no data from this source ...
            push @{$data{$handle}},['#ERROR',"Handle $handle not registerd in this session"];
        }
        elsif (not open(my $fh,"$tmp_prefix$handle")){
            # no data from this source ...
            push @{$data{$handle}},['#INFO',$!];
        }
        else {
            flock($fh,LOCK_EX);
            while (<$fh>){
                chomp;
                my @row = map { 
                    my $out = $_;
                    /^-?\d+(?:\.\d+)?$/ && do { $out = 0.0+$_ };
                    /^(-?\d+(?:\.\d+)?)m$/ && do { $out = $1 * 1024 };
                    /^(-?\d+(?:\.\d+)?)g$/ && do { $out = $1 * 1024 * 1024};
                    $out;
                } split /\t/, $_;
                push @{$data{$handle}},\@row;
            }
            truncate("$tmp_prefix$handle",0) or die "truncating $!";
            close $fh;
        }
    }
    return  \%data;
}


1;
__END__
=head1 COPYRIGHT

Copyright (c) 2008 by OETIKER+PARTNER AG. All rights reserved.

=head1 LICENSE

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

=head1 AUTHOR

S<Tobias Oetiker E<lt>tobi@oetiker.chE<gt>>

=head1 HISTORY 

 2009-10-31 to Initial

=cut
  
1;

# Emacs Configuration
#
# Local Variables:
# mode: cperl
# eval: (cperl-set-style "PerlStyle")
# mode: flyspell
# mode: flyspell-prog
# End:
#
# vi: sw=4 et
