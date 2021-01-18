# OneNote desktop app for linux

[![onenote-desktop](https://snapcraft.io/onenote-desktop/badge.svg)](https://snapcraft.io/onenote-desktop)

[OneNote](https://onenote.com/) web-app wrapped in Electron to open as a desktop app.

___

This app does not modify or use any direct code from One Note. Just uses [Electron](https://github.com/electron/electron) to open a browser window, and serve it as a desktop application since Linux does not have an official releases of some apps. Uses Electron's BowserView to display third-party webpage/webapp.

Started because I prefer using separate apps, and not opening everything in my browser. And, because I hate using Ubuntu's dock, and I'd rather have it open in a window of its own and easily accessible from the dock.

___

## Installing/Using OneNote desktop
1. `.deb` and `.AppImage` files can be found on the [releases page](https://github.com/anujdatar/onenote-desktop/releases).
2. A Snap package can be directly installed from Snap Store `$ snap install onenote-desktop`

**Note**: The AppImage does not have any installation like capabilities. So it does not copy over any icons or `.desktop` shortcuts. You might have to do that yourself. I will try and add the feature at some point. Trying to work on a couple of quality of life/ease of use features at the moment.

___

## Running the dev environment

```bash
git clone https://github.com/anujdatar/onenote-desktop
cd onenote-desktop
npm install
npm start
```

___

## Building the app

Run through the entire build process with one command. (Now using electron-builder)
- Removes stale build files and the `./dist` folder. *So you might want to copy over any old build you want to keep*
- Builds a debian (`.deb`) package, an `AppImage`, and a Snap package (`.snap`) all at once.

```bash
npm run build
```

___

## Author

* Anuj Datar - [GitHub](https://github.com/anujdatar/)

___

## License

This project is licensed under the MIT License - see [LICENSE](https://github.com/anujdatar/onenote-desktop/LICENSE.md) for details.

**One Note** or **OneNote** the name, website, images/icons and code are the intellectual properties of [Microsoft](https://www.microsoft.com/), [One Note](https://onenote.com/).
