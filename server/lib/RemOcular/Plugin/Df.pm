package RemOcular::Plugin::Df;
use strict;
use base 'RemOcular::Plugin';
use RemOcular::PluginHelper;
use Sys::Hostname;

=head1 NAME

RemOcular::Plugin::Df - DiskFree Probe

=head1 SYNOPSIS

 use RemOcular::Plugin::Df

=head1 DESCRIPTION

Run the df disk free reporter.

=cut

use Carp;
use vars qw($VERSION);
'$Revision: 337 $ ' =~ /Revision: (\S*)/;
my $VERSION = "0.$1";

sub get_config {
    my $self = shift;
    return {
        menu => 'DiskFree',
        title => 'Diskfree Plugin',
        byline => qq{Version $VERSION, 2009-12-11, by Tobi Oetiker},
        link  => qq{http://tobi.oetiker.ch},
        about => <<ABOUT_END,
The Diskfree plugin shows all the mounted file systems
as reported by the <code>df</code> command.
ABOUT_END
    }
}

sub check_params {
    my $self = shift;
    my $params = shift;
    # no params to  check here, so we are just happy as is
    return {
        table => [
            { 
                label    => 'Filesystem',
                tooltip  => 'Filesystem',
                width    => 6,
            },
            { 
                label    => 'Blocks',
                tooltip  => 'Total Blocks (1 Block = 1024 Byte)',
                width    => 2,
            },
            { 
                label    => 'Used',
                tooltip  => 'Used Blocks',
                width    => 2,
            },
            { 
                label    => 'Free',
                tooltip  => 'Free Blocks',                  
                width    => 2,
            },
            { 
                label    => 'Capacity',
                tooltip  => 'Used Capacity',
                width    => 1,
            },
            {
                label    => 'Capacity Chart',
                width    => 4,
                data => {
                    processor  => 'PASSTHROUGH',
                    source_col => 4,
                    key_col    => 0
                },
                presentation => {
                    renderer   => 'BARPLOT',
                    fill => '#88f',
                    border => '#448'
                }
      		},
            { 
                label    => 'Mountpoint',
                tooltip  => 'Mountpoint',                  
                width    => 4,
            }
        ],
        title => "DiskFree on ".hostname(),
        # this runs only once, go get it!
        interval => 250
    };
}


sub start_instance {
    my $self = shift;
    my $outfile = shift;
    my $params = shift;  
    my $data = '';
    open(my $fh,'-|','/bin/df','-k','-P') or do {
       RemOcular::PluginHelper::save($outfile,"#ERROR\t$!\n");
       return;
    };
    my $ok = 0;
    my $first=<$fh>;
    while(<$fh>){
        chomp;
        s/^\s+//;
        s/(\d+)\s*%/$1/g;
        $data .= join("\t", "#PUSH", split(/\s+/,$_,6))."\n";
    }
    close $fh;
    $data .= "#STOP\n";
    RemOcular::PluginHelper::save($outfile,$data);
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
