#!/usr/bin/env bash
# Maakt van een build in map $1 de testversie: eigen cachenaam (raakt de live cache niet), eigen naam en icoon op het beginscherm.
set -euo pipefail
d="$1"
sed -i "s/speelveld-/proef-/g" "$d/sw.js"
sed -i 's/"name":"KijkSport Speelveld","short_name":"Speelveld"/"name":"KijkSport test","short_name":"KS test"/' "$d/manifest.webmanifest"
cp public-test/icon-192.png "$d/icon-192.png"
cp public-test/icon-512.png "$d/icon-512.png"
sed -i 's/content="Speelveld"/content="KS test"/;s/<title>KijkSport Speelveld<\/title>/<title>KijkSport test<\/title>/' "$d/index.html"
