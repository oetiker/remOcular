/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */

qx.Class.define("remocular.ui.form.renderer.Left", {
    extend : qx.ui.form.renderer.Single,

    construct : function(form) {
        this.base(arguments, form);
        this.set({ padding : [ 7, 7, 7, 7 ] });
    },

    members : {
        /**
         * Creates a label for the given form item.
         *
         * @param name {String} The content of the label without the
         *     trailing * and :
         * @param item {qx.ui.core.Widget} The item, which has the required state.
         * @return {qx.ui.basic.Label} The label for the given item.
         */
        _createLabel : function(name, item) {
            var required = "";

            if (item.getRequired()) {
                required = "*";
            }

            var label = new qx.ui.basic.Label(name + required).set({ alignY : 'middle' });
            return label;
        }
    }
});