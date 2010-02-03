package remOcular::PluginHelper;
use strict;
use Fcntl ':flock'; # import LOCK_* constants

=head1 NAME

remOcular::PluginHelper - Common function for SmokeTrace functions

=head1 SYNOPSIS

 use remOcular::PluginHelper;

 save($output,@items);

=head1 DESCRIPTION

Collection of helper functions.

=cut

use Carp;
use vars qw($VERSION);
'$Revision: 363 $ ' =~ /Revision: (\S*)/;
my $VERSION = "0.$1";

=head1 FUNCTIONS

=over

=item my ($ratio,$start_size,$end_size) = save($output,$data);

Adds the $data to the output file. Locking the file in the process
to make sure the reading and writing will not interfear with each other.

The ratio is the part of the file size contributed by this update.

=cut

sub save {
    my $output = shift;
    my $data = shift;    
    open(my $fh,">>$output") or return "Opening $output: $!\n";
    flock($fh,LOCK_EX);
    # maybe the file got trunkated in the meantime
    seek($fh,0,2); 
    my $start = tell($fh);    
    if ($data){
        print $fh $data;
        my $end = tell($fh);
        close $fh;
        my $ratio = ($end-$start)/$end; 
        return wantarray ? ($ratio,$start,$end) : $ratio;
    }
    close $fh;
    return wantarray ? (0,$start,$start) : 0;

}

1;

__END__

=back

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

 2009-11-01 to 1.0 first version

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
