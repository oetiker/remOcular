package RemOcular::Base;
use strict;
use POSIX qw(strftime);

=head1 NAME

RemOcular::Base - Base Class for SmokeTrace Objects

=head1 SYNOPSIS

 package RemOcular::Demo;
 use base qw(RemOcular::Base);

 sub new {
     my $proto        = shift;
     my $class       = ref($proto) || $proto;
     my $self        = $class->SUPER::new({arg1=>qr/.+/,arg2=>qr/hello/},@_);
     # argument end up in $self->{__args}
     return $self;
 }
 
=head1 DESCRIPTION

This is the base class for all THD objects. Do not use it directly.

=cut

use Carp;
use vars qw($VERSION);
$VERSION   = '0.01';


=head1 METHODS

=over

=item $x->B<new>({named argument hash},@_)

The 'new' method expects a hash pointer as its first argument. The hash
contains keys for all parameter keys of the new method the values of the
hash are regular expressions, for checking the actual values.

=cut

sub new {
    my $proto        = shift;
    my $class       = ref($proto) || $proto;
    my $self = bless {}, $class;
    if ( ref $_[0] eq 'HASH' ){
        my $rules = shift @_;
        my %bag = ( %$rules );
        my %args = ( @_ );
        for my $key (keys %args){
            croak "parameter '$key' is not valid." unless $rules->{$key};
            croak "value $key->$args{$key} does not match pattern $rules->{$key}" 
                if ref $rules->{$key} eq 'Regexp' and $args{$key} !~ /$rules->{$key}/;
            delete $bag{$key};
        }
        for my $key (keys %bag){
            croak "required parameter '$key' is missing";
        }
    };
    $self->{__args} = { @_ };
    return $self;
}

1;

__END__

=back

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

 2008-04-24 to 1.0 first version for OSP
 2008-10-07 to 1.1 re-used for THD

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
