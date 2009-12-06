package RemOcular::Plugin;
use strict;

=head1 NAME

RemOcular::Plugin - Base Class for implementing SmokeTrace Plugins

=head1 SYNOPSIS

 package RemOcular::Plugin::Traceroute;
 use base qw(RemOcular::Plugin);

=head1 DESCRIPTION

Base class for all RemOcular Plugins.

=cut

use Carp;
use vars qw($VERSION);
'$Revision: 275 $ ' =~ /Revision: (\S*)/;
my $VERSION = "0.$1";

=head1 METHODS

=over

=item $x = RemOcular::Plugin::new();

Create an instnace of the plugin.

=cut

sub new {
    my $proto        = shift;
    my $class       = ref($proto) || $proto;
    my $self = bless {}, $class;
    return $self;
}

=item $x->B<get_config>();

The plugin can ask the user to provide configuration parameters. By default,
no parameters are specified.

=cut

sub get_config {
    my $self = shift;
    return {};
}

=item my ($title,$interval,$error) = $x->B<check_params>(param_hash);

Check the parameter set provided. Return the title of the window and the interval
the browser should poll for new values. If there is a problem with the parameters,
return an error.

=cut

sub check_params {
    my $self = shift;
    my $params = shift;
    die "implement your own check_params in your plugin";
}


=item $x->B<start_plugin>(filename,param_hash);

the server has forked us. All the plugin has todo now, is to run its data
gathering operation according to the parameters provided and write the
results to the filename provided.

The master process will read that file for new information whenever the
browser polls.

The format ofthe output file is as follows:


=cut

sub start_instance {
    my $self = shift;
    my $outfile = shift;
    my $params = shift;    
    die "provide your own!"
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
