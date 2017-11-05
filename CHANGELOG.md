## 0.4.0 - Call It What You Want

* Added support for projects with multiple root directories. With this change in place, you can now add multiple top-level folders to the tree view (e.g., via the "Application: Add Project Folder" command), and Significant Other will successfully switch between a source code file and its corresponding test file (and vice versa), regardless of where those files reside in the project. 

## 0.3.0 - Homemade Dynamite

* Added support for projects that use `.test.<extension>` as the naming convention for test files. For example, given a source code file named `project.js`, the corresponding test file would be named `project.test.js`. By default, projects using [atom-mocha-test-runner](https://github.com/BinaryMuse/atom-mocha-test-runner) use this convention. (e.g., the [atom/github](https://github.com/atom/github/tree/v0.3.4) package).

## 0.2.0 - Bachmanity Insanity

* Taught "toggle" command to cache the current file's significant other. This is especially helpful for large projects, where the the "toggle" command may take a while to execute. You'll still experience this delay the *first* time you toggle each file, but execution will be super fast for subsequent toggles on that file and its significant other.
* Added "clear cache" command. [[context](https://github.com/jasonrudolph/significant-other/pull/6#discussion_r82456722)]

## 0.1.0 - First Release

* Initial release. Introduced command to switch between a source code file and its corresponding test file, and vice versa.
