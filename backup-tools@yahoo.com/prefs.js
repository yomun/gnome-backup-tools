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

const GObject = imports.gi.GObject;
const Gtk     = imports.gi.Gtk;
const Gio     = imports.gi.Gio;
const Lang    = imports.lang;

const CurrExtension = imports.misc.extensionUtils.getCurrentExtension();

const Gettext = imports.gettext;
const _ = Gettext.domain(CurrExtension.metadata['gettext-domain']).gettext;

const Fields = {
	SETTINGS_ICON_SIZE    : 'icon-size',
	SETTINGS_POSITION     : 'position-in-panel',
	SETTINGS_PATH         : 'path'
};

const SCHEMA_NAME = 'org.gnome.shell.extensions.backup-tools';

const getSchema = function () {
	let schemaDir = CurrExtension.dir.get_child('schemas').get_path();
	let schemaSource = Gio.SettingsSchemaSource.new_from_directory(schemaDir, Gio.SettingsSchemaSource.get_default(), false);
	let schema = schemaSource.lookup(SCHEMA_NAME, false);

	return new Gio.Settings({ settings_schema: schema });
}

const SettingsSchema = getSchema();

function init() {
	let localeDir = CurrExtension.dir.get_child('locale');
	if (localeDir.query_exists(null))
		Gettext.bindtextdomain('backup-tools', localeDir.get_path());
}

const App = new Lang.Class({
	Name: 'Indicator.App',
	_init: function() {
		this.main = new Gtk.Grid({ margin: 10, row_spacing: 5, column_spacing: 0, column_homogeneous: false, row_homogeneous: false });

		this.field_SETTINGS_ICON_SIZE    = new Gtk.ComboBoxText();
		this.field_SETTINGS_POSITION     = new Gtk.ComboBoxText();
		this.field_SETTINGS_PATH         = new Gtk.Entry();
		
		let f1Label = new Gtk.Label({ label: _("Icon Size"),                                                                         hexpand: true, halign: Gtk.Align.START });
		let f2Label = new Gtk.Label({ label: _("Position on the Panel"),                                                             hexpand: true, halign: Gtk.Align.START });
		let f3Label = new Gtk.Label({ label: _("The Path of save data (/home/user)"),                                                hexpand: true, halign: Gtk.Align.START });
		let llLabel = new Gtk.Label({ label: _("---------------------------------------------------------------------------------"), hexpand: true, halign: Gtk.Align.START });
		let lrLabel = new Gtk.Label({ label: _("--------------------------------------------------------------------------------"),  hexpand: true, halign: Gtk.Align.START });
		let mgLabel = new Gtk.Label({ label: _(""),                                                                                  hexpand: true, halign: Gtk.Align.START });
		
		mgLabel.set_markup('<a href="https://github.com/yomun/gnome-backup-tools">https://github.com/yomun/gnome-backup-tools</a>\n');
		
		this.main.attach(f1Label, 2, 1, 2 ,1);
		this.main.attach(f2Label, 2, 2, 2 ,1);
		this.main.attach(f3Label, 2, 3, 2 ,1);
		this.main.attach(llLabel, 2, 4, 2 ,1);
		this.main.attach(mgLabel, 2, 5, 2 ,1);

		this.main.attach(this.field_SETTINGS_ICON_SIZE,    4, 1, 2, 1);
		this.main.attach(this.field_SETTINGS_POSITION,     4, 2, 2, 1);
		this.main.attach(this.field_SETTINGS_PATH,         4, 3, 2, 1);
		this.main.attach(lrLabel,                          4, 4, 2, 1);
		
		var self = this;
		
		[_("16"),_("24"),_("32"),_("48"),_("64")].forEach(function(item) { self.field_SETTINGS_ICON_SIZE.append_text(item); });
		[_("left"),_("center"),_("right")].forEach(function(item) { self.field_SETTINGS_POSITION.append_text(item); });
		
		this.field_SETTINGS_ICON_SIZE.set_active(   SettingsSchema.get_enum(Fields.SETTINGS_ICON_SIZE));
		this.field_SETTINGS_POSITION.set_active(    SettingsSchema.get_enum(Fields.SETTINGS_POSITION));
		
		this.field_SETTINGS_ICON_SIZE.connect(   'changed', function(pos) { SettingsSchema.set_enum(Fields.SETTINGS_ICON_SIZE,    self.field_SETTINGS_ICON_SIZE.get_active()); });
		this.field_SETTINGS_POSITION.connect(    'changed', function(pos) { SettingsSchema.set_enum(Fields.SETTINGS_POSITION,     self.field_SETTINGS_POSITION.get_active()); });
		
		SettingsSchema.bind(Fields.SETTINGS_PATH, this.field_SETTINGS_PATH, 'text' , Gio.SettingsBindFlags.DEFAULT);
        
		this.main.show_all();
	}
});

function buildPrefsWidget() {
	let widget = new App();
	return widget.main;
};
