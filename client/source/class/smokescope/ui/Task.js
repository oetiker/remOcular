/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */
/* ************************************************************************
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-start.png)
#asset(qx/icon/${qx.icontheme}/16/actions/media-playback-stop.png)
#asset(qx/icon/${qx.icontheme}/16/actions/edit-clear.png)
#asset(smokescope/loader.gif)
************************************************************************ */

qx.Class.define("smokescope.ui.Task",{
    extend : qx.ui.window.Window,
    construct : function(task,id){
        this.__windowName = id;
        this.__plugin = task.plugin;
        this.base(arguments,task.title);
        this.setLayout(new qx.ui.layout.VBox(0,null));
        var winCount = this.self(arguments).__winCount++;
        if (winCount > 10){
            this.self(arguments).__winCount = 0;
        }
        this.moveTo(140+20*winCount,5+10*winCount);
        this.set({
            allowMinimize: false,
            showMinimize: false,
            width: 800,
            height: 400,
            contentPadding: [0,0,0,0]
        });
        var toolbar = this.__makeToolbar();
        this.add(toolbar);
        this.__infoBar = new smokescope.ui.InfoBar();
        this.__dataProcessor = new smokescope.util.DataProcessor(task.table);
        this.add(this.__infoBar);
        var table = this.__makeTable();
        if (task.form && task.form_type){
            this.__form = new smokescope.ui.Form(task.form);
            this.__formModel = this.__form.getModel();
            if (task.form_type == 'left'){
                var pane = new qx.ui.splitpane.Pane("horizontal");
                this.add(pane,{flex: 1});
                this.__wigForm = new smokescope.ui.form.renderer.Left(this.__form);
                this.__wigForm.getLayout().setColumnFlex(1,1);
                pane.add(this.__wigForm,0);
                pane.add(table,1);
            }
            else if (task.form_type == 'top'){
                this.__wigForm =  new smokescope.ui.form.renderer.Top(this.__form).set({
                    marginLeft: 5
                });
                table.setDecorator('splitpane');
                var part = new qx.ui.toolbar.Part();                
                part.add(this.__wigForm);
                toolbar.add(part);                                       
                this.add(table,{flex: 1}); 
            }
            var image = new qx.ui.basic.Image("smokescope/loader.gif").set({
                alignY : 'middle',
                paddingRight: 8,
                visibility: 'hidden'
            });
            toolbar.addSpacer();
            toolbar.add(image);
            this.__btStop.addListener('changeEnabled',function(d){
                var enabled = d.getData();
                image.setVisibility(enabled ? 'visible' : 'hidden')
            });
        }
        else {
            table.setDecorator('splitpane');
            this.add(table,{flex: 1});
        }
        this.__data = [];            
        this.addListenerOnce('close',function(){
            this.stop();
            this.addListenerOnce('stopped',function(){
                qx.ui.core.FocusHandler.getInstance().removeRoot(this);
                qx.core.Init.getApplication().getRoot().remove(this);
            },this);
        },this);
    },
    statics: {
        __winCount: 0
    },
    events: {
        'stopped': 'qx.event.type.Event'
    },
    members: {
        __plugin:null,
        __windowName: null,
        __tableModel: null,
        __tableColumnCount: null,
        __form:null,
        __formModel: null,
        __formWidget: null,
        __handle: null,
        __btRun: null,
        __btStop: null,
        __wigForm: null,
        __data: null,
        __infoBar: null,
        __dataProcessor: null,
        __ignoreRequest: 0,
    
        isRequestIgnorable: function(){
            if (this.__ignoreRequest > 0){
                this.__ignoreRequest--;
                return true;
            }
            else {
                return false;
            }
        },
            
            
        __runHandler: function(){
            if (! this.__btRun.getEnabled()){
                return;
            }
            this.__btRun.setEnabled(false);            
            this.__infoBar.fade();
            this.__dataProcessor.resetCounters();
            var history = qx.bom.History.getInstance();
            var ignoreCounter = smokescope.util.HistoryIgnoreCounter.getInstance();
            if (this.__form){
                var data =  this.__modelToMap(this.__formModel);
                if (this.__form.validate()) {
                    smokescope.util.Server.getInstance().callAsync(
                        qx.lang.Function.bind(this.__subscribeBus, this),
                        'start',
                        {
                            plugin: this.__plugin,
                            args:   data
                        }
                    );
                    ignoreCounter.ignoreNext();
                    history.addToHistory(this.__encodeForm(data));
                } else {
                    this.__btRun.setEnabled(true);            
                }
            }
            else {
                smokescope.util.Server.getInstance().callAsync(
                    qx.lang.Function.bind(this.__subscribeBus, this),
                    'start',
                    {plugin: this.__plugin,
                     args:   {} 
                    }
                );
                ignoreCounter.ignoreNext();
                history.addToHistory(this.__encodeForm({}));
            }
        },
        __encodeForm: function(data){
            var str = 'ACT=RUN';
            if (this.__windowName){
                str += ';ID='+this.__windowName;
            }
            str += ';PLG='+this.__plugin;
            for (var key in data){
                if (data[key] !== null && data[key] !== undefined){
                    str += ';'+key + '=' + data[key];
                }
            }
            return str;
        },
        __stopHandler: function(){
            if (! this.__btStop.getEnabled()){
                this.fireDataEvent('stopped',true);
                return;
            }
            this.__btStop.setEnabled(false);            
            var bus = qx.event.message.Bus.getInstance();
            bus.unsubscribe(this.__handle,this.__updateTable, this);
            smokescope.util.Poller.getInstance().deleteHandle(this.__handle);
            smokescope.util.Server.getInstance().callAsync(
                 qx.lang.Function.bind(this.__confirmStop,this),
                'stop',
                this.__handle
            );
        },
        __makeToolbar: function(){
            var bar = new qx.ui.toolbar.ToolBar();
            var part = new qx.ui.toolbar.Part();
            bar.add(part);
            this.__btRun = new qx.ui.toolbar.Button(
                this.tr("Run"), "icon/16/actions/media-playback-start.png");
            part.add(this.__btRun);
            this.__btRun.addListener('execute',this.__runHandler,this);

            this.__btStop = new qx.ui.toolbar.Button(
                this.tr("Stop"), "icon/16/actions/media-playback-stop.png").set({
                enabled: false
            });
            part.add(this.__btStop);
            this.__btStop.addListener('execute',this.__stopHandler,this);
            return bar;
        },
        __modelToMap: function(model){
            var properties = qx.util.PropertyUtil.getProperties(model.constructor);
            var data = {};
            for (var name in properties) {
                data[name] = model["get" + qx.lang.String.firstUp(name)]();
            }
            return data;
        },
        __subscribeBus: function(ret,exc,id){
            if (exc == null) {                
                this.__handle = ret.handle;                
                this.setCaption(ret.caption);
                var bus =  qx.event.message.Bus.getInstance();
                bus.subscribe(ret.handle, this.__updateTable, this);
                smokescope.util.Poller.getInstance().addHandle(ret.handle,ret.interval);
//                this.__setSortable(false);
                this.__btStop.setEnabled(true);                
                if (this.__wigForm){
                    this.__wigForm.setEnabled(false);
                }
            }
            else {
                this.__btRun.setEnabled(true);
                this.__infoBar.error(exc['message'] + ' (' + exc['code'] + ')');
            }
        },    

        __confirmStop: function(ret,exc,id){
            if (exc == null) {                
//                this.__setSortable(true);
                this.__btRun.setEnabled(true);
                if (this.__wigForm){
                    this.__wigForm.setEnabled(true);
                }
                this.fireDataEvent('stopped',true);
            }
            else {
                this.__btStop.setEnabled(true);
                this.__infoBar.error(exc['message'] + ' (' + exc['code'] + ')');
            }
        },
    
        __updateTable: function(m){
            var input = m.getData();
            var dataLength = input.length;
            for (var l=0;l<dataLength;l++){
                var op = input[l].shift();
                var row = this.__dataProcessor.process(input[l]);
                var arg = input[l][0];
                switch (op){
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
                        if (isNaN(op)){
                            this.__infoBar.warn('Unknown Op: '+op);
                        } else {
                            op = Math.round(op);
                            if (op < 0){
                                this.__data.splice(-op,1,row);
                            }
                            else {
                                this.__data[op] = row;
                            }
                        }
                        break;                
                }                
            }
            this.__tableModel.setData(this.__data,true);
        },

        __makeTable: function(table){
            this.__tableModel = new smokescope.ui.table.model.ToolTip();
            this.__tableModel.setColumns(this.__dataProcessor.getColumnNames());
            this.__tableColumnCount = this.__dataProcessor.getColumnCount();
            var tableOpts = {
                tableColumnModel : function(obj) {
                    return new qx.ui.table.columnmodel.Resize(obj);
                },
                tablePane: function(obj) {
                    return new smokescope.ui.table.pane.Pane(obj);
                }
            };
            var t = new  smokescope.ui.table.Table(this.__tableModel,tableOpts).set({
                decorator: null,
                showHeaderToolTip: true
            });
            var tColMod = t.getTableColumnModel();
            var tBehavior = tColMod.getBehavior();
            for (var c=0;c<this.__tableColumnCount;c++){
                this.__tableModel.setColumnToolTip(c,this.__dataProcessor.getColumnTip(c));
                tBehavior.set(c, { width: this.__dataProcessor.getColumnWidth(c).toString()+'*' });
                var renderer = this.__dataProcessor.makeDataCellRenderer(c);
                if (renderer){                                
                    tColMod.setDataCellRenderer(c,renderer);
                }
            }        
            return t;            
        },

        __setSortable: function(sortable){
            var t=this.__tableModel;
            for (var c=0;c<this.__tableColumnCount;c++){
                t.setColumnSortable(c,sortable);
            }
        },
        isRunning: function(){
            return (! this.__btRun.getEnabled());
        },

        run: function(){
            this.__btRun.execute();
        },
        stop: function(){
            this.__btStop.execute();
        },
        config: function(data){
            var model = this.__formModel;    
            if (!model){
                return;
            }
            for (var name in data) {
                var Name = qx.lang.String.firstUp(name);
                var set = 'set' + Name;
                var get = 'get' + Name;
                if (model[get]){
                    var x = model[get]();
                    if (qx.lang.Type.isNumber(x)){
                        data[name] = Number(data[name]);
                    } else if (qx.lang.Type.isBoolean(x)){
                        data[name] = ! /^(0|false|FALSE|F|f|)$/.test(x);
                    }
                    try {
                        model[set](data[name]);
                    } catch(e){
                        this.info('calling '+set+':'+e)
                    };
                };
            }

            
        }
    },
    destruct: function(){
        this.stop();
    }
});
