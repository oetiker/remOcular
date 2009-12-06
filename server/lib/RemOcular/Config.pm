package SmokeScope::Config;
use strict;

=head1 NAME

SmokeScope::Config - The Configuration File

=head1 SYNOPSIS

 use SmokeScope::Config;

 my $parser = new SmokeScope::Config(file=>'/etc/SmokeTracessas/system.cfg');
 my $cfg = $parser->parse_config();
 my $pod = $parser->make_pod();

=head1 DESCRIPTION

Configuration reader for SmokeScopessas.

=cut

use vars qw($VERSION);
$VERSION   = '0.01';
use Carp;
use Config::Grammar;
use base qw(SmokeScope::Base);


=head1 METHODS

All methods inherited from L<SmokeScope::Base>. As well as the following:

=over

=item my $cfg = SmokeScope::Config->B<new>(file=>'/etc/SmokeTracessas/system.cfg');

Parses an THD System configuration file.

=cut

sub new {
    my $proto = shift;
    my $class = ref($proto) || $proto;
    my $self  = $class->SUPER::new({file=>1},@_);
    return $self;
}


=item $x->B<parse_config>(I<path_to_config_file>)

Read the configuration file and die if there is a problem.

=cut

sub parse_config {
    my $self = shift;
    my $cfg_file = shift;
    my $parser = $self->_make_parser();
    my $cfg = $parser->parse($self->{__args}->{file}) or croak($parser->{err});
    return $cfg;
}

=item $x->B<make_config_pod>()

Create a pod documentation file based on the information fro all config actions.

=cut

sub make_pod {
    my $self = shift;
    my $parser = $self->_make_parser();
    my $E = '=';
    my $footer = <<"FOOTER";

${E}head1 COPYRIGHT

Copyright (c) 2009 by OETIKER+PARTNER AG. All rights reserved.

${E}head1 LICENSE

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

${E}head1 AUTHOR

S<Tobias Oetiker E<lt>tobi\@oetiker.chE<gt>>

${E}head1 HISTORY

 2009-07-13 to 1.0 first version

FOOTER
    my $header = $self->_make_pod_header();    

    return $header.$parser->makepod().$footer;
}



=item $x->B<_make_pod_header>()

Returns the header of the cfg pod file.

=cut

sub _make_pod_header {
    my $self = shift;
    my $E = '=';
    return <<"HEADER";
${E}head1 NAME

service.cfg - The SmokeScopeSSAS configuration file

${E}head1 SYNOPSIS

 *** Database *** 
 db_dbi = any_dbi_but_only_pg_tested
 db_user = user
 db_pass = password
 evnt_hid = O2008

 *** Email ***
 from = info\@SmokeScope.ch
 bcc = tobi\@oetiker.ch
 smtp = localhost

${E}head1 DESCRIPTION

Configuration overview

${E}head1 CONFIGURATION

HEADER

}

=item $x->B<_make_parser>()

Create a parse config parser for THD.

=cut

sub _make_parser {
    my $self = shift;
    my $E = '=';
    my $grammar = {
        _sections => [ qw(Database Email CodeLetter RegLetter RegUpLetter SponsorLetter)],
        _mandatory => [qw(Database Email CodeLetter RegLetter RegUpLetter SponsorLetter)],
        Database => {
            _doc => 'Global configuration settings for SmokeScope',
            _vars => [ qw(dbi_dsn dbi_user dbi_pass evnt_hid) ],
            _mandatory => [ qw(dbi_dsn dbi_user dbi_pass evnt_hid) ],
            dbi_dsn  => { _doc => 'dbi connect string to access the thd database' },
            dbi_user => { _doc => 'database user with select privilege' },
            dbi_pass => { _doc => 'password for database user' },
            evnt_hid  => { _doc => 'event id of the current event' },
        },
        Email => {
            _doc => 'Configuration for the mail sender',
            _vars => [ qw(from bcc smtp) ],
            _mandatory => [ qw(from smtp) ],
            from => {_doc => 'sender address for code emails'},
            bcc => {_doc => 'send a copy of all email to this address'},
            smtp => {_doc => 'use this instead of localhost as your smtp server'}
        },
        CodeLetter => {
            _vars => [ qw(to cc subject) ],
            _sections => [qw(message) ],
            _mandatory => [qw(to subject message) ],
            message => { _text => {} },
        },
        RegLetter => {
            _vars => [ qw(to cc subject) ],
            _sections => [qw(message) ],
            _mandatory => [qw(to subject message) ],
            message => { _text => {} },
        },
        RegUpLetter => {
            _vars => [ qw(to cc subject) ],
            _sections => [qw(message) ],
            _mandatory => [qw(to subject message) ],
            message => { _text => {} },
        },
        SponsorLetter => {
            _vars => [ qw(to cc subject) ],
            _sections => [qw(message) ],
            _mandatory => [qw(to subject message) ],
            message => { _text => {} },
        },
    };
    my $parser =  Config::Grammar->new ($grammar);
    return $parser;
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

 2008-10-07 to 1.0 first version

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

