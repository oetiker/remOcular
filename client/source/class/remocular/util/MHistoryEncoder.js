/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Relaxed encoding of argument make them more readable
 */
qx.Mixin.define("remocular.util.MHistoryEncoder", {
    members : {
        /**
         * TODOC
         *
         * @param value {var} TODOC
         * @return {var | string} TODOC
         */
        _encode : function(value) {
            if (qx.lang.Type.isString(value)) {
                return window.encodeURI(value);
            }

            return "";
        }
    }
});