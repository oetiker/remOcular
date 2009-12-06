/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

qx.Class.define('smokescope.util.aggregator.Minimum', {
    extend: smokescope.util.aggregator.Abstract,

    members : {        
        process: function(row){
            var cfg = this._getCfg();
            var sto = this._getStore();
            var key = row[cfg.key_col];
            var value = row[cfg.source_col];
            if ( sto[key] == undefined || value < sto[key] ){
                sto[key] = value;
            }
            return sto[key];
        }
    }
});
