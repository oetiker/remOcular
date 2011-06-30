package remOcular::MojoApp;
use strict;
use warnings;

use remOcular::JsonRpcService;
use remOcular::Config;
use remOcular::Session;

use Mojo::Base 'Mojolicious';

has 'cfg' => sub {
    my $self = shift;
    my $conf = remOcular::Config->new( 
        file=> $ENV{REMOCULAR_CONF} || $self->home->rel_file('etc/remocular.cfg')
    );
    return $conf->parse_config();
};

sub startup {
    my $self = shift;

    my $gcfg = $self->cfg->{General};
    if ($self->mode ne 'development'){
        $self->log->path($gcfg->{log_file});
        if ($gcfg->{log_level}){    
            $self->log->level($gcfg->{log_level});
        }
    }

    $self->secret($gcfg->{secret});

    $self->app->hook(before_dispatch => sub {
        my $self = shift;
        my $rr_session;        
        if (my $id = $self->session('id')){
           warn "* re use id $id\n";
           $rr_session = remOcular::Session->new('id' => $id);
        }
        else {
           $rr_session = remOcular::Session->new();
           $self->session('id',$rr_session->id());
        }
        $self->stash('rr.session' => $rr_session);
    });

    my ($plugin_hand,$plugin_list) = $self->load_plugins();

    my $services = {
        remocular => new remOcular::JsonRpcService(
            plugin_hand => $plugin_hand,
            plugin_list => $plugin_list,
        )
    };
    $self->plugin('qooxdoo_jsonrpc',{
        services => $services
    });     
}


sub load_plugins {
    my $self = shift;       
    my %plugin_hand;
    my @plugin_list;
    my $cfg = $self->cfg;
    my $plug_hash = $cfg->{Plugin};
    for my $plug (sort {$plug_hash->{$a}{_order} <=> $plug_hash->{$b}{_order}} keys %$plug_hash){
        next if exists $plugin_hand{$plug};
        my $plug_file = $plug;
        $plug_file =~ s|::|/|g;
        eval { require $plug_file.'.pm' };
        if ($@){
            warn("Could not load $plug. Skipping it. ($@)");
            next;
        }
        my $hand = eval { ${plug}->new() };
        if ($@){
            warn("Could not instanciate $plug. Skipping it. ($@)");
            next;
        }
        $plugin_hand{$plug} = $hand;
        push @plugin_list,$plug;
    }
    return (\%plugin_hand,\@plugin_list);
}


1;
__END__
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

 2009-10-31 to Initial

=cut
  
1;

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

1;
