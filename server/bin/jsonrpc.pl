#!/usr/bin/perl -w
use strict;
use FindBin;
use lib "$FindBin::Bin/../lib";
use CGI::Fast;
use CGI::Session;
use Qooxdoo::JSONRPC;

$Qooxdoo::JSONRPC::debug=1;
$Qooxdoo::JSONRPC::service_path='RemOcular::JsonRpc';


'$Revision$ ' =~ /Revision: (\S*)/;
my $Revision = $1;

my %opt;

sub main {
#    my $cfg_file = shift @ARGV;
#    my $cfg_parser = new O2h::Config(file=>$cfg_file);
#    my $cfg;
#    my $cfg_mod = 0;
    my $user = (getpwuid($<))[0];
    my $tmp = $ENV{TEMP} || $ENV{TMP} || "/tmp";
    my $session_dir = $tmp."/remocular_session_$user";
    mkdir $session_dir if not -d $session_dir;
    my $count = 0;
    while (my $cgi = new CGI::Fast){
        my $session = new CGI::Session("driver:File", $cgi, {Directory=>$session_dir});
#    	my $cfg_mod_new = -M $cfg_file;
#    	if (not defined $cfg or $cfg_mod_new < $cfg_mod){
#	        $cfg = $cfg_parser->parse_config();
#    	    $cfg_mod = $cfg_mod_new;
#	    }
        if ( $count++ > 50 ){
            my $min_age = time() - 3600;
            for my $file (glob($session_dir.'/*')){
                if ((stat $file)[8] < $min_age){
                    unlink $file;
                }
            }
            $count = 0;
        }
#       $session->param('cfg',$cfg);
        Qooxdoo::JSONRPC::handle_request ($cgi, $session, ['remocular']);
    }
}

main;
1


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
