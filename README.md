React App - unpackaged
======================

Simple example of a React S.P.A. that emulates a simple market, shows props use, routing, data binding and uses Firebase as a simple backend to show persistence.  Based on Wes Bos's React course.

Requirements
------------
Need node & npm installed, which can be done via brew.

Use
---

First run `npm update` from the root directory (where package.json lives).  Once all dependencies are downloaded, simply run `gulp` to launch start the webapp.  With it running, it will watch change to files and update web page on changes.

Notes
-----

- build folder contains the compiled source.
- scripts contains the js, with helpers.js providing some utility, and sample-fishes giving some example data to work with.
- css contains the css, which is written in Stylus (basically SASS with pythonic syntax)
- 'App' is the main application component and entry point for the app.  index.html has a single div with id of 'main' that ReactDOM renders to (seen in the bottom of the page).

To fully utilize and see the data flow, you'll need to create a Firebase account.  It's free for development, and provides a neat and super fast way to model up a backend.  Edit line 15 with the url for your own firebase app, and update data in firebase to see it immediately reflected in the react app.