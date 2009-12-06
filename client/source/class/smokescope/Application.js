/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */

/* ************************************************************************
#asset(smokescope/*)
************************************************************************ */

/**
 * This is the main application class of your custom application "smokescope"
 */
qx.Class.define("smokescope.Application", {
    extend : qx.application.Standalone,
    members : {
        /**
         * This method contains the initial application code and gets called
         * during startup of the application
         */
        main : function() {
            // Call super class
            this.base(arguments);
            qx.Class.patch(qx.bom.History,smokescope.patch.HistoryEncoder);
            // Enable logging in debug variant
            if (qx.core.Variant.isSet("qx.debug", "on")){
                // support native logging capabilities, e.g. Firebug for Firefox
                qx.log.appender.Native;
                // support additional cross-browser console. Press F7 to toggle visibility
                qx.log.appender.Console;
            };

            smokescope.util.Server.getInstance().setLocalUrl('http://localhost/~oetiker/smoketrace/');

            var root = new qx.ui.container.Composite(new qx.ui.layout.Dock());
            this.getRoot().add(root,{left: 0, top:0, right: 0, bottom: 0});

            root.add(new qx.ui.basic.Label(this.tr("SmokeTrace")).set({
                font: 'hugeTitle',
                textColor: '#bfbfbf',
                alignX: 'center',
                alignY: 'middle'
            }),{
                edge: 'center'
            });

            new smokescope.ui.Menu();
        }
    }
});
