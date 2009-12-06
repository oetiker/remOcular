/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */

qx.Class.define("remocular.ui.Menu",{
    extend : qx.ui.window.Window,
    construct : function(){
        this.base(arguments,this.tr('Task Selector'));
        this.moveTo(5,5);
        this.set({
            allowClose: false,
            showClose: false,
            allowMaximize: false,
            showMaximize: false,
            allowMinimize: false,
            showMinimize: false,
            contentPadding: [3,3,3,3]
        });
        this.setLayout(new qx.ui.layout.VBox(3));
        remocular.util.Server.getInstance().callAsync(
            qx.lang.Function.bind(this.__fillMenu,this),
            'config'
        );
        this.__history = qx.bom.History.getInstance();
        this.__taskList = {};
        this.__pluginList = {};
        this.addListenerOnce('appear',function(e){
            this.__handleRequest(e);
            this.__history.addListener('request',this.__handleRequest,this);
        },this);
    },
    members : {
        __taskList: null,
        __pluginList: null,
        __history: null,
        __fillMenu : function(ret,exc,id){
            if (exc == null) {
                for (var i=0,m=ret.length;i<m;i++){
                    this.__addButton(ret[i]);
                }
                this.open();
            }
            else {
                var msg = remocular.ui.MsgBox.getInstance();
                msg.error(this.tr('Error'), exc['message'] + ' (' + exc['code'] + ')');
            };
        },
        __addButton : function (item){
            var button = new qx.ui.form.Button(item['menu']);
            button.set({
                width: 120
            });
            button.addListener('execute',function(){
                var task = new remocular.ui.Task(item['task']);
                task.open();
            },this);
            this.__pluginList[item['task'].plugin] = item['task'];
            this.add(button);
        },
        __handleRequest : function(e){            
            var input = this.__history.getState();
            if (!input){
                return;
            }
            var data = this.__decodeRequest(input);            
            var msg = remocular.ui.MsgBox.getInstance();
            var ignoreCounter = remocular.util.HistoryIgnoreCounter.getInstance();
            if (ignoreCounter.isIgnorable()){
                return;
            }
            var task;
            if (data.ID){
                if (this.__taskList[data.ID]){
                    task = this.__taskList[data.ID];
                    this.info('reusing task '+data.ID);
                }
            }

            if (task == undefined){
                if (data.PLG){
                    if (this.__pluginList[data.PLG]){
                        task = new remocular.ui.Task(this.__pluginList[data.PLG],data.ID);
                        task.open();
                    }
                    else {
                        msg.error(this.tr('Invalid Plugin'),this.tr('Plugin %1 is not known',data.PLG));
                        return;
                    }
                }                    
                else {
                    msg.error(this.tr('No Plugin Defined'),this.tr('On a new task window you have to set the PLG parameter'));
                    return;
                }
            }

            if (data.ID){
                this.__taskList[data.ID] = task;
                task.addListenerOnce('close',function(){
                    delete this.__taskList[data.ID];
                },this);
            }

            task.config(data);

            if (data.ACT){
                switch(data.ACT){
                case 'RUN':
                    task.addListenerOnce('stopped',function(){
                       task.run();
                    },this);
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
                    msg.error(this.tr('Invalid Action'),this.tr('Sorry, can not handle action: %1',data.ACT));
                    return;
                }                               
            }                            
        },
        __decodeRequest : function(request){
            var list = request.split(';');
            var data = {};
            for (var i = 0;i<list.length;i++){
                var key_val = list[i].split('=',2);
                data[key_val[0]] = key_val[1];
            };
            return data;
        }
    }

});
