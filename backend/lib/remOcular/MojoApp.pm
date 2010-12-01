package remOcular::MojoApp;
use strict;
use warnings;

use remOcular::JsonRpcService;
use remOcular::Config;
use remOcular::Session;

use base 'Mojolicious';

__PACKAGE__->attr(cfg => sub {
    my $self = shift;
    my $conf = remOcular::Config->new( 
        file=> $ENV{REMOCULAR_CONF} || $self->home->rel_file('etc/remocular.cfg')
    );
    return $conf->parse_config();
});

sub startup {
    my $self = shift;

    $self->log->path($self->cfg->{General}{log_file})
	if $self->cfg->{General}{log_file};
     
    $self->secret($self->cfg->{General}{secret});

    my $r = $self->routes;

    $self->app->hook(before_dispatch => sub {
        my $self = shift;
        $self->stash->{'mojo.session'} ||= {};
        my $session = remOcular::Session->new(
            id=>$self->stash('mojo.session')->{id}
        );
        $self->stash('mojo.session')->{id} = $session->id;
        $self->stash('rr.session',$session);
    });


    my $services = {
        remocular => new remOcular::JsonRpcService(
            cfg       => $self->cfg,   
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
    
    $SIG{__WARN__} = sub {
        local $SIG{__WARN__};
        $self->log->info(shift);
    };

    if ($ENV{REMOCULAR_SOURCE}){
        $self->static->root($self->home->rel_dir('../frontend'));
        $r->get('/' => sub { shift->redirect_to('/source/') });
        $r->get('/source/' => sub { shift->render_static('/source/index.html') });

        my $qx_static = Mojolicious::Static->new();

        $r->route('(*qx_root)/framework/source/(*more)')->to(
            cb => sub {
                my $self = shift;
                my $qx_root = $self->stash('qx_root');
                $qx_static->root('/'.$qx_root);
                $qx_static->prefix('/'.$qx_root);
                return $qx_static->dispatch($self);
            }    
        );
    } else {
        $r->get('/' => sub { shift->render_static('index.html') });    
    }
}

1;
