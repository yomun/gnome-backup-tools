#!/usr/bin/env bash

if [ -f "/home/${USER}/.gnome_shell_extensions_id.txt" ]
then
	echo "1"
else
	echo "0"
fi
