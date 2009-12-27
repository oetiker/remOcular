/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG 
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * remocular aggregators process data coming from the server
 * into new data values. Aggregators can keep state internally.
 */
qx.Class.define('remocular.util.aggregator.Abstract', {
    extend : qx.core.Object,

    construct : function(cfg) {
        this.base(arguments);
        this.reset();
        this.__cfg = cfg;
    },

    members : {
        __cfg : null,
        __store : null,


        /**
         * get the aggregators configuration map
         *
         * @return {map} configuration map
         */
        _getCfg : function() {
            return this.__cfg;
        },


        /**
         * get the state store
         *
         * @return {var} state store
         */
        _getStore : function() {
            return this.__store;
        },


        /**
         * reset the sate 
         *
         * @return {void} 
         */
        reset : function() {
            this.__store = {};
        },


        /**
         * process a row of data and return the result
         *
         * @param row {array} input row
         * @return {var} procesed data
         */
        process : function(row) {
            return true;
        }
    }
});
