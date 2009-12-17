/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License: GPL
   Authors: Tobi Oetiker <tobi@oetiker.ch>
************************************************************************ */

qx.Mixin.define("remocular.ui.MHoverFx", {
    members : {
        /**
         * TODOC
         *
         * @param overFx {var} TODOC
         * @param outFx {var} TODOC
         * @return {void} 
         */
        addHoverFx : function(overFx, outFx) {
            var active = false;
            var visible = false;
            var mouseOver = false;

            overFx.addListener('setup', function() {
                active = true;
                visible = true;
            },
            this);

            overFx.addListener('finish', function() {
                active = false;

                if (!mouseOver && visible) {
                    outFx.start();
                }
            },
            this);

            outFx.addListener('setup', function() {
                active = true;
                visible = false;
            },
            this);

            outFx.addListener('finish', function() {
                active = false;

                if (mouseOver && !visible) {
                    overFx.start();
                }
            },
            this);

            this.addListener('mouseover', function(e) {
                mouseOver = true;

                if (!visible && !active) {
                    overFx.start();
                }
            },
            this);

            this.addListener('mouseout', function(e) {
                mouseOver = false;

                if (visible && !active) {
                    outFx.start();
                }
            },
            this);
        }
    }
});