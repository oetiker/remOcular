/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Call the server for updates and dispatch the answers
 */
qx.Class.define('smokescope.util.aggregator.Median', {
    extend: smokescope.util.aggregator.Abstract,

    members : {        
        process: function(row){
            var cfg = this._getCfg();
            var sto = this._getStore();
            var key = row[cfg.key_col];
            var value = row[cfg.source_col];
            if ( sto[key] == undefined){
                sto[key] = [];
            }
            var s = sto[key];
            s.push(value);
            s.sort(function(a,b){ return(b-a) });
            var x = s.length;
            var ret;  
            if ( x % 2 == 0 ){
                 ret = (s[x/2]+s[x/2-1])/2;
            }
            else {
                ret =  s[x/2-0.5];
            }
            return ret;
        }
    }
});
