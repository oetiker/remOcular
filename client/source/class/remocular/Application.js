/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
   UtfCheck: äöü
************************************************************************ */

/* ************************************************************************
#asset(remocular/*)
************************************************************************ */

/**
 * This is the main application class of your custom application "remocular"
 */
qx.Class.define("remocular.Application", {
    extend : qx.application.Standalone,
    members : {
        /**
         * This method contains the initial application code and gets called
         * during startup of the application
         */
        main : function() {
            // Call super class
            this.base(arguments);
            qx.Class.patch(qx.bom.History,remocular.patch.HistoryEncoder);
            // Enable logging in debug variant
            if (qx.core.Variant.isSet("qx.debug", "on")){
                // support native logging capabilities, e.g. Firebug for Firefox
                qx.log.appender.Native;
                // support additional cross-browser console. Press F7 to toggle visibility
                qx.log.appender.Console;
            };

            remocular.util.Server.getInstance().setLocalUrl('http://johan.oetiker.ch/~oetiker/remocular/');

            var root = new qx.ui.container.Composite(new qx.ui.layout.Dock()).set({
                backgroundColor: '#fff',
                padding: [5,5,5,5]
            });
            this.getRoot().add(root,{left: 0, top:0, right: 0, bottom: 0});

            var logo = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                cursor  : 'pointer',
                opacity : 0.5
            }).set({
                allowGrowX: false,
                allowGrowY: false,
                alignY: 'middle',
                alignX: 'center'
           });

           logo.add(new qx.ui.basic.Image("remocular/logo.png"));

           logo.addListener('click', function(e) {
                qx.bom.Window.open('http://www.remocular.org/v/VERSION', 'remocular.org');
           });

           logo.addListenerOnce('appear',function(){
                var logoEl = logo.getContainerElement().getDomElement();

                var fadein = new qx.fx.effect.core.Fade(logoEl).set({
                    from: 0.5,
                    to: 1
                });
                var fadeout = new qx.fx.effect.core.Fade(logoEl).set({
                    from: 1,
                    to: 0.5
                });
            
                logo.addListener('mouseover', function(e) {
                    fadein.start();
                }, logo);

                logo.addListener('mouseout', function(e) {
                    fadeout.start();
                }, logo);
            });

            root.add(logo,{
                edge: 'center'
            });
            var copy = new qx.ui.basic.Label(this.tr('remOcular %1, Copyright %2 by Tobias Oetiker, OETIKER+PARTNER AG, GPL Licensed','1.0','2009'));
            copy.set({
                cursor: 'pointer',
                alignX: 'right'
            });
            copy.addListener('click', function(){
                qx.bom.Window.open('http://www.remocular.org/v/VERSION', 'remocular.org');
            });
            root.add(copy,{
                edge: 'south'
            });
            new remocular.ui.Menu();
        }
    }
});
