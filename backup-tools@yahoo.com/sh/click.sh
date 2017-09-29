#!/usr/bin/env bash

SHELL_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

DATA_PATH=`echo "${SHELL_PATH}" | sed -e 's/\/sh$//'`

CNT_B=`ps aux | grep -c "/backup-gnome-extension.sh"`

CNT_R=`ps aux | grep -c "/retrieve-gnome-extension.sh"`

CNT=$((CNT_B + CNT_R))

if [ ${CNT} -le 2 ]
then
	if [ -f "/home/${USER}/gnome_shell_extensions_id.txt" ]
	then
		bash ${SHELL_PATH}/retrieve-gnome-extension.sh
		notify-send -i "${DATA_PATH}/icon.png" "Backup Tools" "Retrieve GNOME Shell Extensions successfully."
	else
		bash ${SHELL_PATH}/backup-gnome-extension.sh
		notify-send -i "${DATA_PATH}/icon.png" "Backup Tools" "Backup GNOME Shell Extensions successfully."
	fi
fi
