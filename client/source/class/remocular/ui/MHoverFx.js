/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * Mixin to simplify the application of effects what should
 * be active as long as the user hovers the mouse over an object.
 */

qx.Mixin.define("remocular.ui.MHoverFx", {
    members : {
        /**
         * Add a hover and unhover effect.
         *
         * @param overFx {qx.fx.effect...} Effect to show on mouse over
         * @param outFx {qx.fx.effect...} Effect for mouse out
         * @return {void} 
         *
         *
         * <pre class='javascript'>
         * this.addListenerOnce('appear', function(e) {
         *     var startEl = this.getContainerElement().getDomElement();
         *
         *     var show = new qx.fx.effect.core.Move(startEl).set({
         *        mode       : 'absolute',
         *        x          : 5,
         *         y          : 5,
         *         duration   : 0.8,
         *         transition : 'spring'
         *     });
         *
         *     var hide = new qx.fx.effect.core.Move(startEl).set({
         *         mode       : 'absolute',
         *         x          : -33,
         *         y          : -50,
         *         duration   : 0.8,
         *         transition : 'spring'
         *     });
         *
         *     this.addHoverFx(show, hide);
         * },
         * this);
         * </pre>
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
