/* ************************************************************************
   Author:    Unknown (Inspired by Qooxdoo Mailinglist)
   License:   Same as QooxDoo
   Utf8Check: äöü
************************************************************************ */

/**
 * Base class for tables with tooltips for cells.
 */
qx.Class.define("remocular.ui.table.Table", {
    extend : qx.ui.table.Table,

    /**
     * Create a table object with tooltips.
     *
     * @param tabelModel {Object} the associated table model provides access to the data.
     * @param custom {Map} optionally set aditional custom configuraitons.
     * @return {void} 
     */
    construct : function(tableModel, custom) {
        this.base(arguments, tableModel, custom);

        this.addListener("cellOver", this._onCellOver, this);
        this.addListener("headerOver", this._onHeaderOver, this);
        this.addListener("mousemove", this._onMouseMove, this);
        this._hideToolTip();
    },

    events : {
        /**
         * Dispatched when the mouse is over a cell.
         */
        "cellOver"   : "qx.event.type.Data",


        /**
         * Dispatched when the mouse is over a column header.
         */
        "headerOver"   : "qx.event.type.Data"
    },

    properties : {
        /**
         * {Boolean}
         * Indicates whether cells tooltips should be shown.
         */
        showCellToolTip : {
            init     : false,
            nullable : false,
            check    : "Boolean",
            apply    : "_applyShowCellToolTip"
        },


        /**
         * {Boolean}
         * Indicates whether column headers tooltips should be shown.
         */
        showHeaderToolTip : {
            init     : false,
            nullable : false,
            check    : "Boolean",
            apply    : "_applyShowHeaderToolTip"
        }
    },

    members : {
        /**
         * {qx.ui.tooltip.ToolTip}
         * Cell's tooltip.
         */
        __tableToolTip : null,


        /**
         * {Integer}
         * Index of column over which the mouse was previously.
         */
        __prevOverCol : -1,


        /**
         * {Integer}
         * Index of row over which the mouse was previously.
         */
        __prevOverRow : -1,


        /**
         * Applies changes of the value of the property
         *  <code>showCellToolTip</code>.
         *
         * @param value {Boolean} New value of the property.
         * @param old {Boolean} Previous value of the property.
         * @return {void} 
         */
        _applyShowCellToolTip : function(value, old) {
            if (value) {
                /* create initial tooltip */
                this._setToolTip();
            }
            else {
                if (this.__tableToolTip && this.getToolTip() === this.__tableToolTip && !this.isShowHeaderToolTip()) {
                    this.setToolTip(null);
                }
            }
        },


        /**
         * Applies changes of the value of the property
         *  <code>showHeaderToolTip</code>.
         *
         * @param value {Boolean} New value of the property.
         * @param old {Boolean} Previous value of the property.
         * @return {void} 
         */
        _applyShowHeaderToolTip : function(value, old) {
            if (value) {
                /* create initial tooltip */
                this._setToolTip();
            }
            else {
                if (this.__tableToolTip && this.getToolTip() === this.__tableToolTip && !this.isShowCellToolTip()) {
                    this.setToolTip(null);
                }
            }
        },


        /**
         * Creates and sets table's tooltip.
         *
         * @return {void} 
         */
        _setToolTip : function() {
            if (!this.__tableToolTip) {
                this.__tableToolTip = new qx.ui.tooltip.ToolTip();

                this.__tableToolTip.set({
                    showTimeout : 250,
                    hideTimeout : 100000000,
                    rich        : true
                });
            }

            this.setToolTip(this.__tableToolTip);
        },


        /**
         * Refreshes table's tooltip.
         *
         * @param sToolTipText {String} Tooltip's text.
         * @return {void} 
         */
        _refreshToolTip : function(sToolTipText) {
            // The following line allows the tooltip to appear again
            // without moving out of the table
            this._hideToolTip();

            if (typeof (sToolTipText) === "string" && sToolTipText.length > 0) {
                this.__tableToolTip.setLabel(sToolTipText);
                this.setToolTip(this.__tableToolTip);
                qx.ui.tooltip.Manager.getInstance().setCurrent(this.__tableToolTip);
            }
        },


        /**
         * Hides table's tooltip.
         *
         * @return {void} 
         */
        _hideToolTip : function() {
            this.setToolTip(null);
            qx.ui.tooltip.Manager.getInstance().setCurrent(null);
        },


        /**
         * Determines whether the specified cell exists.
         *
         * @param col {Integer} Cell column.
         * @param row {Integer} Cell row.
         * @return {Boolean} <code>true</code> if there is the cell at crossing
         *                of <code>col</code> column and <code>row</code> row,
         *                otherwise - <code>false</code>.
         */
        cellExists : function(col, row) {
            var dataModel = this.getTableModel();
            return (typeof (row) === "number" && typeof (col) === "number" && 0 <= row && row < dataModel.getRowCount() && 0 <= col && col < dataModel.getColumnCount());
        },


        /**
         * Returns the tooltip label for a particular cell.
         *
         * @param col {Integer} Cell column.
         * @param row {Integer} Cell row.
         * @return {String} The tooltip label for the specified cell.
         */
        getCellToolTipLabel : function(col, row) {
            var sResult = "";

            if (this.cellExists(col, row)) {
                sResult = this.getTableModel().getValue(col, row);

                if (typeof (sResult) === "object" && sResult !== null) {
                    sResult = sResult.toString();
                }
            }

            return sResult;
        },


        /**
         * Returns the tooltip label for a particular column header.
         *
         * @param col {Integer} Header column.
         * @return {String} The tooltip label for the specified column header.
         */
        getHeaderToolTipLabel : function(col) {
            return this.getTableModel().getColumnToolTip(col);
        },




        /*
                                                *****  EVENT HANDLERS  *****
                                                */

        /**
         * The "cellOver" event handler.
         *
         * @param event {qx.ui.table.pane.CellEvent} the event object.
         * @return {void} 
         */
        _onCellOver : function(event) {
            var row = event.getData()['row'];
            var col = event.getData()['col'];

            if (this.isShowCellToolTip()) {
                // 	           this.info('_onCellOver(): row='+row+', col='+col);
                this._refreshToolTip(this.getCellToolTipLabel(col, row));
            }
            else {
                this._hideToolTip();
            }
        },


        /**
         * The "headerOver" event handler.
         *
         * @param event {qx.ui.table.pane.CellEvent} the event object.
         * @return {void} 
         */
        _onHeaderOver : function(event) {
            var col = event.getData()['col'];
            var tt = this.getHeaderToolTipLabel(col);

            if (this.isShowHeaderToolTip()) {
                this._refreshToolTip(tt);
            } else {
                this._hideToolTip();
            }
        },


        /**
         * The "mousemove" event handler.
         *
         * @param event {qx.event.type.MouseEvent} the event object.
         * @return {void} 
         */
        _onMouseMove : function(event) {
            var pageX = event.getDocumentLeft();
            var pageY = event.getDocumentTop();
            var scroller = this.getTablePaneScrollerAtPageX(pageX);

            if (!scroller) {
                return;
            }

            var row = scroller._getRowForPagePos(pageX, pageY);
            var col = scroller._getColumnForPageX(pageX);

            if (col != this.__prevOverCol || row != this.__prevOverRow) {
                var target = event.getTarget();

                // Hide tooltip if mouse is not over a header or row
                if (!(target instanceof qx.ui.table.pane.Pane) && !(target instanceof qx.ui.table.pane.Header) && !(target instanceof qx.ui.table.headerrenderer.HeaderCell)) {
                    this._hideToolTip();
                }

                var cellEvent;

                // If mouse over a row
                if (typeof (row) === "number" && row > -1) {
                    if (target instanceof qx.ui.table.pane.Pane && this.hasListener("cellOver")) {
                        cellEvent = 'cellOver';
                    }
                }

                // If mouse over a header
                else if ((target instanceof qx.ui.basic.Atom || target instanceof qx.ui.table.pane.Header || target instanceof qx.ui.table.headerrenderer.HeaderCell) && this.hasListener("headerOver")) {
                    cellEvent = 'headerOver';
                }

                // Dispatch event
                if (cellEvent) {
                    cellEvent.row = row;
                    cellEvent.col = col;

                    this.fireDataEvent(cellEvent, {
                        'row' : row,
                        'col' : col
                    });
                }

                this.__prevOverCol = col;
                this.__prevOverRow = row;
            }
        }
    },

    destruct : function() {
        // Remove event handlers
        this.removeListener("cellOver", this._onCellOver, this);
        this.removeListener("headerOver", this._onHeaderOver, this);
        this.removeListener("mousemove", this._onMouseMove, this);
    }
});
