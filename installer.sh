#!/bin/bash
# $Id$
## other decision structure
set -o errexit
# don't try to remember where things are
set +o hashall
## do not tollerate unset variables
set -u 

if [ ${2:-no} = no ]; then
cat <<HELP
usage: $0  <Server-Prefix> <Web-Prefix>

The remOcular installer will place the server and client part of the
application into their appropriate localtions and it will download and
compile any missing perl modules.

If any perl modules have to be built, the script will access the
internet to get the required files.

Note that no special privileges are required for running the script.

remOcular will work fine when installed as a normal user, given
an appropriate web server configuration.

Example:

  $0 /opt/remocular-#VERSION# /var/www/remocular-#VERSION#

see the README for more information

HELP
exit 1
fi

opt=${1}
htdocs=${2}

root=`dirname $0`

cat <<START
Installing remOcular
--------------------
Server Directory:          $opt
Web Application Directory: $htdocs

START

if [ -d "$opt" ]; then
   echo "ERROR: the $opt directory already exists"
   exit 1
fi
mkdir -p "$opt"

if [ -d "$htdocs" ]; then
   echo "ERROR: the $htdocs directory already exists"
   exit 1
fi

mkdir -p "$htdocs"

echo "* Building Missing Perl Modules ..."

"$root/install/build_missing_perlmodules.sh" "$opt"

echo "* Copy Server Software ..."

cp -rp "$root/server/"* "$opt"

if [ ! -f "$opt/etc/remocular.cfg" ]; then
   cp "$opt/etc/remocular.cfg.dist" "$opt/etc/remocular.cfg"
fi

echo "* Copy Web Application ..."

cp -rp "$root/client/build/"* "$htdocs"

echo "* Create Service FCGI ..."
mkdir -p "$htdocs/service"

cat <<FCGI >"$htdocs/service/index.fcgi"
#!/bin/sh
exec "$opt/bin/jsonrpc.pl" "$opt/etc/remocular.cfg"
FCGI

chmod 755 "$htdocs/service/index.fcgi"

echo "* adding .htaccess file to service dir"

cat <<HTACCESS >"$htdocs/service/.htaccess"
AddHandler cgi-script cgi
DirectoryIndex index.cgi
# If we got FCGID enable fcgi variant
<IfModule mod_fcgid.c>
AddHandler fcgid-script fcgi
DirectoryIndex index.fcgi 
</IfModule>
HTACCESS

cat <<DONE
==========================================================================

Setup is complete. I have put a .htaccess file into 

  $htdocs/service/
  
make sure your webserver if happy with this.

If at all possible activate FastCGI support in your webserver since this
will help *massively* with performance.  In apache this means that you
should get the mod_fcgid activated.

Also since remOcular executes binaries on your webserver, you may want to
activate SuEXEC on the remOcular server.

Finally go to 

 $opt/etc/remocular.cfg
 
and modify it according to your wishes.

enjoy!
tobi oetiker
http://tobi.oetiker.ch
============================================================================
DONE
