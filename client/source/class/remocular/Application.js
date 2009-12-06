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
                backgroundColor: '#fff'
            });
            this.getRoot().add(root,{left: 0, top:0, right: 0, bottom: 0});

            var logo = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                cursor  : 'pointer',
                opacity : 0.7
            }).set({
                allowGrowX: false,
                allowGrowY: false,
                alignY: 'middle',
                alignX: 'center'
           });

            logo.add(new qx.ui.basic.Label("rem◎cular").set({
                font: 'hugeTitle',
                textColor: '#aaa',
                alignX: 'left',
                paddingRight: 40
            }));

            logo.add(new qx.ui.basic.Label(this.tr("your remote eye in the cloud | www.remocular.org")).set({
                marginTop: -10,
                font: 'smallTitle',
                textColor: '#aaa',
                alignX: 'right'
            }));

            logo.addListener('click', function(e) {
                qx.bom.Window.open('http://www.remocular.org/v/VERSION', 'remoscope.org');
            });

            logo.addListener('mouseover', function(e) {
                this.setOpacity(1);
            }, logo);

            logo.addListener('mouseout', function(e) {
                this.setOpacity(0.7);
            }, logo);

            root.add(logo,{
                edge: 'center'
            });

            new remocular.ui.Menu();
        }
    }
});
