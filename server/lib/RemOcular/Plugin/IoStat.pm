package RemOcular::Plugin::IoStat;
use strict;
use base 'RemOcular::Plugin';
use RemOcular::PluginHelper;
use Sys::Hostname;
use IPC::Run qw(run timeout new_chunker);

=head1 NAME

RemOcular::Plugin::IoStat - IoStat Probe

=head1 SYNOPSIS

 use RemOcular::Plugin::IoStat

=head1 DESCRIPTION

Run the iostat disk free reporter.

=cut

use Carp;
use vars qw($VERSION);
'$Revision$ ' =~ /Revision: (\S*)/;
my $VERSION = "0.$1";


sub get_config {
    my $self = shift;
    my @cols = split /\s+/,(grep /Device/, split /\n/, `/usr/bin/iostat -x 1 1`)[0];
    shift @cols;
    my $src = 1;
    return {
       menu => 'IoStat',
       task => {
           plugin  => 'IoStat',
           title=> "IO Statistics",
           form_type => 'top',
           form => [
               {
                    type=> 'Spinner',
                    label=> 'Rounds',
                    name=> 'rounds',
                    min=> 1,
                    max=> 100,
                    initial=> 3
               },
               {
                    type=> 'Spinner',
                    label=> 'Interval',
                    name=> 'interval',
                    min=> 1,
                    max=> 60,
                    initial=> 5
               },
           ],
           table => [
                { 
                  label    => 'device',
                  tooltip  => 'Block Device Name',
                  width    => 2,
                },
                map {
                    {
                      label    => $_,
                      width    => 2
                    }
                } @cols
            ]
        }
    }
}

sub check_params {
    my $self = shift;
    my $params = shift;
    my $error;
    return (
        "Io Stat for ".hostname(),
        $params->{interval} * 1000,
        $error
    )
}

sub start_instance {
    my $self = shift;
    my $outfile = shift;
    my $params = shift;  

    my @cmd = ( '/usr/bin/iostat','-x',$params->{interval},$params->{rounds} );
    my $row = 0;
    my $out_handler = sub {
            local $_ = shift @_;
            chomp;
            if (m/^\S+\s+\d+\.\d+\s/){
                my @row = split(/\s+/,$_);
                my $data = $row."\t".join("\t", @row)."\n";
                $row++;
                RemOcular::PluginHelper::save($outfile,$data);
            }
            elsif (/^Device:/){
                $row = 0;
            }
    };

    my $err_handler = sub {
            local $_ = shift @_;
            chomp;
            RemOcular::PluginHelper::save($outfile,'#ERROR'."\t"."Note:".$_."\n");                
    };
        
    eval {
          run(\@cmd,'>',new_chunker,$out_handler,
                   '2>',new_chunker,$err_handler)
    };

    if ($@){
       RemOcular::PluginHelper::save($outfile,"#ERROR\tRunning iostat: $@\n");
    };
    RemOcular::PluginHelper::save($outfile,"#STOP\n");
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
