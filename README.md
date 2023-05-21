# YouTube downloader app - experiments with Angular Signals

A single-page Android application that allows you to download YouTube videos in mp3 format and save them to your phone.

The goal of the project was to write a state management service using Angular Signals and compare it to the classic "service with a subject" solution, or the more structured one offered by the [@ngrx/component-store](https://ngrx.io/guide/component-store).

Note: you need to download and run this [express server](https://github.com/riccardoFasan/downloader-server) to download videos (on Xapacitor you cannot use libraries like [ytdl-core](https://github.com/fent/node-ytdl-core)).
