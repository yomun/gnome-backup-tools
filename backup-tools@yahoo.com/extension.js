/*
 * 'Backup Tools' gnome extension
 * https://jasonmun.blogspot.my
 * https://github.com/yomun/backup-tools
 * 
 * Copyright (C) 2017 Jason Mun
 *
 * 'Backup Tools' gnome extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * 'Backup Tools' gnome extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 'Backup Tools' gnome extension.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

const Lang        = imports.lang;
const Gio         = imports.gi.Gio;
const GLib        = imports.gi.GLib;
const Shell       = imports.gi.Shell;
const Soup        = imports.gi.Soup;
const St          = imports.gi.St;
const Main        = imports.ui.main;
const PanelMenu   = imports.ui.panelMenu;
const PopupMenu   = imports.ui.popupMenu;
const Mainloop    = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;
const CurrExtension  = ExtensionUtils.getCurrentExtension();

const shell_path     = CurrExtension.path + "/sh";
const BoxLayout      = CurrExtension.imports.boxlayout.BoxLayout;
const Convenience    = CurrExtension.imports.convenience;
const Utilities      = CurrExtension.imports.utilities;
const Metadata       = CurrExtension.metadata;

const Gettext = imports.gettext.domain(Metadata['gettext-domain']);
const _ = Gettext.gettext;

const DEFAULT_ICON_SIZE = 16;

const SETTINGS_POSITION = 'position-in-panel';
const SETTINGS_PATH     = 'path';

let menu_item_1 = null;
let menu_item_2 = null;

const PanelMenuButton = new Lang.Class({
	Name: "PanelMenuButton",
	Extends: PanelMenu.Button,

	_init: function(file, updateInterval) {
		this.parent(0, "", false);
		
		this._textureCache = St.TextureCache.get_default();
		
		this._settings = Convenience.getSettings(CurrExtension.metadata['settings-schema']);
		
		let self = this;
		
		// Preferences
		let _appSys = Shell.AppSystem.get_default();
		let _gsmPrefs = _appSys.lookup_app('gnome-shell-extension-prefs.desktop');
		let prefs = new PopupMenu.PopupMenuItem(_(" Preferences..."));
		prefs.connect('activate', function() {
			if (_gsmPrefs.get_state() == _gsmPrefs.SHELL_APP_STATE_RUNNING) {
				_gsmPrefs.activate();
			} else {
				let info = _gsmPrefs.get_app_info();
				let timestamp = global.display.get_current_time_roundtrip();
				info.launch_uris([Metadata.uuid], global.create_app_launch_context(timestamp, -1));
				info = null; timestamp = null;
			}
		});		
		this.menu.addMenuItem(prefs);
		_appSys = null; prefs = null;
		
		// Backup GNOME Shell Extensions
		
		menu_item_1 = new PopupMenu.PopupMenuItem('');
		let boxLayout111 = new St.BoxLayout();
		let boxLayout112 = new St.BoxLayout();
		boxLayout112.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-playback-start', icon_size: 12 }));
		boxLayout112.add_actor(new St.Label({ style_class: 'popup-menu-icon', text: _(" Backup GNOME Shell Extensions") }));
		menu_item_1.actor.add(boxLayout112);
		this.menu.addMenuItem(menu_item_1);
		menu_item_1.connect('activate', function() {
			let path = self._settings.get_string(SETTINGS_PATH);
			let argv = ["bash", shell_path + "/click.sh", path.toString()];
			GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
			menu_item_2.actor.show();
		});
		boxLayout111 = null;
		boxLayout112 = null;
		
		// Retrieve GNOME Shell Extensions
		
		menu_item_2 = new PopupMenu.PopupMenuItem('');
		let boxLayout211 = new St.BoxLayout();
		let boxLayout212 = new St.BoxLayout();
		boxLayout212.add_actor(new St.Icon({ style_class: 'popup-menu-icon', icon_name: 'media-playback-start', icon_size: 12 }));
		boxLayout212.add_actor(new St.Label({ style_class: 'popup-menu-icon', text: _(" Retrieve GNOME Shell Extensions") }));
		menu_item_2.actor.add(boxLayout212);
		this.menu.addMenuItem(menu_item_2);
		menu_item_2.connect('activate', function() {
			let path = self._settings.get_string(SETTINGS_PATH);
			let argv = ["bash", shell_path + "/check.sh", path.toString() ];
			let [result, output, std_err, status] = self._spawnWithPipes(argv);
			if (result) {
				if (output !== null) {
					if (output.toString().trim().length > 0) {
						let str = output.toString();
						if (str.indexOf("1") > -1) {
							argv = ["bash", shell_path + "/click.sh", path.toString()];
							GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null);
						} else {
							Main.notify(_("'Retrieve' function is Not ready yet.."));
						}
						str = null;
					} else {
						Main.notify(_("'Retrieve' function is Not ready yet.."));
					}
				}
			}
			argv = null;
		});
		boxLayout211 = null;
		boxLayout212 = null;
		
		// show/hide 'Retrieve GNOME Shell Extensions'
		let path = this._settings.get_string(SETTINGS_PATH);
		let argv = ["bash", shell_path + "/display-menu.sh", path.toString() ];
		let [result, output, std_err, status] = this._spawnWithPipes(argv);
		if (result) {
			if (output !== null) {
				if (output.toString().trim().length > 0) {
					let str = output.toString();
					if (str.indexOf("1") > -1) {
						menu_item_2.actor.show();
					} else {
						menu_item_2.actor.hide();
					}
					str = null;
				}
			}
		}
		argv = null;
		
		this.setPrefs();
		
		this._settings.connect('changed', Lang.bind(this, function() {
			
			let position = this._settings.get_string(SETTINGS_POSITION);
			if (this._prevMenuPosition !== position) {
				this.setPrefs();
			
				reset_Indicator();
			} else {
				this.setPrefs();
			}
		}));
		
		this._file = file;

		if (this._BoxLayout == null) {
			this._BoxLayout = new BoxLayout();
			this.actor.add_actor(this._BoxLayout);
		}
		
		this._BoxLayout.setPanelLine();

		this._refresh();
	},
	
	setPrefs: function() {
		this._prevMenuPosition = this._menuPosition;

		this._menuPosition = this._settings.get_string(SETTINGS_POSITION);
	},

	_update: function() {
	},
	
	_refresh: function () {
		this._loadData();
		
		return true;
	},
	
	_loadData: function () {
	},

	_removeTimeout: function () {
	},
	
	_trySpawnSyncWithPipes: function(argv) {
        let retval = [false, null, null, -1];

        try {
            retval = GLib.spawn_sync(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null, null);
        } catch (err) {
            if (err.code == GLib.SpawnError.G_SPAWN_ERROR_NOENT) {
                err.message = _("Command not found");
            } else {
                err.message = err.message.replace(/.*\((.+)\)/, '$1');
            }

            throw err;
        }
        return retval;
    },
	
	_spawnWithPipes: function(argv) {
        try {
            return this._trySpawnSyncWithPipes(argv);
        } catch (err) {
            this._handleSpawnError(argv[0], err);
            return [false, null, err.message, -1];
        }
    },
	
	_handleSpawnError: function(command, err) {
        let title = _("Execution of '%s' failed:").format(command);
        log(title);
        log(err.message);
    },
	
	stop: function () {
		this._BoxLayout.remove_all_children();
	},
	
	destroy: function () {
		this.stop();
	},
});

function _trySpawnSyncWithPipes(argv) {
	let retval = [false, null, null, -1];

	try {
		retval = GLib.spawn_sync(null, argv, null, GLib.SpawnFlags.SEARCH_PATH, null, null);
	} catch (err) {
		if (err.code == GLib.SpawnError.G_SPAWN_ERROR_NOENT) {
			err.message = _("Command not found");
		} else {
			err.message = err.message.replace(/.*\((.+)\)/, '$1');
		}

		throw err;
	}
	return retval;
}
	
function _spawnWithPipes(argv) {
	try {
		return _trySpawnSyncWithPipes(argv);
	} catch (err) {
		_handleSpawnError(argv[0], err);
		return [false, null, err.message, -1];
	}
}

function _handleSpawnError(command, err) {
	let title = _("Execution of '%s' failed:").format(command);
	log(title);
	log(err.message);
}

function reset_Indicator() {	
	Main.panel.statusArea['backup-tools']._BoxLayout.destroy_all_children();
	Main.panel.statusArea['backup-tools'].menu.actor.destroy_all_children();
	Main.panel.statusArea['backup-tools'].menu = null;
	Main.panel.statusArea['backup-tools'].actor.destroy_all_children();
	Main.panel.statusArea['backup-tools'].actor = null;
	Main.panel.statusArea['backup-tools'].container.destroy_all_children();
	Main.panel.statusArea['backup-tools'].destroy();
	Main.panel.statusArea['backup-tools'] = null;
	
	button = null;
	removeButtons();
	
	reset_var();
	addButtons();
}

function reset_var() {
}

let button = null;
let buttons = [];

function init() {
}

function addButtons() {
	
	let settings = Utilities.parseFilename("menu.sh");
	//button = new PanelMenuButton(files[0], settings.updateInterval);
	button = new PanelMenuButton(null, settings.updateInterval);
	buttons.push(button);
	
	let settings2 = Convenience.getSettings(CurrExtension.metadata['settings-schema']);
	let menuPosition = settings2.get_string(SETTINGS_POSITION);
	
	Main.panel.addToStatusArea("backup-tools", button, 1, menuPosition);
	// Main.panel.addToStatusArea("backup-tools", button, settings.position, settings.box);
}

function removeButtons() {
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].destroy();
		buttons[i] = null;
	}
	buttons = [];
}

function refresh() {
}

function enable() {
	reset_var();
	addButtons();
}

function disable() {
	Main.panel.statusArea['backup-tools']._BoxLayout.destroy_all_children();
	Main.panel.statusArea['backup-tools'].menu.actor.destroy_all_children();
	Main.panel.statusArea['backup-tools'].menu = null;
	Main.panel.statusArea['backup-tools'].actor.destroy_all_children();
	Main.panel.statusArea['backup-tools'].actor = null;
	Main.panel.statusArea['backup-tools'].container.destroy_all_children();
	Main.panel.statusArea['backup-tools'].destroy();
	Main.panel.statusArea['backup-tools'] = null;
	
	button = null;
	removeButtons();
}
