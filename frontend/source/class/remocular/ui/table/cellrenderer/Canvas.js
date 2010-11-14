/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   same as qooXdoo
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * The canvas cell renderer allows to put little little drawings into the
 * cell.  the tricky bit about this is, that the cellrenderer does not
 * actualy put stuff into the DOM, but just returns html fragments. The
 * trick here is that we wait for a signal from the table model as to when it
 * has stuck the html into the DOM. Then we go out, find the relevant DOM
 * elements and apply the drawing operations.
 */

qx.Class.define("remocular.ui.table.cellrenderer.Canvas", {
    extend : qx.ui.table.cellrenderer.Abstract,

    /**
     * the Canvas renderer requires a plot object
     * defining how to draw the content of the cell
     * @param plotterObj {Plotter} instance of a plotter object    
     */
    construct : function(plotterObj) {
        this.base(arguments);
        this.__queue = [];
        this.__plotter = plotterObj;
        this.__elCache = {};
    },

    statics : { __count : 0 },

    members : {
        __queue : null,
        __plotter : null,
        __elCache : null,
        __attachPending : true,
        __pane : null,

        /**
         * the heart of the cell renderer. here it creates a bit of html
         * to be stuck into the cell, rendering its content.
         *
         * @param cellInfo {Map} all about the cells content
         * @return {String} the html
         */
        _getContentHtml : function(cellInfo) {
            if (this.__attachPending) {
                this.__attach(cellInfo.table);
                this.__attachPending = false;
            }

            this.self(arguments).__count++;
            var id = 'remocular.ui.PlotCell.' + (this.self(arguments).__count.toString(36));

            this.__queue.push({
                id : id,

                cellInfo : {
                    value   : cellInfo.value,
                    row     : cellInfo.row,
                    col     : cellInfo.col,
                    rowData : cellInfo.rowData
                }
            });

            return '<canvas id="' + id + '"></canvas>';
        },


        /**
         * attach to the table as soon as the first cell is renderd.
         *
         * @param table {var} table
         * @return {void} 
         */
        __attach : function(table) {
            var pane = this.__pane = table.getPaneScroller(0).getTablePane();
            pane.addListener("paneUpdated", this.__update, this);
        },


        /**
         * Update the canvas elements
         *
         * @return {void} 
         */
        __update : function() {
            var entry;
            var w;
            var h;
            var ql = this.__queue.length;
            var elCache = this.__elCache;

            for (var i=0; i<ql; i++) {
                var entry = this.__queue[i];
                var el = document.getElementById(entry.id);

                if (el) {
                    if (elCache[entry.id]) {
                        qx.dom.Element.replaceChild(elCache[entry.id].el, el);
                        continue;
                    }

                    /* with IE and excanvas, we have to
                       add the missing method to the canvas
                       element first since the initial loading
                       only catches elements from the original html */

                    if (!el.getContext && window.G_vmlCanvasManager) {
                        window.G_vmlCanvasManager.initElement(el);
                    }

                    /* do we have a canvas context now ? */

                    if (el.getContext) {
                        var ctx = el.getContext('2d');

                        if (ctx) {
                            if (w == undefined) {
                                var par = qx.dom.Element.getParentElement(el);
                                var size = qx.bom.element.Dimension.getContentSize(par);
                                w = size.width;
                                h = size.height;
                            }

                            if (this.__plotter.plot(ctx, entry.cellInfo, w, h)) {
                                this.__redraw();
                            }

                            elCache[entry.id] = {
                                el       : el,
                                cellInfo : entry.cellInfo,
                                w        : w,
                                h        : h
                            };
                        }
                    }
                }
            }
        },


        /**
         * redraw canvas cells
         *
         * @return {void} 
         */
        __redraw : function() {
            for (var id in this.__elCache) {
                var c = this.__elCache[id];

                if (qx.dom.Element.getParentElement(c.el)) {
                    var ctx = c.el.getContext('2d');
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.clearRect(0, 0, c.w, c.h);
                    ctx.restore();
                    this.__plotter.plot(ctx, c.cellInfo, c.w, c.h);
                }
            }
        },


        /**
         * reset the plotter
         *
         * @return {void} 
         */
        reset : function() {
            this.__plotter.reset();
            this.__elCache = {};
        }
    },

    destruct : function() {
        // Remove event handlers
        this.__pane.addListener("paneUpdated", this.__update, this);
    }
});
