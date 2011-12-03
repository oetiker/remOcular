package remOcular::Plugin::TraceRoute;
use strict;
use base 'remOcular::Plugin';
use IPC::Run qw(run timeout new_chunker);

=head1 NAME

remOcular::Plugin::TraceRoute - TraceRoute Interface

=head1 SYNOPSIS

 use remOcular::Plugin::TraceRoute

=head1 DESCRIPTION

Run the traceroute network monitor

=cut

use Carp;
use vars qw($VERSION);
'$Revision: 363 $ ' =~ /Revision: (\S*)/;
my $VERSION = "0.$1";


sub get_config {
    my $self = shift;
    return {
        menu => 'TraceRoute',
        title=> "TraceRoute",
        form_type => 'left',
        form=> [
            {
                type=> 'TextField',
                label=> 'Host',
                name=> 'host',
                required=> 1,
            },
            {
                type=> 'Spinner',
                label=> 'Rounds',
                name=> 'rounds',
                min=> 1,
                max=> 30,
                initial=> 3
            },
            {
                type=> 'Spinner',
                label=> 'Interval',
                name=> 'interval',
                min=> 1,
                max=> 30,
                initial=> 5
            },
            {
                type=> 'SelectBox',
                label=> 'IP Level',
                name=>  'iplevel',
    	        initial => 'IPv4',
                data=> [qw(IPv4 IPv6)],
            },               
            {
                type=> 'SelectBox',
                label=> 'Method',
                name=>  'method',
                data=> [qw(default icmp tcp tcpconn udp udplite raw)],
            },               
            {
                type=> 'TextField',
                label=> 'Source',
                name=> 'source',
                required=> 0,
            }
        ],
        byline => qq{Version $VERSION, 2009-12-11, by Tobi Oetiker},
        link  => qq{http://tobi.oetiker.ch},
        about => <<ABOUT_END,
Online variant of <code>traceroute</code>.
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
    elsif (int($params->{rounds}||1) > 30){
        return "Not more than 30 rounds allowed";
    }
    elsif (not defined $params->{host}){
        return "No Hostname defined";
    }
    return {
        table => [
            { 
                label    => 'Hop',
                tooltip  => 'Hop Count',
                width    => 1,                
            },
            { 
                label    => 'Host',
                tooltip  => 'Hostname',
                width    => 3,
            },
            { 
                label    => 'Ip',
                tooltip  => 'IP Number',
                width    => 3,
            },
            { 
                label    => 'RTT Now',
                tooltip  => 'Round Trip Time',
                width    => 2,
            },
            {
                label    => 'Count',
                tooltip  => 'Number of traces',
                width    => 1,
                data     => {
                    processor  => 'COUNT',
                    key_col    => 2
                },
                presentation => {
                    renderer => 'NUMBER',
                    decimals => 0
                }
            },
            {
                label    => 'Avg',
                tooltip  => 'Average Round Trip Time',
                width    => 2,                  
                data     => {
                    processor  => 'AVG',
                    source_col => 3,
                    key_col    => 2
                }
            },
            {
                label    => 'Min',
                tooltip  => 'Minimum Round Trip Time',
                width    => 2,
                data   => {
                    processor  => 'MIN',
                    source_col => 3,
                    key_col    => 2
                }
            },
            {
                label    => 'Max',
                tooltip  => 'Maximum Round Trip Time',
                width    => 2,
                data => {
                    processor  => 'MAX',
                    source_col => 3,
                    key_col    => 2
                }
            },
            {
                label    => 'Med',
                tooltip  => 'Median Round Trip Time',
                width    => 2,
                data => {
                    processor  => 'MEDIAN',
                    source_col => 3,
                    key_col    => 2
                }
            },
            {
                label    => 'StDev',
                tooltip  => 'Standard Deviation Round Trip Time',
                width    => 2,
                data => {
                   processor  => 'STDDEV',
                   source_col => 3,
                   key_col    => 2
                }
            },
            {
                label    => 'Average Plot',
                tooltip  => 'Average and Standard Deviation',
                width    => 4,
                data => {
                    processor  => 'MAP',
                    structure => {
                        mainbar => {
                            processor  => 'AVG',
                            source_col => 3,
                            key_col    => 2
                        },
                        stackbar => {
                            processor  => 'STDDEV',
                            source_col => 3,
                            key_col    => 2
                        }
                    }
                },
                presentation => {
                    renderer   => 'TWOBARPLOT',
                    mainbar => {
                        fill => '#f88',
                        border => '#844'
                    },
                    stackbar => {
                        fill => '#88f',
                        border => '#448'
                    }
                }
            }                                 
        ],
        title => "TraceRoute to $params->{host}",
        interval => int(1000),
    }
}


sub start_instance {
    my $self = shift;
    my $outfile = shift;
    my $params = shift;  
    my $bin =  '/usr/sbin/traceroute';
    if (not -x $bin){
        $self->save($outfile,"#ERROR\t$bin not found\n");
        return;
    }
    for (my $r=0;$r<$params->{rounds};$r++){
        my @cmd = ( '/usr/sbin/traceroute','-q','1',
                    '-M',$params->{method} );
        if ( $params->{source} ){
            push @cmd, ('-s',$params->{source});
        }
        push @cmd, ($params->{iplevel} =~ /IPv6/ ? '-6' : '-4');
        push @cmd, $params->{host};
        
        my $ok = 0;   

        my $out_handler = sub {
            local $_ = shift @_;
            chomp;
            s/^\s+//;
            s/[()]//g;
            s/ ms//;
            if (/^\d+/){
                $ok = 1;            
                my @row = split(/\s+/,$_);
                unshift @row,$row[0];
                $row[0]--;                
                my $data = join("\t", @row)."\n";
                my $ratio = $self->append_data($outfile,$data);
            }
        };

        my $err_handler = sub {
            local $_ = shift @_;
            chomp;
            $self->append_data($outfile,'#ERROR'."\t"."Note:".$_."\n");                
        };
        
        eval {
            run(\@cmd,'>',new_chunker,$out_handler,
                  '2>',new_chunker,$err_handler)
        };

        if ($@){
            $self->append_data($outfile,"#ERROR\tRunning traceroute: $@\n");
            last;
        };

        if (not $ok){
            last;
        }
        sleep $params->{interval};
    }
    $self->append_data($outfile,"#STOP\n");
}

1;

__END__

=back

=head1 COPYRIGHT

Copyright (c) 2009-2011 by OETIKER+PARTNER AG. All rights reserved.

=head1 LICENSE

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

=head1 AUTHOR

S<Tobias Oetiker E<lt>tobi@oetiker.chE<gt>>

=head1 HISTORY

 2009-11-06 to 1.0 first version for Smoketrace

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
