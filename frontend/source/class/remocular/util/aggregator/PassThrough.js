/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG 
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */
/**
 * Return the selected column value as is. Configuration map:
 * <pre class="javascript">
 * cfg = {
 *    source_col: column with the input data for the average
 * }
 * </pre>
 */
qx.Class.define('remocular.util.aggregator.PassThrough', {
    extend : remocular.util.aggregator.Abstract,

    members : {
        process : function(row) {
            return row[this._getCfg().source_col];
        }
    }
});
