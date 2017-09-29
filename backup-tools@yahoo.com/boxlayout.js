/*
 * Backup Tools gnome extension
 * https://jasonmun.blogspot.my
 * https://github.com/yomun/backup-tools
 * 
 * Copyright (C) 2017 Jason Mun
 *
 * Backup Tools gnome extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Backup Tools gnome extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Backup Tools gnome extension.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Gio     = imports.gi.Gio;
const GLib    = imports.gi.GLib;
const St      = imports.gi.St;
const Main    = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const CurrExtension  = ExtensionUtils.getCurrentExtension();
const Convenience    = CurrExtension.imports.convenience;

const SETTINGS_ICON_SIZE    = 'icon-size';

let DEFAULT_ICON_SIZE = 16;

const BoxLayout = new Lang.Class({
	Name: "BoxLayout_Backup_Tools",
	Extends: St.BoxLayout,

	_init: function(line) {
		this.parent({ style_class: "" });
	},
	
	setPanelLine: function() {
			
		let flags_file_path = CurrExtension.path + "/icon.png";

		this._settings = Convenience.getSettings(CurrExtension.metadata['settings-schema']);

		let gicon = null;
		let StIcon = null;

		if (GLib.file_test (flags_file_path, GLib.FileTest.EXISTS)) {

				let icon_size  = this._settings.get_string(SETTINGS_ICON_SIZE);
				if (icon_size.length > 0) {
					DEFAULT_ICON_SIZE = icon_size;
				}
				icon_size = null;

				gicon = Gio.icon_new_for_string(flags_file_path);
				StIcon = new St.Icon({ gicon: gicon, icon_size: DEFAULT_ICON_SIZE});
				this.remove_all_children();
				this.add_child(StIcon);
		}

		flags_file_path = null;
		gicon = null;
		StIcon = null;
	},
	
	destroy: function () {
	}
});
