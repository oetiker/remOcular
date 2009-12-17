/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

qx.Class.define('remocular.util.aggregator.Stack', {
    extend : remocular.util.aggregator.Abstract,

    members : {
        /**
         * TODOC
         *
         * @param row {var} TODOC
         * @return {String} TODOC
         */
        process : function(row) {
            var cfg = this._getCfg();
            var sto = this._getStore();
            var key = row[cfg.key_col];
            var value = row[cfg.source_col];

            if (sto[key] == undefined) {
                sto[key] = [];
            }

            var s = sto[key];
            s.push(value);

            while (s.length > cfg.depth) {
                s.shift();
            }

            return s;
        }
    }
});