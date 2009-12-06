/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Call the server for updates and dispatch the answers
 */
qx.Class.define('remocular.util.aggregator.PassThrough', {
    extend: remocular.util.aggregator.Abstract,
    members : {        
        process: function(row){
            return row[this._getCfg().source_col];
        }
    }
});
