#!/usr/bin/env bash

for dir in `ls`;
do
    if [ -d "$dir" ]; then
	if [ -f "$dir/package.json" ]; then
  	    echo -e "\e[92mInstalling" $dir "..."
	    (cd $dir && npm install)
	else 
    	    echo -e "\e[93mNo package.json found in" $dir ", installation skipped"
	fi
    fi
done
echo "Installation done !"
