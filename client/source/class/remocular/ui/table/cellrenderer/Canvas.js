/* **********************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */

qx.Class.define("remocular.ui.table.cellrenderer.Canvas",{
    extend : qx.ui.table.cellrenderer.Abstract,    
    construct : function(plotterObj)  {
        this.base(arguments);
        this.__queue = [];      
        this.__plotter = plotterObj;
        this.__elCache = {};
    },
    statics: {
        __count: 0
    },
    members: {
        __queue: null,
        __plotter: null,
        __elCache: null,
        __attachPending: true,
        __pane: null,

        _getContentHtml : function(cellInfo) {
            if (this.__attachPending){
                this.__attach(cellInfo.table);
                this.__attachPending = false;
            }
            this.self(arguments).__count++;
            var id = 'remocular.ui.PlotCell.'+(this.self(arguments).__count.toString(36));
            this.__queue.push({
                id: id,             
                cellInfo: { value: cellInfo.value,
                            row: cellInfo.row,
                            col: cellInfo.col,
                            rowData: cellInfo.rowData }
            });
            return '<canvas id="'+id+'"></canvas>';
        },

        __attach: function(table){
            var pane = this.__pane = table.getPaneScroller(0).getTablePane();
            pane.addListener("paneUpdated",this.__update,this);
        },

        __update: function(){            
            var entry;
            var w;
            var h;
            var ql = this.__queue.length;
            var elCache = this.__elCache;
            for (var i = 0;i<ql;i++){                
                var entry = this.__queue[i];
                var el = document.getElementById(entry.id);
                if (el){
                    if (elCache[entry.id]){
                        qx.dom.Element.replaceChild(elCache[entry.id].el,el);
                        continue;
                    } 
                    /* with IE and excanvas, we have to
                       add the missing method to the canvas
                       element first since the initial loading
                       only catches elements from the original html */
                    if (! el.getContext && window.G_vmlCanvasManager){
                        window.G_vmlCanvasManager.initElement(el);
                    }
                    /* do we have a canvas context now ? */
                    if (el.getContext){
                       var ctx = el.getContext('2d');
                       if (ctx){
                            if (w == undefined){
                                var par = qx.dom.Element.getParentElement(el);
                                var size = qx.bom.element.Dimension.getContentSize(par);
                                w = size.width;
                                h = size.height;
                            }
                            if (this.__plotter.plot(ctx,entry.cellInfo,w,h)){
                                this.__redraw();
                            }
                            elCache[entry.id] = { el: el, cellInfo: entry.cellInfo, w: w, h: h }; 
                        }
                    }
                }
            }
        },
        __redraw: function(){
            for (var id in this.__elCache){                    
                var c = this.__elCache[id];
                if (qx.dom.Element.getParentElement(c.el)){
                    var ctx = c.el.getContext('2d');
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';  
                    ctx.clearRect(0,0,c.w,c.h); // clear canvas  
                    ctx.restore();                        
                    this.__plotter.plot(ctx,c.cellInfo,c.w,c.h);
                }
            }    
        },
        reset: function(){
            this.__plotter.reset();
            this.__elCache = {};
        }    
    },

    destruct : function() {
        // Remove event handlers
        this.__pane.addListener("paneUpdated",this.__update,this);
    }
});
 
