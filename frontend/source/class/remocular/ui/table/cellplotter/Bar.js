/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   same as qooXdoo
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * Plotter Plugin for the Canvas cellrenderer.
 * This Plugin draws a bar based on the value of the cell.
 */

qx.Class.define("remocular.ui.table.cellplotter.Bar", {
    extend : qx.core.Object,

    /**
     * Instanciate the plotter
     *
     * @param cfg {Map} configuration map
     * 
     * <pre class='javascript'>
     * cfg = {
     *    fill:   '#color',
     *    border: '#color' 
     * };
     * </pre>
     */
    construct : function(cfg) {
        this.base(arguments);
        this.__cfg = cfg;
        this.reset();
    },

    members : {
        __cfg : null,
        __max : null,


        /**
         * Plot the Bar
         *
         * @param c {var} canvas drawing context
         * @param cellInfo {var} cellInfo from cellrender
         * @param w {var} canvas width
         * @param h {Map} canvas height
         * @return {boolean} should the other cells be redrawn because the scaling has changed?
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
         * reset any context data stored inside the plotter
         */
        reset : function() {
            this.__max = 0;
        }
    }
});
