/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Call the server for updates and dispatch the answers
 */
qx.Class.define('remocular.util.aggregator.PassThrough', {
    extend : remocular.util.aggregator.Abstract,

    members : {
        /**
         * TODOC
         *
         * @param row {var} TODOC
         * @return {var} TODOC
         */
        process : function(row) {
            return row[this._getCfg().source_col];
        }
    }
});