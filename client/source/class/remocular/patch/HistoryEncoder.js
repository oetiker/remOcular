/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Relaxed encoding of argument make them more readable
 */

qx.Mixin.define("smokescope.patch.HistoryEncoder",{
    members: {
        _encode : function (value){
            if (qx.lang.Type.isString(value)) {
                return window.encodeURI(value);
            }
    
            return "";
        }
    }
});
