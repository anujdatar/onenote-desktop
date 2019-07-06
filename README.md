# OneNote desktop app for linux

  [OneNote](https://onenote.com/) web-app wrapped in Electron to open as a desktop app. Since linux doesn't have a lot of apps.

___
This app does not modify or use any direct code from One Note. Just uses [Electron](https://github.com/electron/electron) to open a browser window, and serve it as a desktop application since Linux does not have an official releases of some apps. Uses Electron's BowserView to display third-party webpage/webapp.

Started because I prefer using separate apps, and not opening everything in my browser. And, because I hate using Ubuntu's dock, and I'd rather have it open in a window of its own and easily accessible from the dock.

___

## Running the dev environment

```bash
git clone https://github.com/anujdatar/onenote-desktop
cd onenote-desktop
npm install
npm start
```

___

## Building the app for debian

Run through the entire build process with one command. (Now using electron-builder)

```bash
npm run build
```

## Author

* Anuj Datar - [GitHub](https://github.com/anujdatar/)

## License

This project is licensed under the MIT License - see [LICENSE](https://github.com/anujdatar/onenote-desktop/LICENSE.md) for details.

**One Note** or **OneNote** the name, website, images/icons and code are the intellectual properties of [Microsoft](https://www.microsoft.com/), [One Note](https://onenote.com/).
