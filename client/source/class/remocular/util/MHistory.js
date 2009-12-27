/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG 
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * Bend the history object to our will.
 */
qx.Mixin.define("remocular.util.MHistory", {
    members : {
        __ignoreOne : false,
        /**
         * Alternate encoder which does not escape everything. It lets us
         * keep urls readable.
         *
         * @param value {string} plain string
         * @return {string} encoded string
         */
        _encode : function(value) {
            if (qx.lang.Type.isString(value)) {
                return window.encodeURI(value);
            }
            return "";
        },


        /**
         * Adds an entry to the browser history without triggering a request event.
         *
         * @param state {String} a string representing the state of the
         *          application. This command will be delivered in the data property of
         *          the "request" event.
         * @param newTitle {String ? null} the page title to set after the history entry
         *          is done. This title should represent the new state of the application.
         */
        
        addToHistorySilent: function(state,newTitle) {
            if (this.getState() !== state) {
               this.__ignoreOne = true;
            }
            return this.addToHistory(state,newTitle);
        },


        /**
         * Called on changes to the history using the browser buttons.
         *
         * @param state {String} new state of the history
         */
        _onHistoryLoad : function(state) {
            this.setState(state);
            if (this.__titles[state] != null) {
                this.setTitle(this.__titles[state]);
            }
            if (this.__ignoreOne){
                this.info('event ignored');
                this.__ignoreOne = false;
            }
            else {
                this.info('event fired');
                this.fireDataEvent("request", state);
            }
        }
    }
});
