package SmokeScope::Plugin::MpStat;
use strict;
use base 'SmokeScope::Plugin';
use SmokeScope::PluginHelper;
use Sys::Hostname;
use IPC::Run qw(run timeout new_chunker);

=head1 NAME

SmokeScope::Plugin::MpStat - More Details on your CPU use than you ever wanted to know

=head1 SYNOPSIS

 use SmokeScope::Plugin::Top

=head1 DESCRIPTION

Run the top process monitor

=cut

use Carp;
use vars qw($VERSION);
'$Revision: 275 $ ' =~ /Revision: (\S*)/;
my $VERSION = "0.$1";

sub _cpu_count {
    my $cpu_count = 0;
    if (open (my $fh, "</proc/cpuinfo")){
       while (<$fh>){
         /^processor\s+:\s+\d+$/ and $cpu_count++;
       };
       close $fh;
       $cpu_count--;
    }
    else {
       return 0;
    }
    return $cpu_count;
}

sub get_config {
    my $self = shift;
    my $cpu_count = _cpu_count();
    my $pct = {
        renderer   => 'NUMBER',
        decimals   => 2,
        postfix    => ' %'
    };
           
    return {
       menu => 'MpStat',
       task => {
           plugin  => 'MpStat',
           title=> "CPU Statistics for ".hostname(),
   	   form_type => 'top',
           form=> [
               {
                    type=> 'Spinner',
                    label=> 'Interval',
                    name=> 'interval',
                    min => 1,
                    max => 60,
                    initial=> 2,
                    required=> 1
               },
               {
                    type=> 'Spinner',
                    label=> 'Rounds',
                    name=> 'rounds',
                    min => 1,
                    max => 60,
                    initial=> 40,
                    required=> 1
               }
           ],
           table => [
                { 
                  label    => 'Prop',
                  tooltip  => 'Property',
                  width    => 2,
                },
                { label => 'All',
                  width => 2,
                  presentation => $pct
                },                
                { label    => 'SparkLine',
                  width    => 4,
                  data => {
                    processor  => 'STACK',
                    source_col => 1,
                    key_col => 0,
                    depth => 30
                  },
                  presentation => {
                    renderer   => 'SPARKLINE',
                    line_color => '#484',
                    spark_color => '#f00',
                    line_width => 0.5,
                    spark_radius => 1.5,
                    single_scale => 0
                  }
		},
                { label    => 'Bar Chart',
                  width    => 4,
                  data => {
                    processor  => 'PASSTHROUGH',
                    source_col => 1,
                    key_col => 0
                  },
                  presentation => {
                    renderer   => 'BARPLOT',
                    fill => '#8f8',
                    border => '#484',
                  }
		},
                map {
                  { 
                      label    => 'CPU '.$_,
                      width    => 2,
                      presentation => $pct
                  }
                } (0..${cpu_count})
                                               
           ]
      }
   }
}

sub check_params {
    my $self = shift;
    my $params = shift;
    my $error;
    if (int($params->{interval}) < 1){
        $error = "Interval must be at least 1 second";
    }                
    return (
        "MP Stats for ".hostname(),        
        int(1000),
        $error
    )
}


sub start_instance {
    my $self = shift;
    my $outfile = shift;
    my $params = shift;  
    my $bin =  '/usr/bin/mpstat';
    my $cpu_count = _cpu_count();
    if (not -x $bin){
        SmokeScope::PluginHelper::save($outfile,"#ERROR\t$bin not found\n");
        return;
    }
    my @cmd = ( '/usr/bin/mpstat','-P','ALL',$params->{interval},$params->{rounds} );
        
        my $ok = 0;   
        my %store;
        my @cols;
        my $out_handler = sub {
            local $_ = shift @_;
            chomp;
            if (s/^.+?\s+(CPU|all|\d+)\s+/$1 /){
                my @line = split;
                my $key = shift @line;
                if ($key eq 'CPU'){                 
                    @cols = @line;
                    map { s/^%// } @cols;
                } else {
                    for my $col (@cols){
                        $store{$key}{$col} = pop @line;
                    } 
                }
             }
             elsif (/^\s*$/){
                my $data = '';
                my $row = 0;
                for my $type (@cols){
                    $data .= $row."\t".$type."\t".$store{all}{$type};
                    for my $cpu (0..${cpu_count}){
                        $data .= "\t".$store{$cpu}{$type};
                    }
                    $data .= "\n";
                    $row++;
                }
                SmokeScope::PluginHelper::save($outfile,$data);
            }
        };

        my $err_handler = sub {
            local $_ = shift @_;
            chomp;
            SmokeScope::PluginHelper::save($outfile,'#ERROR'."\t"."Note:".$_."\n");                
        };
        
        eval {
            run(\@cmd,'>',new_chunker,$out_handler,
                  '2>',new_chunker,$err_handler)
        };

        if ($@){
            SmokeScope::PluginHelper::save($outfile,"#ERROR\tRunning mpstat: $@\n");
            last;
        };

    SmokeScope::PluginHelper::save($outfile,"#STOP\n");
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

 2009-12-01 to 1.0 first version for Smoketrace

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
