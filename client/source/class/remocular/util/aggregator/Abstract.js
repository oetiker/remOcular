/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Call the server for updates and dispatch the answers
 */
qx.Class.define('smokescope.util.aggregator.Abstract', {
    extend: qx.core.Object,

    construct : function (cfg){
        this.base(arguments);
        this.reset();
        this.__cfg = cfg;
    },

    members : {        
        __cfg: null,
        __store: null,
        _getCfg: function(){
            return this.__cfg;
        },
        _getStore: function(){
            return this.__store;
        },
        reset: function(){
            this.__store = {};
        },

        process: function(row){
            return true;
        }
    }
});
