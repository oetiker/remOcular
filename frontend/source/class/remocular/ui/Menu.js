/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/*
#asset(remocular/start.png)
#asset(remocular/mini-logo.png)
#asset(qx/icon/${qx.icontheme}/22/mimetypes/executable.png)
*/

/**
 * The menu Popup. It populates automatically from the server by calling
 * the <code>config</code> method on the server.
 */
qx.Class.define("remocular.ui.Menu", {
    extend : qx.ui.popup.Popup,

    construct : function() {
        this.base(arguments, new qx.ui.layout.VBox(0));
        this.add(new qx.ui.basic.Image("remocular/start.png"));

        this.set({
            decorator       : null,
            shadow          : null,
            backgroundColor : null,
            visibility      : 'visible',
            autoHide        : false,
            cursor          : 'pointer'
        });

        this.moveTo(-33, -50);
          
        var mP = this.__menuPopup = new qx.ui.popup.Popup(new qx.ui.layout.VBox(0));
        mP.moveTo(5, 5);
        mP.set({
            padding : [ 0, 0, 0, 0 ],
            width   : 140
        });

        var miniLogo = new qx.ui.basic.Image("remocular/mini-logo.png").set({
            padding : [ 5, 7, 5, 7 ],
            cursor  : 'pointer'
        });

        mP.add(miniLogo);

        miniLogo.addListener('click', function() {
            qx.bom.Window.open('http://www.remocular.org/v/#VERSION#', '_blank');
        }, this);

        this.addListener('click', function(e) {
            mP.show();
        }, this);

        remocular.util.Server.getInstance().callAsync(qx.lang.Function.bind(this.__fillMenu, this), 'config');

        this.__history = qx.bom.History.getInstance();
        this.__taskList = {};
        this.__pluginList = {};

        this.addListenerOnce('appear', function(e) {
            this.debug('got the button');
            var startEl = this.getContainerElement().getDomElement();

            var show = new qx.fx.effect.core.Move(startEl).set({
                mode       : 'absolute',
                x          : 5,
                y          : 5,
                duration   : 0.8,
                transition : 'spring'
            });

            var hide = new qx.fx.effect.core.Move(startEl).set({
                mode       : 'absolute',
                x          : -33,
                y          : -50,
                duration   : 0.8,
                transition : 'spring'
            });

            this.addHoverFx(show, hide);
        },
        this);
    },

    members : {
        __taskList : null,
        __menuPopup : null,
        __pluginList : null,
        __history : null,


        /**
         * Fill the menu with data returned from the server.
         *
         * @param ret {Array} plugins
         * @param exc {Exception} was there a problem
         * @return {void} 
         */
        __fillMenu : function(ret, exc) {
            if (exc == null) {
                var menu = new qx.ui.container.Composite(new qx.ui.layout.VBox(2)).set({
                    decorator : new qx.ui.decoration.Single().set({
                        color : [ '#000', null, '#000' ],
                        width : [ 1, 0, 1 ],
                        style : [ 'solid', null, 'solid' ]
                    }),

                    padding : [ 5, 5, 5, 5 ]
                });

                for (var i=0, m=ret.plugins.length; i<m; i++) {
                    menu.add(this.__makeButton(ret.plugins[i]));
                }

                this.__menuPopup.setVisibility('visible');
                this.__historyHandler();
                this.__history.addListener('request', this.__historyHandler, this);
                this.__menuPopup.add(menu);
                this.__menuPopup.add(this.__makeAdmin(ret.admin_name, ret.admin_link));
            }
            else {
                var msg = remocular.ui.MsgBox.getInstance();
                msg.error(this.tr('Error'), exc['message'] + ' (' + exc['code'] + ')');
            }
        },


        /**
         * Show the person responsible for this copy of remocular
         *
         * @param name {String} who is responsible
         * @param link {String} url to get in touch
         * @return {Widget} with the information
         */
        __makeAdmin : function(name, link) {
            var v = new qx.ui.container.Composite(new qx.ui.layout.VBox(2)).set({ padding : [ 2, 5, 2, 5 ] });

            var l = new qx.ui.basic.Label(name).set({
                alignX : 'right',
                cursor : 'pointer'
            });

            if (link) {
                l.addListener('click', function() {
                    qx.bom.Window.open(link, '_blank');
                }, this);
            }

            v.add(l);
            return v;
        },


        /**
         * Create a button for the mennu
         *
         * @param item {Map} button description
         * @return {Widget} the button widget
         */
        __makeButton : function(item) {
            var button = new qx.ui.toolbar.Button(item.config.menu, 'icon/22/mimetypes/executable.png').set({ font : 'bold' });

            button.addListener('execute', function() {
                var task = new remocular.ui.Task(item);
                task.open();
                this.__menuPopup.setVisibility('excluded');
            },
            this);

            this.__pluginList[item.plugin] = item;
            return button;
        },


        /**
         * Take instructions received via the browser history.
         *
         * @param e {Event} history event
         * @return {void} 
         * 
         * Take the location string after the # mark and use it as a cgi like key/value list.
         * See documentation for valid keys.
         *
         */
        __historyHandler : function(e) {
            var input = this.__history.getState();

            if (!input) {
                return;
            }

            var data = this.__decodeRequest(input);
            var msg = remocular.ui.MsgBox.getInstance();

            var task;
            this.info('handdling ' + input);

            if (data.ID) {
                if (this.__taskList[data.ID]) {
                    task = this.__taskList[data.ID];
                    this.info('reusing task ' + data.ID);
                }
            }

            if (task == undefined) {
                if (data.PLG) {
                    if (this.__pluginList[data.PLG]) {
                        task = new remocular.ui.Task(this.__pluginList[data.PLG], data.ID);
                        task.open();
                        this.__menuPopup.setVisibility('excluded');
                    }
                    else {
                        msg.error(this.tr('Invalid Plugin'), this.tr('Plugin %1 is not known', data.PLG));
                        return;
                    }
                }
                else {
                    msg.error(this.tr('No Plugin Defined'), this.tr('On a new task window you have to set the PLG parameter'));
                    return;
                }
            }

            if (data.ID) {
                this.__taskList[data.ID] = task;

                task.addListenerOnce('close', function() {
                    delete this.__taskList[data.ID];
                }, this);
            }

            task.config(data);

            if (data.ACT) {
                switch(data.ACT)
                {
                    case 'RUN':
                        task.addListenerOnce('stopped', function() {
                            task.run();
                        }, this);

                        task.stop();
                        break;

                    case 'STOP':
                        this.info('stopping');
                        task.stop();
                        break;

                    case 'CLOSE':
                        task.close();
                        break;

                    default:
                        msg.error(this.tr('Invalid Action'), this.tr('Sorry, can not handle action: %1', data.ACT));
                        return;
                }
            }
        },


        /**
         * Convert a history request string into a Map
         *
         * @param request {String} request string
         * @return {Map} key value pairs
         */
        __decodeRequest : function(request) {
            var list = request.split(';');
            var data = {};

            for (var i=0; i<list.length; i++) {
                var key_val = list[i].split('=', 2);
                data[key_val[0]] = key_val[1];
            }

            return data;
        },


        /**
         * replace the exclude method with our NULL version so that the 
         * menu never gets excluded and hidden as the popup manager tends
         * to otherwhise.
         *
         * @return {void} 
         */
        exclude : function() {}
    }
});

