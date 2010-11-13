/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG 
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * Builds the average. Configuration map:
 * <pre class="javascript">
 * cfg = {
 *    key_col: column with the key values 
 * }
 * </pre>
 */
qx.Class.define('remocular.util.aggregator.Counter', {
    extend : remocular.util.aggregator.Abstract,

    members : {
        process : function(row) {
            var cfg = this._getCfg();
            var sto = this._getStore();
            var key = row[cfg.key_col];

            if (sto[key] == undefined) {
                sto[key] = 0;
            }

            sto[key]++;
            return sto[key];
        }
    }
});
