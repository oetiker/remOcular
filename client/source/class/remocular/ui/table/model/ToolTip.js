
/**
 * Base class for tables with tooltips for cells.
 */
qx.Class.define("remocular.ui.table.model.ToolTip", {
    extend : qx.ui.table.model.Simple,




    /*
            *****************************************************************************
                CONSTRUCTOR
            *****************************************************************************
            */

    construct : function() {
        // Call the superclass constructor
        this.base(arguments);
        this.__columnToolTipArr = [];
    },




    /*
            *****************************************************************************
                MEMBERS
            *****************************************************************************
            */

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
        setColumnToolTip : function(index,tip) {
            this.__columnToolTipArr[index] = tip;
        }
    }
});
