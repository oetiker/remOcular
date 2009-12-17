/* ************************************************************************
   Copyright: 2008, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * A thd specific rpc call
 */
qx.Class.define('remocular.util.HistoryIgnoreCounter', {
    extend : qx.core.Object,
    type : "singleton",

    construct : function() {
        this.base(arguments);
    },

    members : {
        __counter : 0,


        /**
         * TODOC
         *
         * @return {void} 
         */
        ignoreNext : function() {
            this.__counter++;
        },


        /**
         * TODOC
         *
         * @return {boolean} TODOC
         */
        isIgnorable : function() {
            if (this.__counter == 0) {
                return false;
            }

            this.__counter--;
            return true;
        }
    }
});