package remOcular::Plugin::Nmap;
use feature qw/switch/;
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
'$Revision: 1 $ ' =~ /Revision: (\S*)/;
my $VERSION = "0.9.$1";

sub get_config {
    my $self = shift;
    return {
        menu => 'Nmap',
        title=> 'Nmap',
        form_type => 'left',
        form=> [
            {
                type=> 'TextField',
                label=> 'Host',
                name=> 'host',
                required=> 1,
            },
            {
                type=> 'SelectBox',
                label=> 'Scan Technique',
                name=> 'scantechnique',
                data=> [ 'default' ,
                         'TCP SYN',
                         'TCP Connect',
                         'TCP ACK',
                         'TCP Window',
                         'TCP Maimon',
                         'UDP Scan',
                         'TCP Null',
                         'TCP FIN',
                         'TCP Xmax' ],
                initial=> 'default',
            },
            {
                type=> 'TextField',
                label=> 'Ports',
                name=> 'ports',
             },
            {
                type=> 'SelectBox',
                label=> 'IP Level',
                name=>  'iplevel',
                data=> [qw(IPv4 IPv6)],
    	        initial => 'IPv4',
            },
            {
                type=> 'SelectBox',
                label=> 'Infos',
                name=> 'infos',
                data=> [ 'disabled',
                         'normal',
                         'light',
                         'full' ],
                initial=> 'disabled',
            },
#            {
#                type=> 'Checkbox',
#                label=> 'remote NMAP',
#                name=> 'rnmap',
#            },
#            {
#                type=> 'TextField',
#                label=> 'Remote NMAP bin',
#                name=> 'nmap',
#            },
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
#    if (not defined $params->{rnmap}){
#        return "Error: No NMAP binary defined";
#    }
    if (not defined $params->{host}){
        return "Error: No host or network defined";
    }
    if ($params->{host} =~ m/!(^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))$/){
        return "Error: not an valid hostname or IP given";
    }

    return {
        table => [
            {
                label    => 'Port',
                tooltip  => 'port',
                width    => 1,
            },
            {
                label    => 'State',
                tooltip  => 'state',
                width    => 1,
            },
            {
                label    => 'Service',
                tooltip  => 'service',
                width    => 3,
            },
            {
                label    => 'Version',
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
    my $bin = '/usr/bin/nmap';
    if (not -x $bin){
        $self->append_data($outfile,"#ERROR\t$bin not found\n");
        return;
    }
    my @cmd;
    if ($params->{iplevel} =~ /IPv6/) {
        push @cmd, '-6';
    }
    given ($params->{'scantechnique'}) {
        when ( 'TCP SYN' )     { push @cmd, '-sS' }
        when ( 'TCP Connect' ) { push @cmd, '-sT' }
        when ( 'TCP ACK' )     { push @cmd, '-sA' }
        when ( 'TCP Window' )  { push @cmd, '-sW' }
        when ( 'TCP Maimon' )  { push @cmd, '-sM' }
        when ( 'UDP Scan' )    { push @cmd, '-sU' }
        when ( 'TCP Null' )    { push @cmd, '-sN' }
        when ( 'TCP FIN' )     { push @cmd, '-sF' }
        when ( 'TCP Xmas' )    { push @cmd, '-sX' }
    }
    given ($params->{infos}) {
        when ( 'normal' )      { push @cmd, '-sV' }
        when ( 'light' )       { push @cmd, '-sV --version-light' }
        when ( 'full' )        { push @cmd, '-sV --version-all' }
    }
    if ($params->{ports}) {
        push @cmd, "-p $params->{ports}";
    }
    push @cmd, "$params->{host}";

#    my $errorlog = Mojo::Log->new (
#        path  => '/tmp/nmap.log',
#        level => 'debug',
#    );
#    $errorlog->debug( '-|', "$bin" . ' '. join(" ", @cmd) );

    open(my $fh, '-|', "$bin" . ' ' . join(" ", @cmd) ) or do {
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
       if (m/(^$|^PORT.*$|^Nmap.*$|^Service detection performed.*$)/) {next;};
       if (m/^Service\sInfo:/) {
           $_ =~ s/Service\sInfo.*Host/Service_Info_Host/;
           $_ = "\t".'.'."\t".$_;
       }
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
