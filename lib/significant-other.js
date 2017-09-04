const Matchmaker = require('./matchmaker')
const {CompositeDisposable} = require('atom')

module.exports = ({
  subscriptions: null,
  cache: {},
  activate (state) {
    // Events subscribed to in atom's system can be easily cleaned up with a
    // CompositeDisposable
    this.subscriptions = new CompositeDisposable()
    this.cache = state.cache || {}

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'significant-other:toggle': () => this.toggle(),
      'significant-other:clear-cache': () => this.clearCache()
    }))
  },

  deactivate () {
    this.subscriptions.dispose()
    this.cache = {}
  },

  serialize () {
    return {
      cache: this.cache
    }
  },

  getFilePath () {
    return atom.workspace.getActiveTextEditor().getPath()
  },

  clearCache () {
    this.cache = {}
  },

  toggle () {
    const filePath = this.getFilePath()
    const matchmaker = Matchmaker.for(filePath)

    // use cached path if we can
    if (this.cache[filePath]) {
      atom.workspace.open(this.cache[filePath])
      return
    }

    matchmaker.complementaryPath().then((path) => {
      if (path) {
        // cache results for both directions
        this.cache[filePath] = path
        this.cache[path] = filePath

        atom.workspace.open(path)
      } else {
        atom.notifications.addWarning('No significant other found 😱')
      }
    })
  }
})
