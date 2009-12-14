/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */

/*
#asset(remocular/start.png)
#asset(remocular/mini-logo.png)
#asset(qx/icon/${qx.icontheme}/22/mimetypes/executable.png)
*/

qx.Class.define("remocular.ui.Menu",{
    extend : qx.ui.popup.Popup,
    construct : function(){
        this.base(arguments,new qx.ui.layout.VBox(0));
        this.add(new qx.ui.basic.Image("remocular/start.png"));        

        this.set({
            decorator: null,
            shadow: null,
            backgroundColor: null,
            visibility: 'visible',
            autoHide: false,
            cursor: 'pointer'
        });
        
        this.moveTo(-33,-50);

        var mP = this.__menuPopup = new qx.ui.popup.Popup(new qx.ui.layout.VBox(0));
        mP.moveTo(5,5);
        mP.set({
            padding: [0,0,0,0]
        });
        var miniLogo = new qx.ui.basic.Image("remocular/mini-logo.png").set({
            padding: [5,7,5,7],
            cursor: 'pointer'
        });

        mP.add(miniLogo);
        miniLogo.addListener('click',function(){
            qx.bom.Window.open('http://www.remocular.org/v/VERSION', 'remocular.org');
        },this)
                       
        this.addListener('click',function(e){
            mP.setVisibility('visible');
        },this);

        remocular.util.Server.getInstance().callAsync(
            qx.lang.Function.bind(this.__fillMenu,this),
            'config'
        );

        this.__history = qx.bom.History.getInstance();
        this.__taskList = {};
        this.__pluginList = {};

        
        this.addListenerOnce('appear',function(e){
            var startEl = this.getContainerElement().getDomElement();

            var show = new qx.fx.effect.core.Move(startEl).set({
                mode: 'absolute',
                x: 5,
                y: 5,
                duration: 0.8,
                transition: 'spring'
            });

            var hide = new qx.fx.effect.core.Move(startEl).set({
                mode: 'absolute',
                x: -33,
                y: -50,
                duration: 0.8,
                transition: 'spring'
            });

            var active = false;
            var visible = false;
            var mouseOver = false;

            show.addListener('setup',function(){
                active  = true;
                visible = true;
            },this);

            show.addListener('finish',function(){
                active = false;
                if (!mouseOver && visible){
                    hide.start()
                };
            },this);

            hide.addListener('setup',function(){
                active = true;
                visible = false;
            },this);

            hide.addListener('finish',function(){
                active = false;
                if (mouseOver && !visible){
                    show.start()
                };
            },this);


            this.addListener('mouseover', function(e) {
                mouseOver = true;
                if (!visible && !active){
                    show.start();
                }
            },this);

            this.addListener('mouseout', function(e) {  
                mouseOver = false;
                if (visible && !active){
                    hide.start();
                }
            },this);
        },this);
    },
    members : {
        __taskList: null,
        __menuPopup: null,
        __pluginList: null,
        __history: null,
        __fillMenu : function(ret,exc,id){
            if (exc == null) {
                var menu = new qx.ui.container.Composite(new qx.ui.layout.VBox(2)).set({
                    decorator: new qx.ui.decoration.Single().set({
                        color: [ '#000', null, '#000'],
                        width: [ 1,0,1 ],
                        style: [ 'solid', null, 'solid']
                    }),
                    padding: [5,5,5,5]
                });
                for (var i=0,m=ret.plugins.length;i<m;i++){
                    menu.add(this.__makeButton(ret.plugins[i]));
                }
                this.__menuPopup.setVisibility('visible');
                this.__handleRequest();
                this.__history.addListener('request',this.__handleRequest,this);
                this.__menuPopup.add(menu);
                this.__menuPopup.add(this.__makeAdmin(ret.admin_name,ret.admin_link));
            }
            else {
                var msg = remocular.ui.MsgBox.getInstance();
                msg.error(this.tr('Error'), exc['message'] + ' (' + exc['code'] + ')');
            };
        },
        __makeAdmin: function(name,link){
            var v = new qx.ui.container.Composite(new qx.ui.layout.VBox(2)).set({
                 padding: [2,5,2,5]
            });
            var l = new qx.ui.basic.Label(name).set({
                alignX: 'right',
                cursor: 'pointer'
            });

            if (link){
                l.addListener('click',function(){
                    qx.bom.Window.open(link, name);
                },this)
            }
            v.add(l);
            return v
        },
        __makeButton : function (item){
            var button = new qx.ui.toolbar.Button(item.config.menu,'icon/22/mimetypes/executable.png');
            button.set({
                width: 100
            });
            button.addListener('execute',function(){
                var task = new remocular.ui.Task(item);
                task.open();                
                this.__menuPopup.setVisibility('excluded');
            },this);
            this.__pluginList[item.plugin] = item;
            return button;
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
                this.info('ignoring '+input);
                return;
            }
            var task;
            this.info('handdling '+input);
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
                        this.__menuPopup.setVisibility('excluded');
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
        },

        exclude: function(){
            /* without this the popup manager might decide to hide us */
        }
    }

});
