'use babel';

import Matchmaker from './matchmaker'
import {
  CompositeDisposable
} from 'atom'

export default {
  subscriptions: null,
  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a
    // CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'significant-other:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {}
  },

  getFilePath() {
    return atom.workspace.getActiveTextEditor().getPath()
  },

  toggle() {
    const filePath = this.getFilePath()
    const matchmaker = Matchmaker.for(filePath)

    matchmaker.complementaryPath().then((path) => {
      if (path) {
        atom.workspace.open(path)
      } else {
        atom.notifications.addWarning('No significant other found 😱')
      }
    })
  },
};
