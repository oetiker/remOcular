package remOcular::Plugin::Top;
use strict;
use base 'remOcular::Plugin';
use remOcular::PluginHelper;
use Sys::Hostname;

=head1 NAME

remOcular::Plugin::Top - Top the Process Monitor

=head1 SYNOPSIS

 use remOcular::Plugin::Top

=head1 DESCRIPTION

Run the top process monitor

=cut

use Carp;
use vars qw($VERSION);
'$Revision: 363 $ ' =~ /Revision: (\S*)/;
my $VERSION = "0.$1";


sub get_config {
    my $self = shift;
    return {
        menu => 'Top',
        title=> "Top Process Monitor",
        form_type => 'top',
        form=> [
            {
                type=> 'Spinner',
                label=> 'Interval',
                name=> 'interval',
                min => 1,
                max => 60,
                initial=> 5,
                required=> 1,
            },
            {
                type=> 'CheckBox',
                label=> 'Show Threads',
                name=>  'threads',
                initial=> 0
            },
        ],
        byline => qq{Version $VERSION, 2009-12-11, by Tobi Oetiker},
        link  => qq{http://tobi.oetiker.ch},
        about => <<ABOUT_END,
Online variant of <code>top</code> the unix commandline process viewer.
ABOUT_END

    }
}

sub check_params {
    my $self = shift;
    my $params = shift;
    my $error;
    if (int($params->{interval}||0) < 1){
        return "Interval must be at least 1 second";
    }
    return {
        table => [
            { 
                label    => 'PID',
                tooltip  => 'Process ID',
                width    => 2,
            },
            { 
                label    => 'USER',
                tooltip  => 'User ID',
                width    => 2,
            },
            { 
                label    => 'PR',
                tooltip  => 'Priority',
                width    => 1,
            },
            { 
                label    => 'NI',
                tooltip  => 'Nice Level',                  
                width    => 1,
            },
            { 
                label    => 'VIRT',
                tooltip  => 'Virtual Memory',
                width    => 3,
            },
            { 
                label    => 'RES',
                tooltip  => 'Resident Memory',                  
                width    => 3,
            },
            { 
                label    => 'SHR',
                tooltip  => 'Shared Memory',                  
                width    => 3,
            },
            { 
                label    => 'S',
                tooltip  => 'State (D = uninterruptible sleep, R = running, S = sleeping, T = traced or stopped, Z = zombie',
                width    => 1,
            },
            { 
                label    => 'CPU',
                tooltip  => 'CPU Usage',                  
                width    => 1,
            },
            {
                label    => 'CPU Spark',
                width    => 4,
                data => {
                    processor  => 'STACK',
                    source_col => 8,
                    key_col => 0,
                    depth => 30
                },
                presentation => {
                    renderer   => 'SPARKLINE',
                    line_color => '#484',
                    spark_color => '#f00',
                    line_width => 0.5,
                    spark_radius => 1,
                    single_scale => 1
                }
            },
            { 
                label    => 'MEM',
                tooltip  => 'Memory Usage (RES)',
                width    => 2,
            },
            { 
                label    => 'TIME',
                tooltip  => 'Total CPU Time' ,
                width    => 3,
            },
            { 
                label    => 'COMMAND',
                tooltip  => 'Command Line',                  
                width    => 4,
            }
        ],
        title => "Top Processes on ".hostname(),
        interval => int($params->{interval})*1000,
    }
}


sub start_instance {
    my $self = shift;
    my $outfile = shift;
    my $params = shift;  
    open(my $fh,'-|','/usr/bin/top','-b','-d',int($params->{interval}),
        ($params->{threads} ? '-H' : ())) or do {
        remOcular::PluginHelper::save($outfile,"#ERROR\t$!\n");
        return;
    };
    my $data = "#CLEAR\n";
    my $ok = 0;
    while(<$fh>){
        chomp;
        s/^\s+//;
        s/\s+$//;
        if (/^\d+/){
            $ok = 1;            
            $data .= join("\t", "#PUSH", split(/\s+/,$_,12))."\n";
        }
        if ($ok and /^\s*$/){            
            my $ratio = remOcular::PluginHelper::save($outfile,$data);
            # it seems noone is reading us anymore, so stop;
            if ($ratio < 0.2){
                unlink $outfile;
                exit 0;
            }
            $ok = 0;
            $data = "#CLEAR\n";
        }
    }
    remOcular::PluginHelper::save($outfile,"#STOP\n");
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
