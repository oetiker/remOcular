package remOcular::JsonRpcService;
use strict;
use POSIX qw(setsid sigprocmask);
use Fcntl ':flock'; # import LOCK_* constants 
use remOcular::Plugin;
use Time::HiRes qw(usleep);
use remOcular::Exception qw(error);

use base qw(Mojo::Base);

my $user = (getpwuid($<))[0];
my $tmp_prefix = "/tmp/remocular_session_${user}/data.";
###############################################################

$SIG{CHLD} = 'IGNORE';

__PACKAGE__->attr('cfg');
__PACKAGE__->attr('session');
__PACKAGE__->attr('plugin_hand');
__PACKAGE__->attr('plugin_list');

=head1 NAME

remOcular::JsonRpc::remocular - RPC services for remocular

=head1 SYNOPSIS

This module gets instanciated by L<remOcular::MojoApp>.

=head1 DESCRIPTION

All methods on this class can get called remotely as long as their name does not start with an underscore.

=head2 new(cfg=>$cfg)

The functions is called for every method call. It determines if the method should run or not.

=cut 


sub new {
    my $self = shift->SUPER::new(@_);
    $self->_load_plugins();
    return $self;
}


=head2 _load_plugins()

Load and instanciate the plugins listed in the config file

=cut

sub _load_plugins {
    my $self = shift;       
    my %plugin_hand;
    my @plugin_list;
    my $cfg = $self->cfg;
    my $plug_hash = $cfg->{Plugin};
    for my $plug (sort {$plug_hash->{$a}{_order} <=> $plug_hash->{$b}{_order}} keys %$plug_hash){
        next if exists $plugin_hand{$plug};
        my $plug_file = $plug;
        $plug_file =~ s|::|/|g;
        eval { require $plug_file.'.pm' };
        if ($@){
            warn "Could not load $plug. Skipping it. ($@)\n";
            next;
        }
        my $hand = eval { ${plug}->new() };
        if ($@){
            warn "Could not instanciate $plug. Skipping it. ($@)\n";
            next;
        }
        $plugin_hand{$plug} = $hand;
        push @plugin_list,$plug;
    }
    $self->plugin_hand(\%plugin_hand);
    $self->plugin_list(\@plugin_list);
}

=head2 config()

Returns a complex data structure describing the available plugins.

=cut  

sub config {
    my $self = shift;
    my @plugs;
    for my $p (@{$self->plugin_list}){
        push @plugs, { plugin => $p, config => $self->plugin_hand->{$p}->get_config() };
    }
    return {
        plugins => \@plugs,
        admin_name => $self->cfg->{General}{admin_name},
        admin_link => $self->cfg->{General}{admin_link}
    };
}


=head2 start({plugin=>$x,args=>$y})

start a plugin

=cut  

sub start {
    my $self = shift;
    my $par = shift;
    my $plugin = $par->{plugin};
    my $args = $par->{args};
    if (not $self->plugin_hand->{$plugin}){
        die error(111, "Plugin $plugin is not available");
    }
    my $run_conf = $self->plugin_hand->{$plugin}->check_params($args);
    if (ref $run_conf ne 'HASH'){
        die error(112, $run_conf);
    }        
    print STDERR "Starting Plugin $plugin\n";
    my $handle = sprintf("h%.0f",rand(1e6-1));
    defined(my $pid = fork()) or die error(384,"Can't fork: $!");
    if ( $pid == 0 ){ # child
        # behave like a daemon
        chdir '/' or die "Can't chdir to /: $!";
        setsid;

        # no more magic error handling
        local $SIG{__WARN__};
        local $SIG{__DIE__};

        # some other code may have tied our handles
        # to get free we have to untie them first 
        do {
            no warnings;
            untie *STDOUT if tied (*STDOUT);
            untie *STDIN if tied (*STDIN);
            untie *STDERR if tied (*STDERR);
        };
        # shut down the connections to the rest of the world
        open STDIN, '</dev/null' or die "Can't read /dev/null: $!";
        open STDOUT, '>/dev/null' or die "Can't write to /dev/null: $!";
        open STDERR, '>&STDOUT' or die "Can't dup stdout: $!";
        # it seems that apache block sigalarm in its childs,
        # we can't have that here ... 
        my $sigset = POSIX::SigSet->new();
        $sigset->fillset();
        sigprocmask(&POSIX::SIG_UNBLOCK,$sigset,undef);
        # ready to start the plugin
        $self->plugin_hand->{$plugin}->start_instance($tmp_prefix.$handle,$args);
        exit 0;
    } else {
        $self->session->{$handle} = $pid;
        # start by clearing the table
        remOcular::Plugin->append_data($tmp_prefix.$handle,"#CLEAR\n");
        return { handle => $handle,
                 cfg => $run_conf };
    }
}

=head2 method_stop(error,handle)

Pull details about a participant based on his part_id.
returns a hash/map

=cut  

sub method_stop {
    my $self = shift;
    my $handle = shift;
    my $pid =  $self->session->{$handle};
    if ($pid){ 
        my $running = 0;
        for (my $i = 0; $i < 40; $i++){
            $running = kill 9,$pid;
            last if $running == 0;
            usleep 100000;
        }
        unlink $tmp_prefix.$handle;
        delete $self->session->{$handle};
        if ($running > 0){
            die error(113, "Process $pid did not die within the 4 seconds I waited.");
        }        
    } else {
        die error(114, "Handle $handle is not under my control");
    }        
}

=head2 method_poll(error,handles);

fetch all the callers data and ship it.

=cut  

sub method_poll {
    my $self = shift;
#   warn "Session Status: ".$session->dump();
    my $handles = shift;
    my %data;
    for my $handle (@$handles){
        my $pid = $self->session->{$handle};
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
