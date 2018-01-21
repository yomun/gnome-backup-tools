#!/usr/bin/env bash

PREF_INPUT_PATH=""

INPUT_PATH="${1}"

if [ -d "${INPUT_PATH}" ]
then
	PREF_INPUT_PATH="${INPUT_PATH}"
else
	PREF_INPUT_PATH="/home/${USER}"
fi

if [ -f "${PREF_INPUT_PATH}/gnome_shell_extensions_id.txt" ]
then
	echo "1"
else
	echo "0"
fi
