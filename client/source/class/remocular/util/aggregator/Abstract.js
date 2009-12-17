/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Call the server for updates and dispatch the answers
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
         * TODOC
         *
         * @return {var} TODOC
         */
        _getCfg : function() {
            return this.__cfg;
        },


        /**
         * TODOC
         *
         * @return {var} TODOC
         */
        _getStore : function() {
            return this.__store;
        },


        /**
         * TODOC
         *
         * @return {void} 
         */
        reset : function() {
            this.__store = {};
        },


        /**
         * TODOC
         *
         * @param row {var} TODOC
         * @return {boolean} TODOC
         */
        process : function(row) {
            return true;
        }
    }
});