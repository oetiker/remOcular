package remOcular::MojoApp;
use strict;
use warnings;

use remOcular::JsonRpcService;
use remOcular::Config;
use remOcular::Session;

use base 'Mojolicious';

sub startup {
    my $self = shift;
    my $r = $self->routes;

    my $conf = remOcular::Config->new( 
        file=> $ENV{REMOCULAR_CONF} || $self->home->rel_file('etc/remocular.cfg')
    );

    my $cfg = $conf->parse_config();

    $self->app->hook(before_dispatch => sub {
        my $self = shift;
        $self->stash->{'mojo.session'} ||= {};
        my $session = remOcular::Session->new(
            id=>$self->stash('mojo.session')->{id}
        );
        $self->stash('mojo.session')->{id} = $session->id;
        $self->stash('rr.session',$session);
    });

    $self->secret($cfg->{General}{secret});
    # log level 
    # $self->log->level('error');
    $self->static->root($self->home->rel_dir('../frontend'));

    my $services = {
        remocular => new remOcular::JsonRpcService(
            cfg       => $cfg,   
        ),
    };
            
    $r->route('/jsonrpc')->to(
        class       => 'Jsonrpc',
        method      => 'dispatch',
        namespace   => 'MojoX::Dispatcher::Qooxdoo',        
        # our own properties
        services    => $services,        
        debug       => 0,        
    );

    $r->get('/' => sub { shift->redirect_to('/source/index.html') });

    my $qx_static = Mojolicious::Static->new();

    $r->route('(*qx_root)/framework/source/(*qx_file)')->to(
        cb => sub {
            my $self = shift;
            my $qx_root = $self->stash('qx_root');
            my $qx_file = $self->stash('qx_file');
            $qx_static->root('/'.$qx_root);
            $qx_static->prefix('/'.$qx_root);
            return $qx_static->dispatch($self);
        }    
    );


}

1;
