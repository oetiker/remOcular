/* ************************************************************************
   Author:    Unknown (Inspired by Qooxdoo Mailinglist)           
   License:   Same as QooxDoo
   Utf8Check: äöü
************************************************************************ */

/**
 * Variant of the simple table model with the ability to store a
 * tooltip for each cell and the column headers.
 */
qx.Class.define("remocular.ui.table.model.ToolTip", {
    extend : qx.ui.table.model.Simple,

    construct : function() {
        this.base(arguments);
        this.__columnToolTipArr = [];
    },

    members : {
        __columnToolTipArr : null,


        /**
         * Return the ToolTip associated with a particular column.
         *
         * @param columnIndex {var} TODOC
         * @return {String} The tooltip label for the specified column header.
         */
        getColumnToolTip : function(columnIndex) {
            var sReturn = "";

            if (this.__columnToolTipArr[columnIndex]) {
                sReturn = this.__columnToolTipArr[columnIndex];
            }

            return sReturn;
        },


        /**
         * Set ColumnToolTips
         *
         * @param ttMap {map} map of column names and associated tooltip content
         * @return {void} 
         */
        setColumnToolTips : function(ttMap) {
            var tip;
            var index;

            if (typeof (ttMap) === "object" && ttMap !== null) {
                for (tip in ttMap) {
                    index = this.getColumnIndexById(tip);

                    if (index !== null) {
                        this.__columnToolTipArr[index] = ttMap[tip];
                    }
                }
            }
        },


        /**
         * set the tooltip for column header
         *
         * @param index {var} column
         * @param tip {var} tooltip text
         * @return {void} 
         */
        setColumnToolTip : function(index, tip) {
            this.__columnToolTipArr[index] = tip;
        }
    }
});
