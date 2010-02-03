#!/usr/bin/perl -w
use strict;
use FindBin;
use lib "$FindBin::Bin/../lib";
use lib "$FindBin::Bin/../../support/lib";
use CGI::Fast;
use Qooxdoo::SessionLite;
use Qooxdoo::JSONRPC;
use remOcular::Config;

$Qooxdoo::JSONRPC::debug=1;
$Qooxdoo::JSONRPC::service_path='remOcular::JsonRpc';


'$Revision$ ' =~ /Revision: (\S*)/;
my $Revision = $1;

my %opt;

sub main {
    my $cfg_file = shift @ARGV;
    if (not $cfg_file or not -r $cfg_file){
        die "usage: jsonrpc.pl path/to/remocular.cfg\n";
    }
    my $cfg_parser = new remOcular::Config(file=>$cfg_file);
    my $cfg;
    my $cfg_mod = 0;
    my $user = (getpwuid($<))[0];
    my $tmp = $ENV{TEMP} || $ENV{TMP} || "/tmp";
    my $session_dir = $tmp."/remocular_session_$user";
    my $count = 0;
    my $PATH = $ENV{PATH};
    while (my $cgi = new CGI::Fast){
        # it seems fastcgi can change the path ...
        # not what we want really.
        $ENV{PATH} = $PATH;
        my $session = new Qooxdoo::SessionLite($cgi, $session_dir, 3600);
    	my $cfg_mod_new = -M $cfg_file;
    	if (not defined $cfg or $cfg_mod_new < $cfg_mod){
	        $cfg = $cfg_parser->parse_config();
    	    $cfg_mod = $cfg_mod_new;
	    }
        $session->{__cfg} = $cfg;
        Qooxdoo::JSONRPC::handle_request ($cgi, $session, ['remocular']);
    }
}

main();

1;


__END__

=head1 NAME

jsonrpc.pl - JSON RPC service for SmokeTrace

=head1 SYNOPSIS

 /var/www/smoketrace/jsonrpc.fcgi:
 #!/bin/sh
 exec /opt/THD/bin/jsonrpc.pl

=head1 DESCRIPTION

Use a wrapper in the root of the webserver holding the SmokeTrace application to
run this script. The script can run either as a cgi (slow) or as a fastcgi (super fast)
it will autodetect what mode you are running it in.

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

 2009-10-31 to 1.0 first version

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
