# OneNote desktop app for linux

[![onenote-desktop](https://snapcraft.io/onenote-desktop/badge.svg)](https://snapcraft.io/onenote-desktop)

[OneNote](https://onenote.com/) web-app wrapped in Electron to open as a desktop app.

___

This app does not modify or use any direct code from OneNote. Just uses [Electron](https://github.com/electron/electron) to open a browser window, and serve it as a desktop application since Linux does not have an official releases of some apps. Uses Electron's BowserView to display third-party webpage/webapp.

Started because I prefer using separate app windows, and not opening everything in my browser. And, because I hate using Ubuntu's dock.
___

## What's new?
1. **App menu bar** - Auto-hidable menu bar. Use `Alt` to toggle hidden toolbar.
2. **Forward/Back** - nav buttons in the app menubar.
3. **Homepage** - Navigate to onenote homepage from menubar. if you're stuck on some other page.
4. **App Reset** - New menu options under `Help` to reset app to defaults in case you run into errors, or bugs. These options do not make any changes to *Microsoft OneNote* settings or data. They only reset the local wrapper app's settings or history.
   - *Soft Reset* - i.e. reset to app defaults without deleting history/logins. (Reset app defaults)
   - *Hard Reset* - i.e. wipe everything and reset to defaults. you will need to login again. (Reset App - Everything)

___
## Installing/Using OneNote desktop
1. `.deb` and `.AppImage` files can be found on the [releases page](https://github.com/anujdatar/onenote-desktop/releases).
2. A Snap package can be directly installed from Snap Store `$ snap install onenote-desktop`

**Note**: The AppImage does not have any installation like capabilities. So it does not copy over any icons or `.desktop` shortcuts. You might have to do that yourself. I will try and add the feature at some point.

___

## Running the dev environment

```bash
git clone https://github.com/anujdatar/onenote-desktop
cd onenote-desktop
npm install
npm run tsc-start
```

___

## Building the app

Run through the entire build process with one command. (Now using electron-builder)
- Removes stale build files and `dist` & `lib` folders. *So you might want to copy over any old build you want to keep*
- Compiles the typescript files
- Builds a debian (`.deb`) package, an `AppImage`, and a Snap package (`.snap`) all at once.

```bash
npm run build
```

___
## FAQ
Q: What if I am stuck on some other page, and cannot return to my notebooks?

A: Go to app menubar `Navigate`>`Forward` or `Backward` or `OneNote Home`
<br>

Q: I can't see the app menubar at the top. What do I do?

A: Press `Alt` to show/hide menubar. If you wish to make menu visible at all times, toggle the `Auto-hide MenuBar` option in the `Settings` menu option.
<br>

Q: The app is behaving in an unexpected manner. What do I do?

A: Try to reset the local app settings from the `Help` menu. Should just help to reset any corrupted configs, or local cache. If this does not work, try to delete the config folders manually (steps given below). If this too does not help, please open a new issue on [GitHub](https://github.com/anujdatar/onenote-desktop/issues/new/choose).


## Manually resetting the app
Clearing the local settings only

If you installed the app using the `.deb` package, or are using the `AppImage`:

1. Close the app.
2. Go to `/home/<user>/.config/onenote-desktop` or `/home/<user>/.config/OneNote`.
3. Delete the `config.json` file.
4. Restart the app.

OR

If you are using `.snap`, i.e. you used `sudo snap install onenote-desktop` or used the Ubuntu App Store to install the app:

1. Close the app.
2. Go to `/home/<user>/snap/onenote-desktop/current/.config/OneNote/`.
3. Delete the `config.json` file.
4. Restart the app.

For clearing local history, cache and login session:<br>
1. Close the app
2. Delete the entire folder mentioned in **Step 2** above.
3. Restart the app.
___

## TODO
1. Implement 'Minimize to Tray' and 'Close to Tray'. Only have placeholders at the moment, they don't do anything. It's not an error.
2. Make about popup center itself inside the main window.
3. Dark Mode maybe?

___
## Author

* Anuj Datar - [GitHub](https://github.com/anujdatar/)

___

## License

This project is licensed under the MIT License - see [LICENSE](https://github.com/anujdatar/onenote-desktop/LICENSE.md) for details.

**One Note** or **OneNote** the name, website, images/icons and code are the intellectual properties of [Microsoft](https://www.microsoft.com/), [One Note](https://onenote.com/).
