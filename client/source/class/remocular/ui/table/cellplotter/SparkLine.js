/* **********************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */

qx.Class.define("remocular.ui.table.cellplotter.SparkLine",{
    extend : qx.core.Object,    
    construct : function(cfg)  {
        this.base(arguments);
        this.__cfg = cfg;
        this.reset();
    },
    members: {
        __cfg: null,
        __min: null,
        __max: null,
        plot: function (c,cellInfo,w,h){
            var stack = cellInfo.value;    
            var redraw = false;
            if (! qx.lang.Type.isArray(stack)){  
                return false;
            }
            if (stack.length < 2){
                return false;
            }
            var cfg = this.__cfg;
            var min = stack[0];
            var max = stack[0];
            if (cfg.singleScale){
                min = this.__min;
                max = this.__max;
            }
            for (var x=0;x < stack.length;x++){
                var d = stack[x];
                if (min == undefined || d < min){
                    min = d;
                    if (cfg.singleScale){
                        this.__min = d;
                        redraw = true;
                    }
                }
                if (max == undefined || d > max){
                    max = d;
                    if (cfg.singleScale){
                        this.__max = d;
                        redraw = true;
                    }
                }
                if (isNaN(d)){
                    return false;
                }
            }                                                  
            var range = max - min;
            if (range == 0){
                return false;
            }
            c.beginPath();
            c.strokeWidth = cfg.width;
            c.strokeStyle = cfg.lineColor;
            var step = w / stack.length;            
            c.moveTo(0,Math.round(h-(stack[0]-min)/range*(h-8)-4)+0.5);
            for (var x=1;x<stack.length;x++){                
                c.lineTo(Math.round(x*step)+0.5,Math.round(h-(stack[x]-min)/range*(h-8)-4)+0.5);
            }            
            c.stroke();
            c.beginPath();
            c.fillStyle = cfg.sparkColor;
            c.arc(Math.round((x-1)*step)+0.5,Math.round(h-(stack[x-1]-min)/range*(h-8)-4)+0.5,cfg.sparkRadius,0,2*Math.PI,false);
            c.fill();
            return false;
        },
        reset: function(){
            this.__min = undefined;
            this.__max = undefined;
        }
    }
});
