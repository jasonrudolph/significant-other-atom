# Significant Other: An Atom Package

TODO: Add short description of the package

![demo](https://cloud.githubusercontent.com/assets/2988/11921768/6825b086-a75c-11e5-87c3-5bbe899dce75.gif)

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

- [ ] Populate README.md
- [ ] Populate CHANGELOG.md
- [ ] Release 0.1.0
- [ ] Cache the last _n_ matches for faster toggling
- [ ] Support projects that have multiple root directories [[code]](https://github.com/jasonrudolph/significant-other/blob/73cdeca7ced2f8ae7140fa492a88455dc665c783/lib/matchmaker.coffee#L103)
- [ ] Consider providing option to open significant other in a split pane
- [ ] Consider exposing the [list of test/spec suffixes](https://github.com/jasonrudolph/significant-other/blob/e6abd32868203726dcc43b3542b73804e1b2515e/lib/matchmaker.coffee#L169) as a [configuration option](https://atom.io/docs/v1.3.2/behind-atom-configuration-api)
- [ ] Consider [excluding some directories from the search for better performance](https://github.com/jasonrudolph/significant-other/blob/9f64d09a0012ff39737251f1e76e34c4ccb26fdb/lib/matchmaker.coffee#L92-L98)
- [ ] Set up CI

[atom-keymaps]: https://atom.io/docs/v1.3.2/using-atom-basic-customization#customizing-key-bindings
