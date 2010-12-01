#!/bin/bash
## other decision structure
set -o errexit
# don't try to remember where things are
set +o hashall
## do not tollerate unset variables
set -u 

if [ ${2:-no} = no ]; then
cat <<HELP
usage: $0 <INSTALLDIR>

The remOcular installer will install the remocular server
in <INSTALLDIR> and adjust the required path names accordingly.

If any perl modules have to be built, the script will access the
internet to get the required files.

Note that no special privileges are required for running the script.

remOcular will work fine when installed as a normal user, given
an appropriate web server configuration.

Example:

  $0 /opt/remocular-#VERSION#

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

START

if [ -d "$opt" ]; then
   echo "ERROR: the $opt directory already exists"
   exit 1
fi
mkdir -p "$opt"

echo "* Building Missing Perl Modules ..."

"$root/install/build_missing_perlmodules.sh" "$opt"

echo "* Copy Server Software ..."

cp -rp "$root/backend/"* "$opt"

if [ ! -f "$opt/etc/remocular.cfg" ]; then
   cp "$opt/etc/remocular.cfg.dist" "$opt/etc/remocular.cfg"
fi

cat <<FCGI >"$opt/bin/remocular.fcgi"
#!/bin/sh
exec "$opt/bin/remocular.pl" fastcgi
FCGI
chmod 755 "$opt/bin/remocular.fcgi"

cat <<DONE
==========================================================================

Setup is complete.

To get going quickly try running remOcular with its built-in webserver

 $opt/bin/remocular.pl daemon

Or if you have a webserver with fastcgi support, try putting

 $opt/bin/remocular.fcgi

into your web tree and access 

 http://site/path/remocular.fcgi/

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
