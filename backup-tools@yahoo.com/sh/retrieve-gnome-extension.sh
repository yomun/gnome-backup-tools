#!/usr/bin/env bash

#
# https://jasonmun.blogspot.my
# https://github.com/yomun
# 
# Copyright (C) 2017 Jason Mun
# 

ENABLE_ALL_GNOME_SHELL_EXTENSIONS="0"

PREF_INPUT_PATH="${1}"

GNOME_SHELL_EXTENSION_ID_LIST=`cat ${PREF_INPUT_PATH}/gnome_shell_extensions_id.txt | sed -e "s/:.*//g" | tr "\n" " "`

GID=""

VERSION=`gnome-shell --version | sed 's/GNOME Shell //g'`
VER=`echo ${VERSION:0:4}`
echo ${VER}

LOCAL_PATH="${HOME}/.local/share/gnome-shell/extensions"

function getDownUrl()
{
	local URL=`curl "https://extensions.gnome.org/extension-info/?pk=${GID}&shell_version=${VER}" | sed 's/^.*download_url": "//g' | sed 's/", "pk".*//g'`
	local FULL_URL="https://extensions.gnome.org${URL}"
	local FOLDER_NAME=`echo ${URL} | sed 's/\/download-extension\///g' | sed 's/.shell-extension.zip.*//g'`
	
	echo [${GID}]${FULL_URL}
	echo [${GID}]${FOLDER_NAME}
	
	if [ -d "${LOCAL_PATH}/${FOLDER_NAME}" ]
	then
		echo "${FOLDER_NAME} installed already.."
	else
		wget -O /tmp/extension.zip "${FULL_URL}"
		mkdir -p "${LOCAL_PATH}/${FOLDER_NAME}"
		unzip /tmp/extension.zip -d "${LOCAL_PATH}/${FOLDER_NAME}"
	fi
}

for ix in ${GNOME_SHELL_EXTENSION_ID_LIST}
do
	GID="${ix}"
	getDownUrl
done

if [ "${ENABLE_ALL_GNOME_SHELL_EXTENSIONS}" = "1" ]
then
	# Enable all of GNOME Shell Extensions
	GNOME_SHELL_EXTENSION_UUID_LIST=`cat ${PREF_INPUT_PATH}/gnome_shell_extensions_id.txt | sed -e "s/^.*://g" | tr "\n" " "`
	for ix in ${GNOME_SHELL_EXTENSION_UUID_LIST}
	do
		gnome-shell-extension-tool -e ${ix}
	done
fi

# 恢复 Gnome Shell Extensions 所有设定
dconf load /org/gnome/shell/extensions/ < ${PREF_INPUT_PATH}/gnome_shell_extensions_conf.txt
dconf load /org/gnome/desktop/app-folders/ < ${PREF_INPUT_PATH}/gnome_shell_extensions_appfolder.txt

# restart gnome-shell
# dbus-send --type=method_call --print-reply --dest=org.gnome.Shell /org/gnome/Shell org.gnome.Shell.Eval string:'global.reexec_self()'
