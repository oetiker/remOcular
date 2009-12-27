/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG 
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * Return an array (stack) of the last values. Configuration map:
 * <pre class="javascript">
 * cfg = {
 *    key_col: column with the key values
 *    source_col: column with the input data for the average
 *    depth: number of values to keep in the stack
 * }
 * </pre>
 */
qx.Class.define('remocular.util.aggregator.Stack', {
    extend : remocular.util.aggregator.Abstract,

    members : {
        process : function(row) {
            var cfg = this._getCfg();
            var sto = this._getStore();
            var key = row[cfg.key_col];
            var value = row[cfg.source_col];

            if (sto[key] == undefined) {
                sto[key] = [];
            }

            var s = sto[key];
            s.push(value);

            while (s.length > cfg.depth) {
                s.shift();
            }

            return s;
        }
    }
});
