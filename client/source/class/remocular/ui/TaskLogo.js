/* ************************************************************************
   Copyright: 2009 OETIKER+PARTNER AG
   License:   GPLv3 or later
   Authors:   Tobi Oetiker <tobi@oetiker.ch>
   Utf8Check: äöü
************************************************************************ */

/**
 * A  container that looks a bit like a PostIt
 */
qx.Class.define("remocular.ui.TaskLogo", {
    extend : qx.ui.container.Composite,

    /**
     * @param title {String} title of the Logo
     * @param byline {String} byline
     * @param about {String} text about the plugin
     * @param url {String} url to link to
     */
    construct : function(title, byline, about, link) {
        this.base(arguments);
        this.setLayout(new qx.ui.layout.VBox(3));

        this.set({
            margin          : 4,
            padding         : 15,
            maxWidth        : 300,
            allowGrowX      : true,
            alignX          : 'center',
            alignY          : 'middle',
            shadow          : new qx.ui.decoration.Grid("decoration/shadow/shadow.png", [ 2, 4, 4, 2 ]),
            decorator       : new qx.ui.decoration.Single(1, 'solid', '#ddd'),
            backgroundColor : '#fff',
            opacity         : 1
        });

        if (link) {
            this.setCursor('pointer');

            this.addListener('click', function(e) {
                qx.bom.Window.open(link, '_blank');
            });
        }

        var t = new qx.ui.container.Composite(new qx.ui.layout.VBox(3)).set({ opacity : 0.5 });

        t.addListener('mouseover', function(e) {
            this.setOpacity(1);
        }, t);

        t.addListener('mouseout', function(e) {
            this.setOpacity(0.5);
        }, t);

        t.add(new qx.ui.basic.Label(title).set({ font : 'smallTitle' }));
        t.add(new qx.ui.basic.Label(byline).set({ font : 'bold' }));

        t.add(new qx.ui.basic.Label(about).set({
            rich       : true,
            paddingTop : 4
        }));

        this.add(t);
    }
});
