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

AUTOMAKE_OPTIONS =  foreign

SUBDIRS = bin etc lib

WEBAPP =  $(exec find public -type f)

EXTRA_DIST = $(wildcard t/*.t) $(WEBAPP)

webappdir = $(prefix)/public
nobase_webapp_DATA = $(WEBAPP)


dist-hook:
	$(PERL) -i -p -e '"$(PACKAGE_VERSION)" =~ /(\d+)\.(\d+)\.(\d+)/ and $$v = sprintf("%d.%03d%03d",$$1,$$2,$$3) and s/^\$$VERSION\s+=\s+".+?"/\$$VERSION = "$$d"/'  $(distdir)/lib/remOcular.pm
	$(PERL) -i -p -e "s/#VERSION#/$(PACKAGE_VERSION)/g;" $(distdir)/public/script/remocular.js
