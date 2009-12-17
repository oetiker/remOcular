/* **********************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */

qx.Class.define("remocular.ui.table.cellplotter.Bar", {
    extend : qx.core.Object,

    construct : function(cfg) {
        this.base(arguments);
        this.__cfg = cfg;
        this.reset();
    },

    members : {
        __cfg : null,
        __max : null,


        /**
         * TODOC
         *
         * @param c {var} TODOC
         * @param cellInfo {var} TODOC
         * @param w {var} TODOC
         * @param h {Map} TODOC
         * @return {boolean | var} TODOC
         */
        plot : function(c, cellInfo, w, h) {
            var d = cellInfo.value;
            var redraw = false;

            if (isNaN(d)) {
                return false;
            }

            var cfg = this.__cfg;

            if (d > this.__max) {
                this.__max = d;
                redraw = true;
            }

            var bar = Math.round(d * (w - 4) / this.__max);
            c.strokeWidth = 0.5;
            c.fillStyle = cfg.fill;
            c.strokeStyle = cfg.border;
            c.fillRect(0.5, 2.5, bar, h - 6);
            c.strokeRect(0.5, 2.5, bar, h - 6);
            return redraw;
        },


        /**
         * TODOC
         *
         * @return {void} 
         */
        reset : function() {
            this.__max = 0;
        }
    }
});