# Aurial

Aurial is a browser-based HTML/JavaScript client interface for streaming music
from a [Subsonic](http://subsonic.org/) service (Subsonic version 5.3 or later
is currently required).

Born from my personal need for a music browser/player which met my needs, 
Aurial's aim is to provide a simple, intuitive and straight-forward interface
to browse and play Subsonic-hosted music, and to be as easy to deploy as it is 
to configure and use.


## Screenshots

Note that the current look and functionality may differ from what is shown 
here, as the application is still under development.

![Browsing the library](https://i.imgur.com/JmWY5Z3.png)

![Playing some music](https://i.imgur.com/1ImtXGR.png)

![Playlist support (work in progress)](https://i.imgur.com/ebDbB2T.png)


## Installation and Configuration

Download and place the contents of this repository in any HTTP-accessible 
location, and browse to that location.

Configuration is done on the "Settings" tab of the main application interface.

## Building

It is necessary to build the JavaScript components before the application
can be used:

```
$ npm install --global babel-cli  # you may need to sudo this
$ npm install babel-preset-react

# execute from within the project root direcory
babel --presets react js/ --out-file build/script.js --watch
```

Include or ommit `--watch` to have changes recompiled as source files are 
saved.
