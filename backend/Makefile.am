# Copyright (C) 2011 Tobias Oetiker
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307, USA.

QX_CLASS = remocular
MJ_CLASS = remOcular

AUTOMAKE_OPTIONS =  foreign

ETC = etc/remocular.cfg.dist
BIN = bin/remocular.pl

PM :=  $(shell find lib/ -name "*.pm")
RES :=  $(shell test -d public/resource && find public/resource -type f)        

PUB = public/script/$(QX_CLASS).js public/index.html $(RES)

EXTRA_DIST = $(wildcard t/*.t) $(ETC) $(BIN) $(PM) $(PUB)

YEAR := $(shell date +%Y)
DATE := $(shell date +%Y-%m-%d)

datadir = $(prefix)
nobase_data_DATA = $(PM) $(PUB) $(ETC)

dist_bin_SCRIPTS = $(BIN)

if BUILD_QOOXDOO_APP

public/script/$(QX_CLASS).js: $(shell find ../frontend/source/class/$(QX_CLASS) -name "*.js") $(QOOXDOO_PATH)/framework/config.json ../configure
	cd ../frontend && $(QOOXDOO_PATH)/tool/bin/generator.py -m QOOXDOO_PATH:$(QOOXDOO_PATH) -m CACHE:./cache -m BUILD_PATH:../backend/public build
	$(PERL) -i -p -e 's/#VERSION#/$(PACKAGE_VERSION)/g;s/#YEAR#/$(YEAR)/g;s/#DATE#/$(DATE)/g;' public/index.html public/script/$(QX_CLASS).js         
else

public/script/$(QX_CLASS).js:
	$(error get a copy of the qooxdoo sdk from www.qooxdoo.org and configure with --with-qooxdoo-sdk=path-to-sdk)

endif
         
install-exec-hook:
	[ "$(PERL5LIB)" != "" ] && cd "$(DESTDIR)$(bindir)" && $(PERL) -i -p -e 's{.*# PERL5LIB}{use lib qw($(PERL5LIB)); # PERL5LIB}' *.pl || true
	cd "$(DESTDIR)$(bindir)" && $(PERL) -i -p -e 's{^#!.*perl.*}{#!$(PERL)};' *.pl

dist-hook:
	$(PERL) -i -p -e '"$(PACKAGE_VERSION)" =~ /(\d+)\.(\d+)\.(\d+)/ and $$v = sprintf("%d.%03d%03d",$$1,$$2,$$3) and s/^\$$VERSION\s+=\s+".+?"/\$$VERSION = "$$d"/;'  $(distdir)/lib/$(MJ_CLASS).pm

install-data-local:
	mkdir -p $(DESTDIR)$(HTDOCSDIR)
	echo "#!/bin/sh" > $(DESTDIR)$(HTDOCSDIR)/index.fcgi.dist
	echo "export REMOCULAR_CONF=$(prefix)/etc/remocular.cfg" >> $(DESTDIR)$(HTDOCSDIR)/remo.fcgi.dist
	echo "$(prefix)/bin/remocular.pl fastcgi" >> $(DESTDIR)$(HTDOCSDIR)/remo.fcgi.dist
	chmod +x $(DESTDIR)$(HTDOCSDIR)/index.fcgi.dist
