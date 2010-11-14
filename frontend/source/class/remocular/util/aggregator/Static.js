/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG 
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */
/**
 * Return a static value/message. Configuration map:
 * <pre class="javascript">
 * cfg = {
 *    message: the value to return
 * }
 * </pre>
 */
qx.Class.define('remocular.util.aggregator.Static', {
    extend : remocular.util.aggregator.Abstract,

    members : {
        process : function(row) {
            return this._getCfg().message;
        }
    }
});
