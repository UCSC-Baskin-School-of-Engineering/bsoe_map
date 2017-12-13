#!bin/bash

# node convert.js ./floorB.dxf ../src/floors
for filename in ./*.dxf; do node convert.js "$filename" ../src/floors/ & done
wait