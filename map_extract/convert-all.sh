#!/bin/bash

set -e

if (( "$#" != 1 )) 
then
  echo "Usage: convert-all.sh <directory>"
  exit 1
fi

DIR="$( cd "$(dirname "$0")" ; pwd -P )"

while read filename; do
  node "$DIR/convert.js" "$filename" "$1" &
done < <(find "$1" -type f -name \*.dxf)
wait

echo "Finished converting"
