/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   GPL
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: öï
************************************************************************ */
/**
 * Two custom fonts for remocular. <code>hugeTitle</code> and <code>smallTitle</code>.
 */
qx.Theme.define("remocular.theme.Font", {
    extend : qx.theme.modern.Font,

    fonts : {
        hugeTitle : {
            size       : 130,
            lineHeight : 1.0,
            family : qx.core.Environment.get("os.name") == "osx" ?
                [ "Lucida Grande" ] :
                ((qx.core.Environment.get("os.name") == "win" &&
                (qx.core.Environment.get("os.version") == "7" ||
                qx.core.Environment.get("os.version") == "vista"))) ?
                [ "Segoe UI", "Candara" ] :
                [ "Tahoma", "Liberation Sans", "Arial", "sans-serif" ],
	    bold: true
        },

        smallTitle : {
            size       : 20,
            lineHeight : 1.0,
            family : qx.core.Environment.get("os.name") == "osx" ?
                [ "Lucida Grande" ] :
                ((qx.core.Environment.get("os.name") == "win" &&
                (qx.core.Environment.get("os.version") == "7" ||
                qx.core.Environment.get("os.version") == "vista"))) ?
                [ "Segoe UI", "Candara" ] :
                [ "Tahoma", "Liberation Sans", "Arial", "sans-serif" ],
            bold       : true
        }
    }
});