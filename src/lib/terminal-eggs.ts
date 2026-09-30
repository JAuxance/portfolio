/**
 * Hidden commands shared by every terminal on the site. Returns the output
 * lines, or null when the command is not an easter egg.
 */
export function easterEgg(cmd: string, arg: string): string[] | null {
  switch (cmd) {
    case 'sudo':
      return ['auxance is not in the sudoers file. This incident will be reported.'];
    case 'rm':
      return ['nice try. everything here is read-only. (and backed up.)'];
    case 'comet':
    case 'stars':
    case 'shoot':
      window.dispatchEvent(new CustomEvent('portfolio:comet'));
      return ['make a wish ✦'];
    case 'hello':
    case 'hi':
    case 'hey':
      return ['Hey you.'];
    case 'heather':
      return ['Heather is thinking… (she lives at the top of the home page — go say hi.)'];
    case '42':
      return ['the answer. now what was the question?'];
    case 'coffee':
    case 'tea':
      return ['☕ brewing…', 'error 418: I am a teapot.'];
    case 'china':
      return ['五年后见。 (see you in five years.)'];
    case 'ml':
    case 'rule':
      return ['never train a model I can’t explain.'];
    case 'vim':
    case 'vi':
    case 'nano':
    case 'emacs':
      return ['you are now trapped. (try :q! — it will not help.)'];
    case ':q!':
    case ':q':
    case 'exit':
    case 'quit':
      return ['there is no escape. scroll down instead.'];
    case 'ping':
      return ['pong. 0.42 ms. the server is a container, calm down.'];
    case 'git':
      return arg.startsWith('blame')
        ? ['it was the intern. (there is no intern.)']
        : ['git: this is a portfolio, not a repo. (try: github)'];
    default:
      return null;
  }
}
