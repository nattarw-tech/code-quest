// Maps raw Python exception types to beginner-friendly guidance.
// error = { type, message, line }

const FRIENDLY = {
  NameError: (msg) => {
    const m = msg.match(/name '(.+)' is not defined/);
    const name = m ? m[1] : 'that name';
    return `Python doesn't know what "${name}" is. Did you spell it correctly, or forget to create it first?`;
  },
  IndentationError: () => 'Python cares a lot about spacing! Make sure the indented lines under your loop/if/function all line up with the same number of spaces.',
  SyntaxError: (msg) => {
    if (/EOL|EOF/.test(msg)) return 'It looks like something is unfinished — check for a missing quote, bracket, or parenthesis.';
    if (/expected ':'/i.test(msg)) return "Don't forget the colon `:` at the end of lines like `if`, `for`, `while`, and `def`.";
    return "There's a small typo in your code — check for a missing `:`, `)`, or quote mark near where you were typing.";
  },
  TypeError: (msg) => `Python got a type it wasn't expecting. Details: ${msg}`,
  ValueError: (msg) => `That value doesn't work here. Details: ${msg}`,
  IndexError: () => "You tried to access a position in a list that doesn't exist — check your index against the list's length.",
  KeyError: (msg) => `That key isn't in the dictionary: ${msg}. Check the spelling, or make sure you added it first.`,
  ZeroDivisionError: () => "You can't divide by zero! Check your math.",
  AttributeError: (msg) => `That object doesn't have that — details: ${msg}`,
  ActionLimitExceeded: () => 'Your robot took way too many actions — this usually means a loop that never ends. Check your loop condition!',
  Timeout: (msg) => msg,
  InternalError: () => 'Something went wrong running your code. Try again, or reset the level.',
};

export function friendlyError(error) {
  if (!error) return null;
  const fn = FRIENDLY[error.type];
  const friendly = fn ? fn(error.message) : `${error.type}: ${error.message}`;
  return {
    type: error.type,
    line: error.line,
    friendly,
    raw: `${error.type}: ${error.message}`,
  };
}
