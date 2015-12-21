# Significant Other: An Atom Package

Provides a command to quickly switch between a source code file and its corresponding test file, and vice versa. Works with [most project structures](#supported-project-structures).

![demo](https://cloud.githubusercontent.com/assets/2988/11921768/6825b086-a75c-11e5-87c3-5bbe899dce75.gif)

## Supported project structures

Significant Other is intended to work automatically with popular project structures. It works with the project structure used in Rails projects, in Atom packages, in Ruby gems, and it will hopefully work for your project as well. To provide its functionality, Significant Other makes a few assumptions (listed below) about your project's conventions.

Significant Other assumes that:

- You want to toggle between a source file and *the* corresponding test file, or vice versa.
- The source file and the test file *start* with the same name. The test file *may* include a suffix of `_test`, `_spec`, or `-spec`. For example, you can toggle between:
    - `lib/profile.coffee` and `spec/profile.coffee`
    - `app/models/profile.rb` and `test/models/profile_test.rb`
    - `src/profile.js` and `src/profile_spec.js`
    - `profile.js` and `profile-spec.js`
- The source file and the test file have the same file extension. (I may consider removing this assumption at some point.)

If your project follows a well-defined, widely-used project structure that doesn't satisfy the assumptions above, please [let me know about it][open-an-issue] so that I can consider enhancing the package to support that project structure.

## Installation

Using `apm`:

```
apm install significant-other
```

Or search for `significant-other` in the Atom Settings UI.

## Bring your own keymap

You may want to use a keyboard shortcut for switching between source files and test files. This package does not provide a keyboard shortcut by default, but you can easily [define your own][atom-keymaps]. For example, if you wanted to use `Control-.`, you'd add the following mapping to your `~/.atom/keymap.cson` file:

```cson
'atom-workspace atom-text-editor:not(.mini)':
  'ctrl-.': 'significant-other:toggle'
```

## TODO

- [ ] Release 0.1.0
- [ ] Cache the last _n_ matches for faster toggling
- [ ] Support projects that have multiple root directories [[code]](https://github.com/jasonrudolph/significant-other/blob/73cdeca7ced2f8ae7140fa492a88455dc665c783/lib/matchmaker.coffee#L103)
- [ ] Consider providing option to open the current file's significant other in a split pane
- [ ] Consider exposing the [list of test/spec suffixes](https://github.com/jasonrudolph/significant-other/blob/e6abd32868203726dcc43b3542b73804e1b2515e/lib/matchmaker.coffee#L169) as a [configuration option](https://atom.io/docs/v1.3.2/behind-atom-configuration-api)
- [ ] Consider [excluding some directories from the search for better performance](https://github.com/jasonrudolph/significant-other/blob/9f64d09a0012ff39737251f1e76e34c4ccb26fdb/lib/matchmaker.coffee#L92-L98)
- [ ] Set up CI

[atom-keymaps]: https://atom.io/docs/v1.3.2/using-atom-basic-customization#customizing-key-bindings
[open-an-issue]: https://github.com/jasonrudolph/significant-other/issues/new
