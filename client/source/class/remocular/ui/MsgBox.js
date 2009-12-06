/* ************************************************************************
   Copyright: 2008, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/* ************************************************************************
#asset(qx/icon/${qx.icontheme}/32/status/dialog-error.png)
#asset(qx/icon/${qx.icontheme}/32/status/dialog-information.png)
#asset(qx/icon/${qx.icontheme}/32/status/dialog-warning.png)
#asset(qx/icon/${qx.icontheme}/16/status/dialog-warning.png)
#asset(qx/icon/${qx.icontheme}/16/status/dialog-error.png)
#asset(qx/icon/${qx.icontheme}/16/status/dialog-information.png)
#asset(qx/icon/${qx.icontheme}/22/actions/dialog-ok.png)
#asset(qx/icon/${qx.icontheme}/22/actions/dialog-apply.png)
#asset(qx/icon/${qx.icontheme}/22/actions/dialog-cancel.png)
************************************************************************ */

/**
 * An Error Popup Window that shows messages
 * sent to to 'error' message bus.
 */
qx.Class.define("remocular.ui.MsgBox", {
    extend : qx.ui.window.Window,
    type : "singleton",

    construct : function() {
        this.base(arguments);

        this.set({
            modal          : true,
            showMinimize   : false,
            showMaximize   : false,
            resizable      : false,
            contentPadding : 15
        });

        this.setLayout(new qx.ui.layout.VBox(20));
        var body = new qx.ui.basic.Atom();

        body.set({
            rich     : true,
            gap      : 10,
            maxWidth : 300,
            minWidth : 200
        });

        this.add(body);
        this.__body = body;

        var box = new qx.ui.container.Composite;
        box.setLayout(new qx.ui.layout.HBox(5, "right"));
        this.add(box);

        var that = this;

        var btn_cnl = this.__mk_btn(this.tr("Cancel"), "icon/22/actions/dialog-cancel.png");
        this.__btn_cnl = btn_cnl;

        btn_cnl.addListener("execute", function(e) {
            that.close();
        });

        box.add(btn_cnl);

        btn_cnl.addListener('appear', function(e) {
            btn_cnl.focus();
        }, this);

        var btn_app = this.__mk_btn(this.tr("Apply"), "icon/22/actions/dialog-apply.png");
        this.__btn_app = btn_app;

        btn_app.addListener("execute", function(e) {
            that.close();
        });

        box.add(btn_app);

        var btn_ok = this.__mk_btn(this.tr("OK"), "icon/22/actions/dialog-ok.png");
        this.__btn_ok = btn_ok;

        btn_ok.addListener("execute", function(e) {
            that.close();
        });

        btn_ok.addListener('appear', function(e) {
            btn_ok.focus();
        }, this);

        box.add(btn_ok);

        this.getApplicationRoot().add(this);
    },

    members : {
        __body : null,
        __btn_ok : null,
        __btn_app : null,
        __btn_cnl : null,


        /**
         * TODOC
         *
         * @param titel {var} TODOC
         * @param text {var} TODOC
         * @return {void} 
         */
        __open : function(titel, text) {
            this.setCaption(String(titel));
            this.__body.setLabel(String(text));
            this.center();
            this.open();
        },


        /**
         * TODOC
         *
         * @param lab {var} TODOC
         * @param ico {var} TODOC
         * @return {var} TODOC
         */
        __mk_btn : function(lab, ico) {
            var btn = new qx.ui.form.Button(lab, ico).set({ minWidth : 40 });
            return btn;
        },


        /**
         * TODOC
         *
         * @param titel {var} TODOC
         * @param text {var} TODOC
         * @return {void} 
         */
        error : function(titel, text) {
            this.__body.setIcon("icon/32/status/dialog-error.png");
            this.setIcon("icon/16/status/dialog-error.png");
            this.__btn_ok.setVisibility('visible');
            this.__btn_app.setVisibility('excluded');
            this.__btn_cnl.setVisibility('excluded');
            this.__btn_ok.focus();
            this.__open(titel, text);
        },


        /**
         * TODOC
         *
         * @param titel {var} TODOC
         * @param text {var} TODOC
         * @return {void} 
         */
        info : function(titel, text) {
            this.__body.setIcon("icon/32/status/dialog-information.png");
            this.setIcon("icon/16/status/dialog-information.png");
            this.__btn_ok.setVisibility('visible');
            this.__btn_app.setVisibility('excluded');
            this.__btn_cnl.setVisibility('excluded');
            this.__btn_ok.focus();
            this.__open(titel, text);
        },


        /**
         * TODOC
         *
         * @param titel {var} TODOC
         * @param text {var} TODOC
         * @param exec_action {var} TODOC
         * @return {void} 
         */
        warn : function(titel, text, exec_action) {
            this.__body.setIcon("icon/32/status/dialog-warning.png");
            this.setIcon("icon/16/status/dialog-warning.png");
            this.__btn_ok.setVisibility('excluded');
            this.__btn_cnl.setVisibility('visible');
            this.__btn_app.setVisibility('visible');
            this.__btn_app.addListenerOnce("execute", exec_action);
            this.__open(titel, text);
        }
    }
});
