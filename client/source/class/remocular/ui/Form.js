/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */

/* ************************************************************************
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-start.png)
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-stop.png)
#asset(qx/icon/${qx.icontheme}/16/actions/edit-clear.png)
************************************************************************ */

qx.Class.define("remocular.ui.Form", {
    extend : qx.ui.form.Form,

    construct : function(form) {
        this.base(arguments);
        this.__form = form;

        for (var i=0, l=form.length; i<l; i++) {
            var el = form[i];
            var widget = null;

            //          this.info(el.type+', '+el.label+', '+el.name);
            switch(el.type)
            {
                case "GroupHeader":
                    this.addGroupHeader(el.label);
                    break;

                case "TextField":
                    widget = new qx.ui.form.TextField();
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
        }
    },

    members : {
        __form : null,


        /**
         * TODOC
         *
         * @return {var} TODOC
         */
        getModel : function() {
            var form = this.__form;
            var controller = new qx.data.controller.Form(null, this);
            var data = {};
            var l = form.length;

            for (var i=0; i<l; i++) {
                var el = form[i];

                if (el.name) {
                    data[el.name] = el.initial || null;
                }
            }

            var model = qx.data.marshal.Json.createModel(data, true);

            //         this.info(qx.util.Serializer.toJson(model));
            controller.setModel(model);
            return model;
        }
    }
});