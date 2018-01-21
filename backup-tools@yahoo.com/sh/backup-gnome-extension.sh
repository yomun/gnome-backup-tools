#!/usr/bin/env bash

#
# https://jasonmun.blogspot.my
# https://github.com/yomun
# 
# Copyright (C) 2017 Jason Mun
# 

re='^[0-9]+$'

ID_ARRAY=()

PREF_INPUT_PATH="${1}"

LIST_GNOME_SHELL_EXTENSIONS=`ls ${HOME}/.local/share/gnome-shell/extensions | tr "\n" " "`

for i in ${LIST_GNOME_SHELL_EXTENSIONS}
do
	# https://extensions.gnome.org/extension-query/?page=1&shell_version=all&search=jasonmun%40yahoo.com
	# "link": "/extension/1270/auto-ovpn/", "pk": 1270,
	ID=`curl "https://extensions.gnome.org/extension-query/?page=1&shell_version=all&search=${i}" | sed -e "s/^.*\/extension\///g" | sed -e "s/\/.*//g"`
	
	if ! [[ ${ID} =~ ${re} ]]
	then
		ID_ARRAY+=("0")
	else
		ID_ARRAY+=("${ID}")
	fi
done

CMD=`rm -rf ${PREF_INPUT_PATH}/gnome_shell_extensions_id.txt`
CMD=`rm -rf ${PREF_INPUT_PATH}/gnome_shell_extensions_appfolder.txt`

cnt=0

for i in ${LIST_GNOME_SHELL_EXTENSIONS}
do
	if [ "${ID_ARRAY[$cnt]}" = "0" ]
	then
		echo ""
	else
		echo "${ID_ARRAY[$cnt]}:${i}" >> ${PREF_INPUT_PATH}/gnome_shell_extensions_id.txt
	fi
	
	cnt=$((cnt + 1))
done

# 恢复 Gnome Shell Extensions 所有设定
# dconf load /org/gnome/shell/extensions/ < gnome_shell_extensions_conf.txt

# 将所有 Gnome Shell Extensions 改用预设值
# dconf reset -f /org/gnome/shell/extensions/

# 备份 Gnome Shell Extensions 所有设定
dconf dump /org/gnome/shell/extensions/ > ${PREF_INPUT_PATH}/gnome_shell_extensions_conf.txt
dconf dump /org/gnome/desktop/app-folders/ > ${PREF_INPUT_PATH}/gnome_shell_extensions_appfolder.txt
