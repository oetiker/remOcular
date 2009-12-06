/* ************************************************************************
   Copyright: 2008, OETIKER+PARTNER AG
   License: GPL
   Authors: Tobias Oetiker
************************************************************************ */

/**
 * A thd specific rpc call
 */
qx.Class.define('remocular.util.Server', {
    extend : qx.io.remote.Rpc,
    type : "singleton",

    construct : function() {
        this.base(arguments);

        this.set({
            // 3 seconds max
            timeout     : 10000,
            url         : '../jsonrpc.fcgi',
            serviceName : 'remocular'
        });
    },

    members : {
        /**
         * Set the local url for this application. Use this method to make
         * a local copy of the application connect to the right server url.
         *
         * @param local_url {var} local user leading to the jsonrpc.fcgi
         * @return {void} 
         */
        setLocalUrl : function(local_url) {
            if (document.location.host === '') {
                this.set({
                    url         : local_url + 'jsonrpc.cgi',
                    crossDomain : true
                });
                this.info("running in local mode with url: "+this.getUrl());
            }
        }
    }
});
