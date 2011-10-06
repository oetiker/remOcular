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

RES =  $(shell test -d resource && find resource -type f)        

EXTRA_DIST = script/remocular.js index.html $(RES)

webappdir = $(prefix)/public
nobase_webapp_DATA = $(EXTRA_DIST)

if BUILD_QOOXDOO_APP

script/remocular.js: $(shell find ../../frontend/source/class/remocular -name "*.js")
	cd ../../frontend && $(QOOXDOO_PATH)/tool/bin/generator.py -m QOOXDOO_PATH:$(QOOXDOO_PATH) -m CACHE:./cache -m BUILD_PATH:../backend/public build
 

endif

