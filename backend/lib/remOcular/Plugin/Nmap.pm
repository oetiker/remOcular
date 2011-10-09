package remOcular::Plugin::Nmap;
use strict;
use base 'remOcular::Plugin';
use IPC::Run qw(run timeout new_chunker);

=head1 NAME

remOcular::Plugin::Nmap - Nmap Interface

=head1 SYNOPSIS

 use remOcular::Plugin::Nmap

=head1 DESCRIPTION

Run the Nmap security scanner

=cut

use Carp;
use vars qw($VERSION);
'$Revision: 363 $ ' =~ /Revision: (\S*)/;
my $VERSION = "0.$1";

sub get_config {
    my $self = shift;
    return {
        menu => 'Nmap',
        title=> 'Nmap',
        form_type => 'left',
        form=> [
            {
                type=> 'TextField',
                label=> 'network',
                name=> 'network',
                required=> 1,
            },
            {
                type=> 'SelectBox',
                label=> 'technique',
                name=> 'technique',
                data=> [qw(default -sS -sT -sA -sW -sM -sU -sN -sF -sX)],
            },
            {
                type=> 'Infos',
                label=> 'infos',
                name=> 'infos',
                data=> [qw(default -sV)],
            },
            {
                type=> 'SelectBox',
                label=> 'IP Level',
                name=>  'iplevel',
    	        initial => 'IPv4',
                data=> [qw(IPv4 IPv6)],
            },
        ],
        byline => qq{Version $VERSION, 2011-10-07, by Roman Plessl},
        link  => qq{http://roman.plessl.info/},
        about => <<ABOUT_END,
Online variant of <code>Nmap</code>.
ABOUT_END

    }
}

sub check_params {
    my $self = shift;
    my $params = shift;
    my $error;
    if (not defined $params->{network}){
        return "No network or host defined";
    }
    return {
        table => [
            { 
                label    => 'port',
                tooltip  => 'port',
                width    => 3,
            },
            { 
                label    => 'state',
                tooltip  => 'state',
                width    => 1,
            },
            { 
                label    => 'service',
                tooltip  => 'service',
                width    => 3,
            },
            { 
                label    => 'version',
                tooltip  => 'version',
                width    => 3,
            },
        ],
        title => "Nmap to $params->{network}",
    }
}


sub start_instance {
    my $self = shift;
    my $outfile = shift;
    my $params = shift;
    my $data = '';
    my $bin =  '/usr/bin/nmap';
    if (not -x $bin){
        $self->append_data($outfile,"#ERROR\t$bin not found\n");
        return;
    }
    my @cmd = ( $bin,'-sV');
    push @cmd, ($params->{iplevel} =~ /IPv6/ ? '-6' : '');
    push @cmd, $params->{network};
   
    open(my $fh, '-|', $bin, '-sV', $params->{network}) or do {
         $self->append_data($outfile,"#ERROR\t$!\n");
         return;
    };

    my $ok = 0;

    my $empty=<$fh>;
    my $starting=<$fh>;
    my $scanfor=<$fh>;
    my $hostis=<$fh>;
    my $notshown=<$fh>;
  
    while (<$fh>) {
       chomp;
       if (m/(^$|^Nmap.*$)/) {next;};
       $data .= join("\t", "#PUSH", split(/\s+/,$_,4))."\n";
    }
    close $fh;
    $data .= "#STOP\n";

    $self->append_data($outfile,$data);
}

1;

__END__

=back

=head1 COPYRIGHT

Copyright (c) 2011 by OETIKER+PARTNER AG. All rights reserved.

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

S<Roman Plessl E<lt>roman.plessl@oetiker.chE<gt>>

=head1 HISTORY

 2011-10-07 rp 1.0 first version for Nmap

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
