/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/* ************************************************************************
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-start.png)
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-stop.png)
#asset(qx/icon/${qx.icontheme}/16/actions/edit-clear.png)
************************************************************************ */

qx.Class.define("remocular.ui.Form", {
    extend : qx.ui.form.Form,

    /**
     * @param formDesc {Array} Form description array.
     *
     * The form description is an {Array} of field descriptions.  Each field
     * is a {Map}. Each entry has at least the following keys: <code>type,
     * label, name</code>, the other keys depend on the type of wideget.
     * 
     * <pre class='javascript'>
     * { type:    "GroupHeader", 
     *   label:   "Name" }
     * { type:    "TextField",
     *   label:   "Label",
     *   name:    "key",
     *   initial: "default value" }
     * { type:    "CheckBox",
     *   label:   "Label",
     *   name:    "key",
     *   initial: true }
     * { type:    "Spinner",
     *   label:   "Label",
     *   name:    "key",
     *   initial: 23,
     *   min:     1,
     *   max:     40 }
     * { type:    "SelectBox",
     *   label:   "Label",
     *   name:    "key",
     *   initial: "Peter",
     *   data:    ['Peter', 'Karl', 'Max'] }
     * </pre> 
     */
    construct : function(formDesc) {
        this.base(arguments);
        var fl = formDesc.length;
        for (var i=0; i<fl; i++) {
            var el = formDesc[i];
            var widget = null;

            switch(el.type)
            {
                case "GroupHeader":
                    this.addGroupHeader(el.label);
                    break;

                case "TextField":
                    widget = new qx.ui.form.TextField();
                    widget.setLiveUpdate(true);
                    break;

                case "CheckBox":
                    widget = new qx.ui.form.CheckBox();
                    break;

                case "Spinner":
                    widget = new qx.ui.form.Spinner();

                    if (el.min) {
                        widget.setMinimum(el.min);
                    }

                    if (el.max) {
                        widget.setMaximum(el.max);
                    }

                    break;

                case "SelectBox":
                    widget = new qx.ui.form.SelectBox();
                    var controller = new qx.data.controller.List(null, widget);
                    controller.setModel(qx.data.marshal.Json.createModel(el.data, true));
                    break;

                default:
                    this.error("Can't deal with " + el.type);
                    break;
            }

            if (widget) {
                if (el.required) {
                    widget.setRequired(true);
                }
                this.add(widget, el.label, null, el.name || null);
            }
        };

        var controller = new qx.data.controller.Form(null, this);
        var data = {};
        for (var i=0; i<fl; i++) {
            var el = formDesc[i];
            if (el.name) {
                data[el.name] = el.initial || null;
            }
        }
        this.__model = qx.data.marshal.Json.createModel(data, true);
        controller.setModel(this.__model);        
    },

    members : {
        __model : null,
        /**
         * Return the form model.
         *
         * @return {var} 
         */
        getModel : function() {
            return this.__model;
        }
    }
});
