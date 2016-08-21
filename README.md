# Aurial

Aurial is a browser-based HTML/JavaScript client interface for streaming music from a [Subsonic](http://subsonic.org/) service (Subsonic version 5.3 or later is currently required). It relies on a modern browser with `<audio>` support, and intentionally does not support the use of a Flash player.

Aurial's aim is to provide a simple, intuitive and straight-forward interface to browse and play Subsonic-hosted music, and to be as easy to deploy as it is to configure and use.

As such, it focusses exclusively on playback of your music library, and by design does not support Subsonic's other media types, such as video, podcasts and internet radio.


## Download and Installation

For convenience, the latest automated build is available for download, so you do not need to configure or set up a build environment (if you do want to build it yourself, see the instructions below).

- [aurial.tar.gz](https://drone.io/github.com/shrimpza/aurial/files/dist/aurial.tar.gz)

To "install", simply extract the archive into a directory exposed via an HTTP service (there's no need for any server-side scripting or database).


## Screenshots

Note that the current look and functionality may differ from what is shown here, as the application is still under development.

![Browsing the library](https://i.imgur.com/JmWY5Z3.png)

![Playing some music](https://i.imgur.com/1ImtXGR.png)

![Playlist support (work in progress)](https://i.imgur.com/ebDbB2T.png)


## Installation and Configuration

Download and place the contents of this repository in any HTTP-accessible location, and browse to that location.

Configuration is done on the "Settings" tab of the main application interface.

## Building

The project is built via NPM and [Webpack](https://webpack.github.io/).

Install `npm` for your platform, and then execute the following in the project root directory:

```
$ npm install
$ npm run <watch|dist>
```

A `dist` directory will be produced containing the built output, which may be served via an HTTP server and accessed via a web browser.

`watch` includes additional debug information, which may not be optimal for production or general-use deployments, and produces a significantly larger download. `dist` will produce uglified and minified output suitable for general usage.
