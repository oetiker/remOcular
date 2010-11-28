/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG 
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * Since browsers can only do a limited number of parallel requests the centralized poller
 * takes care of this for all tasks and dispatches the response via a message bus.
 * 
 */
qx.Class.define('remocular.util.Poller', {
    extend : qx.core.Object,
    type : "singleton",

    construct : function() {
        this.base(arguments);
        this.__handleMap = {};
        var timer = new qx.event.Timer(250).set({ enabled : true });
        timer.addListener('interval', this.__pollServer, this);
    },

    members : {
        __handleMap : null,
        /**
         * make sure we do not dispatch to queries on top of each other.
         */
        __waitingForServer : false,


        /**
         * Each plugin instance on the server side is identified by a handle
         * returned by the 'start' method.
         *
         * @param handle {string} handle string 
         * @param interval {number} at what interval to ask the server about the handle.
         * @return {void} 
         */
        addHandle : function(handle, interval) {
            this.__handleMap[handle] = {
                interval : interval,
                next     : (new Date()).getTime() + 500
            };
        },


        /**
         * Stop polling for said handle
         *
         * @param handle {string} handle string
         * @return {void} 
         */
        deleteHandle : function(handle) {
            delete this.__handleMap[handle];
            this.info('delete ' + handle);
        },

        /**
         * Polling handler.
         *
         */
        __pollServer : function() {
            if (this.__waitingForServer) {
                return;
            }

            var now = (new Date()).getTime();
            var handles = [];

            for (var handle in this.__handleMap) {
                var hp = this.__handleMap[handle];

                if (hp.next < now) {
                    hp.next += hp.interval;
                    handles.push(handle);
                }
            }

            //                  this.info(''+now+' call '+handle+': next '+hp.next+' (+'+hp.interval+')');
            if (handles.length > 0) {
                this.__waitingForServer = true;
                remocular.util.Server.getInstance().callAsync(qx.lang.Function.bind(this.__dispatchData, this), 'poll', handles);
            }
        },


        /**
         * Dispatch the data coming from the server to the task windows.
         *
         * @param ret {Map} data from the server
         * @param exc {Exception} server exception
         * @return {void} 
         */
        __dispatchData : function(ret, exc) {
            this.__waitingForServer = false;

            if (exc == null) {
                var bus = qx.event.message.Bus.getInstance();

                for (var hand in ret) {
                    if (this.__handleMap[hand]) {
                        bus.dispatchByName(hand, ret[hand]);
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
