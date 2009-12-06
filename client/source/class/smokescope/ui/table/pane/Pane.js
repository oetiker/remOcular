qx.Class.define("smokescope.ui.table.pane.Pane",
{
  extend : qx.ui.table.pane.Pane,
  events :
  {
    /**
     * Whenever the content of the table has been updated (rendered)
     * trigger a paneUpdated event. This allows the canvas of the plot
     * cells to be rendered.
     */
    "paneUpdated" : "qx.event.type.Event"
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Scrolls the pane's contents by the given offset.
     *
     * @param rowOffset {Integer} Number of lines to scroll. Scrolling up is
     *     represented by a negative offset.
     */
    _scrollContent : function(rowOffset) {
        this.base(arguments, rowOffset);
        this.fireEvent("paneUpdated");
    },


    /**
     * Updates the content of the pane (implemented using array joins).
     */
    _updateAllRows : function() {
        this.base(arguments);
        this.fireEvent("paneUpdated");
    }

  }
});
