/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Call the server for updates and dispatch the answers
 */
qx.Class.define('smokescope.util.aggregator.PassThrough', {
    extend: smokescope.util.aggregator.Abstract,
    members : {        
        process: function(row){
            return row[this._getCfg().source_col];
        }
    }
});
