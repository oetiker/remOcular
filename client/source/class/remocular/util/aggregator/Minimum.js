/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG 
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * Find Minimum. Configuration map:
 * <pre class="javascript">
 * cfg = {
 *    key_col: column with the key values
 *    source_col: column with the input data for the average
 * }
 * </pre>
 */
qx.Class.define('remocular.util.aggregator.Minimum', {
    extend : remocular.util.aggregator.Abstract,

    members : {
        process : function(row) {
            var cfg = this._getCfg();
            var sto = this._getStore();
            var key = row[cfg.key_col];
            var value = row[cfg.source_col];

            if (sto[key] == undefined || value < sto[key]) {
                sto[key] = value;
            }

            return sto[key];
        }
    }
});
