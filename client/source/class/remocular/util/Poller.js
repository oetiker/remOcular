/* ************************************************************************
   Copyright: 2009, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * Call the server for updates and dispatch the answers
 */
qx.Class.define('remocular.util.Poller', {
    extend: qx.core.Object,
    type : "singleton",

    construct : function (){
        this.base(arguments);
        this.__handleMap = {};
        var timer = new qx.event.Timer(1000).set({enabled: true});
        timer.addListener('interval',this.__pollServer,this);
    },

    members : {
        __handleMap: null,
        __waitingForServer: false,
        addHandle: function(handle,interval){
            this.__handleMap[handle] = {
                interval: interval,
                next: (new Date()).getTime()+500
            }
        },

        deleteHandle: function(handle){
            delete this.__handleMap[handle];
            this.info('delete '+handle);
        },

        __pollServer: function(e){
            if (this.__waitingForServer){
                return;
            }
            var now = (new Date()).getTime();            
            var handles = [];
            for (var handle in this.__handleMap){
                var hp = this.__handleMap[handle];
                if (hp.next < now){
                    hp.next += hp.interval;
                    handles.push(handle);
//                  this.info(''+now+' call '+handle+': next '+hp.next+' (+'+hp.interval+')');
                }
            }  
            if (handles.length > 0){                              
                this.__waitingForServer = true;
                remocular.util.Server.getInstance().callAsync(
                    qx.lang.Function.bind(this.__dispatchData,this),'poll',handles
                );
            }
        },

        __dispatchData: function(ret,exc,id){
            this.__waitingForServer = false;
            if (exc == null) {                
                var bus =  qx.event.message.Bus.getInstance();
                for (var hand in ret){
                    if (this.__handleMap[hand]){
                        bus.dispatch(hand,ret[hand]);
                    }
                }
            }
            else {
                var msg = remocular.ui.MsgBox.getInstance();
                msg.error(msg.tr('Error'), exc['message'] + ' (' + exc['code'] + ')');
            }
        }
    }
});
