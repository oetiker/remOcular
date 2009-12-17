/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Call the server for updates and dispatch the answers
 */
qx.Class.define('remocular.util.aggregator.Counter', {
    extend : remocular.util.aggregator.Abstract,

    members : {
        /**
         * TODOC
         *
         * @param row {var} TODOC
         * @return {var} TODOC
         */
        process : function(row) {
            var cfg = this._getCfg();
            var sto = this._getStore();
            var key = row[cfg.key_col];

            if (sto[key] == undefined) {
                sto[key] = 0;
            }

            sto[key]++;
            return sto[key];
        }
    }
});