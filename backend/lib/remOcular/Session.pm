package remOcular::Session;
use strict;
use warnings;

use Digest::MD5;
use Storable qw(fd_retrieve lock_retrieve store_fd);
use Carp;
use Fcntl qw(:flock);
use Time::HiRes qw(usleep gettimeofday);

=head1 NAME

remOcular::Session - Simple Session handler race resistant

=head1 SYNOPSIS

 use CGI;
 use remOcular::Session;
 my $sess = new remOcular::Session(id=>?);
 my $value = $sess->param('key');
 $sess->param('key',$value);
 my $id = $sess->id();

=head1 DESCRIPTION

This is a simple file based session manager. It supports only a
small subset of L<CGI::Session> functionality. Its main advantage is, that
it is race resistant in the sense that it merges param settings on disk. It
uses L<Storable> as its on-disk format.

=cut

our $VERSION   = '0.3';

use Mojo::Base -base;
use Carp;

my $user = (getpwuid($<))[0];

has 'id' => sub {
  my $md5 = new Digest::MD5();
  $md5->add(rand());
  return $md5->hexdigest();         
};

has 'path' => '/tmp/remocular_session_'.$user;
has 'clean_interval' => 600;
has 'lock_timeout' => 1.5;
has 'session_timeout' => 300;


=head1 METHODS


=head2 my $sess = remOcular::Session->new(id=>?)

The 'new' method expects the session id as input. If no id is provided, a new id gets created.

=cut

sub new {
    my $self = shift->SUPER::new(@_);
    $self->{_file} = $self->path.'/'.$self->id.'.session';
    _mkdirp($self->path);
    my $clean_check = $self->path.'/LAST_SESSSION_CLEAN';
    my $last_clean = time - ((stat $clean_check)[9] || 0);
    if ( $last_clean > $self->clean_interval ){
        open (my $x, ">", $clean_check );
        $self->_cleandir();
    }
    return $self;
}

# perl impementation of mkdir -p
sub _mkdirp {
    my $path = shift;
    if (not -d $path){
        my $dir = '';
        while ($path =~ s{^(/*[^/]+)}{}){
            $dir .= $1;
            next if -d $dir;
            mkdir $dir;
        }
    };
}

# remove old session files from the session directory
sub _cleandir {
    my $self = shift;
    my $path = $self->path;
    my $now = time();
    my $maxage = $self->session_timeout;
    for my $file (<$path/*.session>){
        my $last = (stat $file)[9];
        next if not $last;
        if ($now - $last > $maxage){
            unlink $file;
        }
    }
}

# lock the session file, fetch current data, run callback, store data

sub _exclusive_data_op {
    my $self = shift;
    my $operation = shift;
    my $writeback = shift;
    my $file = $self->{_file};
    my $fh;
    my $locktype = $writeback ? (LOCK_EX|LOCK_NB) : ( LOCK_SH|LOCK_NB );
    if ( open ($fh, '+>>' , $file) ) {
        my $start = scalar gettimeofday();
        while (1) {
            last if flock($fh, $locktype);
            my $elapsed = scalar gettimeofday() - $start;
            croak "Session.$$ failed to lock $file for $elapsed s" if $elapsed > $self->lock_timeout;
            usleep(50*1000) # try again in 50ms;
        }
        if ($remOcular::Session::debug){
            my $elapsed = scalar gettimeofday() - $start; 
            carp "Session.$$ got lock on $file after $elapsed s" if $elapsed > 0.02;
        }
        binmode($fh);
        my $size = (stat $fh)[7]; # size in bytes
        if ($size > 0){
            seek $fh, 0, 0;
            $self->{_data} = eval { fd_retrieve $fh };
            croak "Session.$$ Reading $file ($size): $@" if $@;
        } else {
            $self->{_data} = {};
        }
        $operation->($self->{_data});
        if ($writeback){
            truncate $fh, 0;
            seek $fh, 0, 0;
            store_fd($self->{_data}, $fh) or do {
                croak "Session.$$ problem saveing $file: $!";
            };
            carp "Session.$$ saved $file\n" if $remOcular::Session::debug;
        }
        close $fh;
        $self->{_mtime} = (stat $file)[9];
    }
    else {
        croak "Session.$$ failed to operate on $file";
    }
}

=head2 my $value = $sess->param($key); $sess->param($key,$value)

Set and get a session parameter. This command acts on the disk copy of the
session. Locking makes this race-save in contrast to CGI::Session.

=cut

sub param {
    my $self = shift;
    my $key = shift;
    my $value = shift;
    if (not defined $value){
        my $file = $self->{_file};
        my $mtime = (stat $file)[9];
        if (-r $file and not -z $file and (not defined $self->{_mtime} or $self->{_mtime} < $mtime)){
            # exclusive data op will re-read the session ...
            $self->_exclusive_data_op( sub { 1 }, 0);
        };
    }
    else {
        $self->_exclusive_data_op( sub {
            shift->{$key}=$value;
            carp "Session.$$ set $key => $value\n" if $remOcular::Session::debug;
        },1);
    }
    return $self->{_data}{$key};
}

=head2 $sess->clear([$key1,$key2]) or $sess->clear($key)

Clear one or several properties from the session.

=cut

sub clear {
    my $self = shift;
    my $keys = shift;
    $self->_exclusive_data_op( sub {
        my $d = shift;
        if (ref $keys eq 'ARRAY'){
            for (@$keys){
                carp "Session.$$ remove $_" if $remOcular::Session::debug;
                delete $d->{$_};
            }
        } else {
            carp "Session.$$ remove $keys" if $remOcular::Session::debug;
            delete $d->{$keys}
        }
    },1);
}

=head2 $sess->delete();

Delete the session completely.

=cut

sub delete {
    my $self = shift;
    unlink $self->{_file};
}

=head2 $sess->id();

Return the id.

=cut

sub id {
    my $self = shift;
    return $self->{_id};
}

1;

__END__

=head1 COPYRIGHT

Copyright (c) 2009 by OETIKER+PARTNER AG. All rights reserved.

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

 2010-11-29 to 0.2 second version for remOcular

=cut

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
