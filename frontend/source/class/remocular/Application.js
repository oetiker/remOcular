/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/* ************************************************************************
#asset(remocular/logo.png)
************************************************************************ */

qx.Class.define("remocular.Application", {
    extend : qx.application.Standalone,

    members : {
        /**
         * Launch the remocular application.
         *
         * @return {void} 
         */
        main : function() {
            // Call super class
            var HOME = 'http://www.remocular.org/v/#VERSION#';
            this.base(arguments);
            qx.Class.patch(qx.bom.History, remocular.util.MHistory);

            // add the hover mixin
            qx.Class.include(qx.ui.core.Widget, remocular.ui.MHoverFx);

            // Enable logging in debug variant
            if (qx.core.Environment.get("qx.debug")) {
                // support native logging capabilities, e.g. Firebug for Firefox
                qx.log.appender.Native;
                // support additional cross-browser console. Press F7 to toggle visibility
                qx.log.appender.Console;
            }

            remocular.util.Server.getInstance().setLocalUrl('http://localhost/~oetiker/remo/service/');

            var root = new qx.ui.container.Composite(new qx.ui.layout.Dock()).set({
                backgroundColor : '#fff',
                padding         : [ 5, 5, 5, 5 ]
            });

            this.getRoot().add(root, {
                left   : 0,
                top    : 0,
                right  : 0,
                bottom : 0
            });

            var logo = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                cursor  : 'pointer',
                opacity : 0.5
            }).set({
                allowGrowX : false,
                allowGrowY : false,
                alignY     : 'middle',
                alignX     : 'center'
            });

            logo.add(new qx.ui.basic.Image("remocular/logo.png"));

            logo.addListener('click', function() {
                qx.bom.Window.open(HOME, '_blank');
            });

            logo.addListenerOnce('appear', function() {
                var logoEl = logo.getContainerElement().getDomElement();

                var fadein = new qx.fx.effect.core.Fade(logoEl).set({
                    from : 0.5,
                    to   : 1
                });

                var fadeout = new qx.fx.effect.core.Fade(logoEl).set({
                    from : 1,
                    to   : 0.5
                });

                this.addHoverFx(fadein, fadeout);
            },
            logo);

            root.add(logo, { edge : 'center' });
            var copy = new qx.ui.basic.Label(this.tr('remOcular %1, Copyright %2 by Tobias Oetiker, OETIKER+PARTNER AG, GPL Licensed', '#VERSION#', '#YEAR#'));

            copy.set({
                cursor : 'pointer',
                alignX : 'right'
            });

            copy.addListener('click', function() {
                qx.bom.Window.open(HOME, '_blank');
            });

            root.add(copy, { edge : 'south' });
            var menu = new remocular.ui.Menu();
            menu.show();
        }
    }
});
