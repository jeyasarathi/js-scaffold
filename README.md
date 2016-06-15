#js-scaffold

  * js-scaffold is meant to acts as a base to build and deploy an out-and-out JavaScript application.
  * It is meant to reduce the pain to setup and deploy a JS application system with all the standard tools in place ready to go for 		application development.

#What it has

  * Package manager : npm
  * Build tool : gulp
  * Test Runner : Karma
  * JS Library Copy, Compile and Build Automation
  * Express application scaffold
  * CSS pre-compiler : SASS 
  * Babel - ES6/ES7 compiler
  * JS Lint
  * Istanbul JS Code Coverage and Reports

#Installation:

##NodeJS/npm:

````
$: sudo apt-get install nodejs
````

````
$: sudo apt-get install npm
````

````
$: sudo ln -s /usr/bin/nodejs /usr/bin/node
````

#### Check Installation:
 
````
$: node -v
````

````
$: npm -v
````

##Gulp:

````
$: npm install --global gulp
````


#Build:

##Clean:

Gulp clean deletes the compiled files in distribution directories

````
$: gulp clean
````

##Build:

Gulp build compiles the files in source directories into build directory

````
$: gulp build
````

##Dist:

Gulp dist minifies (JS/CSS) and copies the build files into distribution directories

````
$: gulp dist
````









