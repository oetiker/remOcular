/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

qx.Class.define('smokescope.util.aggregator.Average', {
    extend: smokescope.util.aggregator.Abstract,

    members : {        
        process: function(row){
            var cfg = this._getCfg();
            var sto = this._getStore();
            var key = row[cfg.key_col];
            var value = row[cfg.source_col];
            if ( sto[key] == undefined){
                sto[key] = { 
                    count: 0, 
                    sum: 0
                };
            }
            var s = sto[key];
            s.count++;
            s.sum += value;        
            return s.sum/s.count;
        }
    }
});
