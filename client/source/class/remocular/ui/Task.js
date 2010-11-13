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
#asset(remocular/loader.gif)
************************************************************************ */


/**
 * The window for the browser side representation of a plugin instance.
 */
qx.Class.define("remocular.ui.Task", {
    extend : qx.ui.window.Window,

    /**
     * Create a new task window. 
     *
     * @param task {Map} describing the window content
     * @param id {String} window id
     * @return {void} 
     */
    construct : function(task, id) {
        this.__windowName = id;
        this.__plugin = task.plugin;
        this.base(arguments, task.config.title);
        this.setLayout(new qx.ui.layout.VBox(0, null));
        var winCount = this.self(arguments).__winCount++;

        if (winCount > 10) {
            this.self(arguments).__winCount = 0;
        }

        this.moveTo(30 + 20 * winCount, 10 + 10 * winCount);

        this.set({
            allowMinimize  : false,
            showMinimize   : false,
            useMoveFrame   : true,
            useResizeFrame : true,
            width          : 800,
            height         : 400,
            contentPadding : [ 0, 0, 0, 0 ]
        });

        var toolbar = this.__makeToolbar();
        this.add(toolbar);
        this.__infoBar = new remocular.ui.InfoBar();
        this.__data = [];

        this.add(this.__infoBar);

        this.__tableContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0, 'middle'));
        this.__tableContainer.add(new remocular.ui.TaskLogo(task.config.title, task.config.byline, task.config.about, task.config.link));

        if (task.config.form) {
            this.__form = new remocular.ui.Form(task.config.form);
            this.__formModel = this.__form.getModel();

            if (task.config.form_type == 'top') {
                this.__wigForm = new remocular.ui.form.renderer.Top(this.__form).set({ marginLeft : 5 });
                this.__tableContainer.setDecorator('splitpane');
                var part = new qx.ui.toolbar.Part();
                part.add(this.__wigForm);
                toolbar.add(part);
                this.add(this.__tableContainer, { flex : 1 });
            }
            else {

                /* if (task.config.form_type == 'left'){ -- default */

                var pane = new qx.ui.splitpane.Pane('horizontal');
                this.add(pane, { flex : 1 });
                this.__wigForm = new remocular.ui.form.renderer.Left(this.__form);
                this.__wigForm.getLayout().setColumnFlex(1, 1);
                pane.add(this.__wigForm, 0);
                pane.add(this.__tableContainer, 1);
            }
        }
        else {
            this.__tableContainer.setDecorator('splitpane');
            this.add(this.__tableContainer, { flex : 1 });
        }

        /* busy indicator on toolbar while stop button is active */

        var image = new qx.ui.basic.Image("remocular/loader.gif").set({
            alignY       : 'middle',
            paddingRight : 8,
            visibility   : 'hidden'
        });

        toolbar.addSpacer();
        toolbar.add(image);



        this.addListener('keydown', function(e) {
            if (e.getKeyIdentifier() == 'Enter') {
                 this.run();
            }
        }, this);

        this.__btStop.addListener('changeEnabled', function(d) {
            var enabled = d.getData();
            image.setVisibility(enabled ? 'visible' : 'hidden');
        });

        this.addListenerOnce('close', function() {
            this.stop();

            this.addListenerOnce('stopped', function() {
                qx.ui.core.FocusHandler.getInstance().removeRoot(this);
                qx.core.Init.getApplication().getRoot().remove(this);
            },
            this);
        },
        this);
    },

    statics : { __winCount : 0 },
    events : { 'stopped' : 'qx.event.type.Event' },

    members : {
        __plugin : null,
        __windowName : null,
        __tableModel : null,
        __tableColumnCount : null,
        __tableContainer : null,
        __form : null,
        __formModel : null,
        __formWidget : null,
        __handle : null,
        __btRun : null,
        __btStop : null,
        __wigForm : null,
        __data : null,
        __infoBar : null,
        __dataProcessor : null,


        /**
         * gets called when the Run button or 'Enter' is pressed
         *
         * @return {void} 
         */
        __runHandler : function() {
            if (!this.__btRun.getEnabled()) {
                return;
            }

            this.__btRun.setEnabled(false);
            this.__infoBar.fade();
            this.__tableContainer.removeAll();
            var history = qx.bom.History.getInstance(); 

            if (this.__form) {
                var data = this.__modelToMap(this.__formModel);

                if (this.__form.validate()) {
                    remocular.util.Server.getInstance().callAsync(qx.lang.Function.bind(this.__processPlugin, this), 'start', {
                        plugin : this.__plugin,
                        args   : data
                    });

                    history.addToHistorySilent(this.__encodeForm(data));
                }
                else {
                    this.__btRun.setEnabled(true);
                }
            }
            else {
                remocular.util.Server.getInstance().callAsync(qx.lang.Function.bind(this.__processPlugin, this), 'start', {
                    plugin : this.__plugin,
                    args   : {}
                });

                history.addToHistorySilent(this.__encodeForm({}));
            }
        },


        /**
         * Create a history request string matching the form content
         *
         * @param data {Map} form content map
         * @return {String} history string
         */
        __encodeForm : function(data) {
            var str = 'ACT=RUN';

            if (this.__windowName) {
                str += ';ID=' + this.__windowName;
            }

            str += ';PLG=' + this.__plugin;

            for (var key in data) {
                if (data[key] !== null && data[key] !== undefined) {
                    str += ';' + key + '=' + data[key];
                }
            }

            return str;
        },


        /**
         * gets called when the stop button is presse
         *
         * @return {void} 
         */
        __stopHandler : function() {
            if (!this.__btStop.getEnabled()) {
                this.fireDataEvent('stopped', true);
                return;
            }

            this.__btStop.setEnabled(false);
            var bus = qx.event.message.Bus.getInstance();
            bus.unsubscribe(this.__handle, this.__updateTable, this);
            remocular.util.Poller.getInstance().deleteHandle(this.__handle);
            remocular.util.Server.getInstance().callAsync(qx.lang.Function.bind(this.__confirmStop, this), 'stop', this.__handle);
        },


        /**
         * create the window toolbar
         *
         * @return {Widget} toolbar widget
         */
        __makeToolbar : function() {
            var bar = new qx.ui.toolbar.ToolBar();
            var part = new qx.ui.toolbar.Part();
            bar.add(part);
            this.__btRun = new qx.ui.toolbar.Button(this.tr("Run"), "icon/16/actions/media-playback-start.png");
            part.add(this.__btRun);
            this.__btRun.addListener('execute', this.__runHandler, this);
            this.__btStop = new qx.ui.toolbar.Button(this.tr("Stop"), "icon/16/actions/media-playback-stop.png").set({ enabled : false });
            part.add(this.__btStop);
            this.__btStop.addListener('execute', this.__stopHandler, this);
            return bar;
        },


        /**
         * get the data back out of the form model
         *
         * @param model {Model} form model
         * @return {Map} data map
         */
        __modelToMap : function(model) {
            var properties = qx.util.PropertyUtil.getProperties(model.constructor);
            var data = {};

            for (var name in properties) {
                data[name] = model["get" + qx.lang.String.firstUp(name)]();
            }

            return data;
        },


        /**
         * process the data return by the plugin start call
         *
         * @param ret {Map} return data
         * @param exc {Exception} is the plugin unhappy?
         * @return {void} 
         */
        __processPlugin : function(ret, exc) {
            if (exc == null) {
                this.__handle = ret.handle;
                this.__dataProcessor = new remocular.util.DataProcessor(ret.cfg.table);
                this.__data = [];
                var table = this.__makeTable();
                this.__tableContainer.add(table, { flex : 1 });
                if (ret.cfg.title){
                    this.setCaption(ret.cfg.title);
                }
                var bus = qx.event.message.Bus.getInstance();
                bus.subscribe(ret.handle, this.__updateTable, this);
                remocular.util.Poller.getInstance().addHandle(ret.handle, ret.cfg.interval);

                this.__btStop.setEnabled(true);

                if (this.__wigForm) {
                    this.__wigForm.setEnabled(false);
                }
            }
            else {
                this.__btRun.setEnabled(true);
                this.__infoBar.error(exc['message'] + ' (' + exc['code'] + ')');
            }
        },


        /**
         * handle the data returned by the stop call
         *
         * @param ret {void} no data is returned from the sop command
         * @param exc {Exception} was there a problem
         * @param id {var} TODOC
         * @return {void} 
         */
        __confirmStop : function(ret, exc, id) {
            if (exc == null) {
                this.__btRun.setEnabled(true);

                if (this.__wigForm) {
                    this.__wigForm.setEnabled(true);
                }

                this.fireDataEvent('stopped', true);
            }
            else {
                this.__btStop.setEnabled(true);
                this.__infoBar.error(exc['message'] + ' (' + exc['code'] + ')');
            }
        },


        /**
         * update the table content according to the data lines returned by the
         * regular plugin calls.
         *
         * @param m {Array} data line
         * @return {void} 
         */
        __updateTable : function(m) {
            var input = m.getData();
            var dataLength = input.length;

            for (var l=0; l<dataLength; l++) {
                var op = input[l].shift();
                var row = this.__dataProcessor.process(input[l]);
                var arg = input[l][0];

                switch(op)
                {
                    case '#CLEAR':
                        this.__data = [];
                        break;

                    case '#STOP':
                        this.stop();
                        break;

                    case '#PUSH':
                        this.__data.push(row);
                        break;

                    case '#WARN':
                        this.__infoBar.warn(arg);
                        break;

                    case '#ERROR':
                        this.__infoBar.error(arg);
                        this.stop();
                        break;

                    case '#INFO':
                        this.__infoBar.warn(arg);
                        break;

                    default:
                        if (isNaN(op)) {
                            this.__infoBar.warn('Unknown Op: ' + op);
                        }
                        else {
                            op = Math.round(op);

                            if (op < 0) {
                                this.__data.splice(-op, 1, row);
                            } else {
                                this.__data[op] = row;
                            }
                        }

                        break;
                }
            }

            this.__tableModel.setData(this.__data, true);
        },


        /**
         * Create a table based on the table description map
         *
         * @param table {Map} table description
         * @return {var} TODOC
         */
        __makeTable : function(table) {
            this.__tableModel = new remocular.ui.table.model.ToolTip();
            this.__tableModel.setColumns(this.__dataProcessor.getColumnNames());
            this.__tableColumnCount = this.__dataProcessor.getColumnCount();

            var tableOpts = {
                tableColumnModel : function(obj) {
                    return new qx.ui.table.columnmodel.Resize(obj);
                }
            };

            var t = new remocular.ui.table.Table(this.__tableModel, tableOpts).set({
                decorator         : null,
                showHeaderToolTip : true
            });

            var tColMod = t.getTableColumnModel();
            var tBehavior = tColMod.getBehavior();

            for (var c=0; c<this.__tableColumnCount; c++) {
                this.__tableModel.setColumnToolTip(c, this.__dataProcessor.getColumnTip(c));
                tBehavior.set(c, { width : this.__dataProcessor.getColumnWidth(c).toString() + '*' });
                var renderer = this.__dataProcessor.makeDataCellRenderer(c);

                if (renderer) {
                    tColMod.setDataCellRenderer(c, renderer);
                }
            }

            return t;
        },


        /**
         * is the task running ?
         *
         * @return {Bool} status
         */
        isRunning : function() {
            return (!this.__btRun.getEnabled());
        },


        /**
         * start the task
         *
         * @return {void} 
         */
        run : function() {
            this.__btRun.execute();
        },


        /**
         * stop the task
         *
         * @return {void} 
         */
        stop : function() {
            this.__btStop.execute();
        },


        /**
         * configure the task. 
         *
         * @param data {Map} key value pairs for the task form
         * @return {void} 
         */
        config : function(data) {
            var model = this.__formModel;

            if (!model) {
                return;
            }

            for (var name in data) {
                var Name = qx.lang.String.firstUp(name);
                var set = 'set' + Name;
                var get = 'get' + Name;

                if (model[get]) {
                    var x = model[get]();

                    if (qx.lang.Type.isNumber(x)) {
                        data[name] = Number(data[name]);
                    } else if (qx.lang.Type.isBoolean(x)) {
                        data[name] = !/^(0|false|FALSE|F|f|)$/.test(x);
                    }

                    try {
                        model[set](data[name]);
                    } catch(e) {
                        this.info('calling ' + set + ':' + e);
                    }
                }
            }
        }
    },

    destruct : function() {
        this.stop();
    }
});
