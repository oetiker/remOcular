/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Call the server for updates and dispatch the answers
 */
qx.Class.define('remocular.util.DataProcessor', {
    extend : qx.core.Object,

    construct : function(cfg) {
        this.base(arguments);
        this.__cfg = cfg;
        var cols = cfg.length;
        var p = [];
        this.__processor = p;
        this.__renderer = [];
        var auto_col = 0;

        for (var i=0; i<cols; i++) {
            if (cfg[i].data) {
                var dataCfg = cfg[i].data;

                if (dataCfg.processor == 'MAP') {
                    p.push(this.__makeMap(dataCfg));
                } else {
                    p.push(this.__getProcessor(dataCfg));
                }
            }
            else {
                p.push(new remocular.util.aggregator.PassThrough({ source_col : auto_col++ }));
            }
        }
    },

    members : {
        __cfg : null,
        __processor : null,
        __renderer : null,


        /**
         * TODOC
         *
         * @param dataCfg {var} TODOC
         * @return {var} TODOC
         */
        __makeMap : function(dataCfg) {
            var processor = {
                handlers : {},

                process : function(row) {
                    var ret = {};

                    for (var key in this.handlers) {
                        ret[key] = this.handlers[key].process(row);
                    }

                    return ret;
                },

                reset : function() {
                    for (var key in this.handlers) {
                        this.handlers[key].reset();
                    }
                }
            };

            for (var key in dataCfg.structure) {
                processor.handlers[key] = this.__getProcessor(dataCfg.structure[key]);
            }

            return processor;
        },


        /**
         * TODOC
         *
         * @param dataCfg {var} TODOC
         * @return {var} TODOC
         */
        __getProcessor : function(dataCfg) {
            var name = dataCfg.processor;

            switch(name)
            {
                case 'COUNT':
                    return new remocular.util.aggregator.Counter(dataCfg);
                    break;

                case 'MIN':
                    return new remocular.util.aggregator.Minimum(dataCfg);
                    break;

                case 'MAX':
                    return new remocular.util.aggregator.Maximum(dataCfg);
                    break;

                case 'STDDEV':
                    return new remocular.util.aggregator.StandardDeviation(dataCfg);
                    break;

                case 'AVG':
                    return new remocular.util.aggregator.Average(dataCfg);
                    break;

                case 'MEDIAN':
                    return new remocular.util.aggregator.Median(dataCfg);
                    break;

                case 'STACK':
                    return new remocular.util.aggregator.Stack(dataCfg);
                    break;

                case 'PASSTHROUGH':
                    return new remocular.util.aggregator.PassThrough(dataCfg);
                    break;

                default:
                    return new remocular.util.aggregator.Static({ message : name + ' unknown' });
                    break;
            }
        },


        /**
         * TODOC
         *
         * @param row {var} TODOC
         * @return {var} TODOC
         */
        process : function(row) {
            var cols = this.__cfg.length;
            var ret = [];
            var proc = this.__processor;

            for (var i=0; i<cols; i++) {
                ret.push(proc[i].process(row));
            }

            return ret;
        },


        /**
         * TODOC
         *
         * @return {void} 
         */
        resetCounters : function() {
            var cols = this.__cfg.length;
            var proc = this.__processor;

            for (var i=0; i<cols; i++) {
                proc[i].reset();
            }

            for (var i=0; i<this.__renderer.length; i++) {
                this.__renderer[i].reset();
            }
        },


        /**
         * TODOC
         *
         * @return {var} TODOC
         */
        getColumnNames : function() {
            var cfg = this.__cfg;
            var names = [];
            var cols = this.__cfg.length;

            for (var i=0; i<cols; i++) {
                names.push(cfg[i].label);
            }

            return names;
        },


        /**
         * TODOC
         *
         * @param column {var} TODOC
         * @return {var} TODOC
         */
        getColumnTip : function(column) {
            return this.__cfg[column].tooltip;
        },


        /**
         * TODOC
         *
         * @return {var} TODOC
         */
        getColumnCount : function() {
            return this.__cfg.length;
        },


        /**
         * TODOC
         *
         * @param column {var} TODOC
         * @return {var} TODOC
         */
        getColumnWidth : function(column) {
            return this.__cfg[column].width;
        },


        /**
         * TODOC
         *
         * @param column {var} TODOC
         * @return {var} TODOC
         */
        makeDataCellRenderer : function(column) {
            var cfg = this.__cfg[column];
            var r;

            if (cfg.presentation) {
                var msg = remocular.ui.MsgBox.getInstance();
                var p = cfg.presentation;

                switch(p.renderer)
                {
                    case 'NUMBER':
                        r = new qx.ui.table.cellrenderer.Number(p.align);
                        var nf = new qx.util.format.NumberFormat();

                        if (p.decimals) {
                            nf.set({
                                maximumFractionDigits : p.decimals,
                                minimumFractionDigits : p.decimals
                            });
                        }

                        if (p.postfix) {
                            nf.setPostfix(p.postfix);
                        }

                        r.setNumberFormat(nf);
                        break;

                    case 'STRING':
                        r = new qx.ui.table.cellrenderer.String(p.align);
                        break;

                    case 'TWOBARPLOT':
                        var plotter = new remocular.ui.table.cellplotter.TwoBar({
                            mainbarFill    : p.mainbar.fill,
                            mainbarBorder  : p.mainbar.border,
                            stackbarFill   : p.stackbar.fill,
                            stackbarBorder : p.stackbar.border
                        });

                        r = new remocular.ui.table.cellrenderer.Canvas(plotter);
                        this.__renderer.push(r);
                        break;

                    case 'BARPLOT':
                        var plotter = new remocular.ui.table.cellplotter.Bar({
                            fill   : p.fill,
                            border : p.border
                        });

                        r = new remocular.ui.table.cellrenderer.Canvas(plotter);
                        this.__renderer.push(r);
                        break;

                    case 'SPARKLINE':
                        var plotter = new remocular.ui.table.cellplotter.SparkLine({
                            lineWidth   : p.line_width || 0.5,
                            lineColor   : p.line_color || '#2f2',
                            sparkRadius : p.spark_radius || 1,
                            sparkColor  : p.spark_color || '#f22',
                            singleScale : p.single_scale ? true : false,
                            depth       : p.depth || 30
                        });

                        r = new remocular.ui.table.cellrenderer.Canvas(plotter);
                        this.__renderer.push(r);
                        break;

                    default:
                        msg.error('Error', 'Unknown Renderer ' + p.renderer);
                }
            }

            return r;
        }
    }
});