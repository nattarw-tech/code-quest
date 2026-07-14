// All level content. Each level is a plain object — see README.md for the
// full schema. checkSolution(result) receives:
//   { stdout, error: {type,message,line}|null, actions, state, vars, timedOut }

function noError(result) {
  return !result.error && !result.timedOut;
}

export const LEVELS = [
  // ---------------------------------------------------------------- BASICS
  {
    id: 'lvl-01-print',
    order: 1,
    unit: 'Basics',
    title: 'Robot Says Hi',
    concept: 'print()',
    visualType: 'console',
    unlockRequires: [],
    teachingContent: {
      explanation: 'print() is how Python shows text on the screen. Whatever you put inside the parentheses (in quotes) gets displayed.',
      example: 'print("Hello, world!")',
    },
    storyText: "Your robot just powered on for the first time! Use print() to make it say hello.",
    apiTypes: [],
    starterCode: '# Use print() to make the robot say hello!\n',
    initialState: {},
    captureVars: [],
    hints: [
      'print() needs quotes around the text: print("like this")',
      'Try: print("Hello, I am a robot!")',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && /hello/i.test(result.stdout);
      return { passed, message: passed ? "It's alive! 🤖" : 'Try printing a message with the word "hello" in it.' };
    },
    xpReward: 20,
    badgeId: null,
    difficulty: 1,
  },
  {
    id: 'lvl-02-fstrings',
    order: 2,
    unit: 'Basics',
    title: 'Name Tag',
    concept: 'strings & f-strings',
    visualType: 'console',
    unlockRequires: ['lvl-01-print'],
    teachingContent: {
      explanation: 'An f-string lets you mix a variable into text. Put an f before the quotes, then wrap the variable in curly braces {}.',
      example: 'name = "Ada"\nprint(f"Hi, I\'m {name}!")',
    },
    storyText: 'Give your robot a name, then have it introduce itself using an f-string.',
    apiTypes: [],
    starterCode: 'robot_name = "Robo"\n\n# TODO: print a greeting that includes robot_name, using an f-string\n',
    initialState: {},
    captureVars: ['robot_name'],
    hints: [
      'f-strings look like: f"some text {variable_name} more text"',
      'Try: print(f"Hi, I\'m {robot_name}!")',
    ],
    checkSolution: (result) => {
      const name = result.vars.robot_name;
      const passed = noError(result) && typeof name === 'string' && name.length > 0 && result.stdout.includes(name);
      return { passed, message: passed ? 'Nice to meet you! 👋' : 'Make sure you print robot_name using an f-string.' };
    },
    xpReward: 25,
    badgeId: null,
    difficulty: 1,
  },
  {
    id: 'lvl-03-variables',
    order: 3,
    unit: 'Basics',
    title: 'Configure the Robot',
    concept: 'variables',
    visualType: 'console',
    unlockRequires: ['lvl-02-fstrings'],
    teachingContent: {
      explanation: 'Variables store information you can reuse. Give one a name, then set it with =.',
      example: 'speed = 5\nprint(speed)',
    },
    storyText: 'Configure your robot: give it a color (a string) and a speed (a number), then print a status line describing both.',
    apiTypes: [],
    starterCode: '# TODO: create a variable "color" (text) and a variable "speed" (a number)\n# then print a status line using both\n',
    initialState: {},
    captureVars: ['color', 'speed'],
    hints: [
      'color = "blue"  — remember quotes for text!',
      'speed = 7  — no quotes needed for numbers',
      'print(f"Color: {color}, Speed: {speed}")',
    ],
    checkSolution: (result) => {
      const { color, speed } = result.vars;
      const passed = noError(result) && typeof color === 'string' && color.length > 0
        && typeof speed === 'number' && result.stdout.trim().length > 0;
      return { passed, message: passed ? 'Robot configured! ⚙️' : 'Make sure color is text, speed is a number, and you printed them.' };
    },
    xpReward: 25,
    badgeId: null,
    difficulty: 1,
  },
  {
    id: 'lvl-04-numbers',
    order: 4,
    unit: 'Basics',
    title: 'Fuel Calculator',
    concept: 'numbers & operators',
    visualType: 'console',
    unlockRequires: ['lvl-03-variables'],
    teachingContent: {
      explanation: 'You can do math with + - * /. Store the result in a variable to use it later.',
      example: 'total = 10 + 5\nprint(total)',
    },
    storyText: 'Two fuel tanks are attached to your robot. Add their levels together to get the total fuel, then print it.',
    apiTypes: [],
    starterCode: 'tank1 = 45\ntank2 = 30\n\n# TODO: add tank1 and tank2, store the result in fuel_level, then print it\nfuel_level = 0\n',
    initialState: {},
    captureVars: ['fuel_level'],
    hints: [
      'fuel_level = tank1 + tank2',
      "Don't forget to print(fuel_level) at the end!",
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.vars.fuel_level === 75 && result.stdout.includes('75');
      return { passed, message: passed ? 'Tanks full! ⛽' : 'fuel_level should be tank1 + tank2 = 75, and printed.' };
    },
    xpReward: 25,
    badgeId: null,
    difficulty: 1,
  },
  {
    id: 'lvl-05-debug',
    order: 5,
    unit: 'Basics',
    title: 'Debug the Note',
    concept: 'reading code & fixing bugs',
    visualType: 'console',
    unlockRequires: ['lvl-04-numbers'],
    teachingContent: {
      explanation: "Programmers spend a lot of time reading code, not just writing it. This code has one small bug — find it and fix it.",
      example: '# A typo in a variable name causes a NameError:\nage = 10\nprint(agee)  # <- misspelled!',
    },
    storyText: "This code is supposed to print the robot's battery percentage as \"Battery: 82%\", but it's broken. Fix the bug!",
    apiTypes: [],
    starterCode: 'battery = 82\nprint(f"Battery: {batery}%")\n',
    initialState: {},
    captureVars: [],
    hints: [
      'Read the error message carefully — it tells you which name Python doesn\'t recognize.',
      '"batery" is misspelled — it should match the variable name exactly.',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.stdout.trim() === 'Battery: 82%';
      return { passed, message: passed ? 'Bug squashed! 🐞' : 'Not quite — the output should be exactly "Battery: 82%".' };
    },
    xpReward: 30,
    badgeId: null,
    difficulty: 1,
  },

  // ----------------------------------------------------------------- LOOPS
  {
    id: 'lvl-06-for-loop',
    order: 6,
    unit: 'Loops',
    title: 'Step Counter',
    concept: 'for loops & range()',
    visualType: 'grid',
    unlockRequires: ['lvl-05-debug'],
    teachingContent: {
      explanation: 'A for loop repeats code a set number of times. range(5) counts 0,1,2,3,4 — five numbers, so the loop body runs 5 times.',
      example: 'for i in range(3):\n    print("step")',
    },
    storyText: 'The recharge station is exactly 5 steps ahead. Use a for loop to move the robot forward 5 times.',
    apiTypes: ['robot'],
    commandsUsed: ['forward'],
    starterCode: '# TODO: use a for loop with range(5) to move the robot forward 5 times\n',
    initialState: { gridSize: [6, 1], robot: { x: 0, y: 0, dir: 'E' }, walls: [], goal: { x: 5, y: 0 } },
    captureVars: [],
    hints: [
      'for i in range(5):\n    robot.forward()',
      'Make sure robot.forward() is indented inside the loop.',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.state.robot.x === 5 && result.state.robot.y === 0;
      return { passed, message: passed ? 'Recharged! ⚡' : 'The robot needs to travel exactly 5 steps forward.' };
    },
    xpReward: 40,
    badgeId: null,
    difficulty: 2,
  },
  {
    id: 'lvl-07-while-loop',
    order: 7,
    unit: 'Loops',
    title: 'Fuel-Limited Move',
    concept: 'while loops',
    visualType: 'grid',
    unlockRequires: ['lvl-06-for-loop'],
    teachingContent: {
      explanation: 'A while loop repeats as long as a condition is True. Be careful — you must change something inside the loop, or it never stops!',
      example: 'count = 3\nwhile count > 0:\n    print(count)\n    count = count - 1',
    },
    storyText: "Your robot's battery only has enough charge for 4 moves. Use a while loop with a counter to move exactly 4 times.",
    apiTypes: ['robot'],
    commandsUsed: ['forward'],
    starterCode: 'fuel = 4\n\n# TODO: while fuel > 0: move forward, then subtract 1 from fuel\n',
    initialState: { gridSize: [5, 1], robot: { x: 0, y: 0, dir: 'E' }, walls: [], goal: { x: 4, y: 0 } },
    captureVars: [],
    hints: [
      'while fuel > 0:\n    robot.forward()\n    fuel = fuel - 1',
      'If your code hangs, you probably forgot to decrease fuel inside the loop.',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.state.robot.x === 4 && result.state.robot.y === 0;
      return { passed, message: passed ? 'Made it on fumes! 🔋' : 'The robot needs to end up exactly 4 steps forward.' };
    },
    xpReward: 45,
    badgeId: null,
    difficulty: 2,
  },
  {
    id: 'lvl-08-nested-loop-square',
    order: 8,
    unit: 'Loops',
    title: 'Draw a Square',
    concept: 'loops for repeated drawing',
    visualType: 'canvas',
    unlockRequires: ['lvl-07-while-loop'],
    teachingContent: {
      explanation: 'A square has 4 equal sides with 90° turns between them. A for loop is perfect for repeating "go forward, then turn" 4 times.',
      example: 'for i in range(4):\n    turtle.forward(50)\n    turtle.left(90)',
    },
    storyText: 'Program the drawing arm to trace a perfect square.',
    apiTypes: ['turtle'],
    commandsUsed: ['forward', 'left'],
    starterCode: '# TODO: use a for loop (4 times) to draw a square:\n# move forward 80, then turn left 90 degrees, each time\n',
    initialState: { x: 0, y: 0, heading: 0, penDown: true },
    captureVars: [],
    hints: [
      'for i in range(4):\n    turtle.forward(80)\n    turtle.left(90)',
      'Each side needs the same forward distance and the same turn angle.',
    ],
    checkSolution: (result) => {
      const s = result.state;
      const lineCount = result.actions.filter((a) => a.type === 'line').length;
      const closed = Math.abs(s.x) < 2 && Math.abs(s.y) < 2 && ((s.heading % 360) + 360) % 360 === 0;
      const passed = noError(result) && lineCount >= 4 && closed;
      return { passed, message: passed ? 'A perfect square! 🟪' : 'Draw 4 equal sides with 90° turns so the shape closes up.' };
    },
    xpReward: 45,
    badgeId: null,
    difficulty: 2,
  },

  // ----------------------------------------------------------- CONDITIONALS
  {
    id: 'lvl-09-if',
    order: 9,
    unit: 'Conditionals',
    title: 'Obstacle Ahead?',
    concept: 'if / else',
    visualType: 'grid',
    unlockRequires: ['lvl-08-nested-loop-square'],
    teachingContent: {
      explanation: 'if lets your code make a decision. robot.is_blocked_ahead() gives back True or False depending on whether there\'s a wall ahead.',
      example: 'if is_raining:\n    print("Take an umbrella")\nelse:\n    print("Enjoy the sun")',
    },
    storyText: "There might be a wall directly ahead of your robot. Use if/else with robot.is_blocked_ahead() to make it say \"Blocked!\" or \"Clear!\".",
    apiTypes: ['robot'],
    commandsUsed: ['is_blocked_ahead', 'say'],
    starterCode: '# TODO: if robot.is_blocked_ahead(): robot.say("Blocked!")\n# else: robot.say("Clear!")\n',
    initialState: { gridSize: [3, 1], robot: { x: 0, y: 0, dir: 'E' }, walls: [[1, 0]], goal: { x: 2, y: 0 } },
    captureVars: [],
    hints: [
      'if robot.is_blocked_ahead():\n    robot.say("Blocked!")\nelse:\n    robot.say("Clear!")',
    ],
    checkSolution: (result) => {
      const said = result.actions.find((a) => a.type === 'say');
      const passed = noError(result) && said && said.text.toLowerCase().includes('blocked');
      return { passed, message: passed ? 'Correctly spotted the wall! 🧱' : 'There IS a wall ahead — the robot should say "Blocked!".' };
    },
    xpReward: 40,
    badgeId: null,
    difficulty: 2,
  },
  {
    id: 'lvl-10-if-elif-else',
    order: 10,
    unit: 'Conditionals',
    title: 'Sorting Gates',
    concept: 'if / elif / else',
    visualType: 'console',
    unlockRequires: ['lvl-09-if'],
    teachingContent: {
      explanation: 'elif lets you check multiple conditions in order. Python checks each one from top to bottom until one matches.',
      example: 'if score < 5:\n    print("low")\nelif score < 10:\n    print("medium")\nelse:\n    print("high")',
    },
    storyText: 'A sensor reading of 57 needs sorting: print "small" if under 30, "medium" if under 70, otherwise "large".',
    apiTypes: [],
    starterCode: 'reading = 57\n\n# TODO: if reading < 30: print("small")\n# elif reading < 70: print("medium")\n# else: print("large")\n',
    initialState: {},
    captureVars: [],
    hints: [
      'Check the smallest range first: if reading < 30.',
      '57 is not under 30, but it IS under 70 — so it should print "medium".',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.stdout.trim().toLowerCase() === 'medium';
      return { passed, message: passed ? 'Sorted correctly! 🗂️' : 'A reading of 57 should print exactly "medium".' };
    },
    xpReward: 45,
    badgeId: null,
    difficulty: 2,
  },
  {
    id: 'lvl-10b-turn-and-go',
    order: 10.5,
    unit: 'Conditionals',
    title: 'Turn and Go',
    concept: 'combining turn + multiple forward() calls',
    visualType: 'grid',
    unlockRequires: ['lvl-10-if-elif-else'],
    teachingContent: {
      explanation: "robot.forward() always moves exactly ONE step — it never takes a number like robot.forward(2). To move further, call it again: robot.forward() twice in a row moves 2 steps. robot.turn_left()/turn_right() only change direction and don't move the robot at all, so you still need forward() calls after turning.",
      example: 'robot.forward()\nrobot.forward()\nrobot.turn_right()\nrobot.forward()\nrobot.forward()',
    },
    storyText: 'The recharge station is around a corner. Move forward twice, turn right, then move forward twice more to reach it.',
    apiTypes: ['robot'],
    commandsUsed: ['forward', 'turn_right'],
    starterCode: '# TODO: move forward twice, turn right, then move forward twice more\n',
    initialState: { gridSize: [3, 3], robot: { x: 0, y: 0, dir: 'E' }, walls: [], goal: { x: 2, y: 2 } },
    captureVars: [],
    hints: [
      'robot.forward() only moves ONE step per call — write it twice in a row to move two steps.',
      'robot.forward()\nrobot.forward()\nrobot.turn_right()\nrobot.forward()\nrobot.forward()',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.state.robot.x === 2 && result.state.robot.y === 2;
      return { passed, message: passed ? 'Nice cornering! 🔄' : 'The robot needs to reach the flag around the corner.' };
    },
    xpReward: 35,
    badgeId: null,
    difficulty: 2,
  },
  {
    id: 'lvl-11-maze-1',
    order: 11,
    unit: 'Conditionals',
    title: 'Maze Escape I',
    concept: 'combining loops, conditionals & movement',
    visualType: 'grid',
    unlockRequires: ['lvl-10b-turn-and-go'],
    teachingContent: {
      explanation: "Now combine everything: forward(), turn_left()/turn_right(), and maybe loops or if-checks with is_blocked_ahead(), to navigate a real maze.",
      example: 'if robot.is_blocked_ahead():\n    robot.turn_right()\nelse:\n    robot.forward()',
    },
    storyText: 'A wall blocks the direct path to the exit. Navigate around it to reach the flag!',
    apiTypes: ['robot'],
    commandsUsed: ['forward', 'turn_left', 'turn_right', 'is_blocked_ahead'],
    starterCode: '# TODO: get the robot to the flag. There\'s a wall in the way —\n# you\'ll need to turn around it.\n',
    initialState: { gridSize: [3, 3], robot: { x: 0, y: 0, dir: 'E' }, walls: [[1, 0], [1, 1]], goal: { x: 2, y: 2 } },
    captureVars: [],
    hints: [
      'Try: robot.turn_right(), then forward twice to go down, then turn_left(), then forward twice to reach the flag.',
      'is_blocked_ahead() can help you check before moving, if you want to be extra safe.',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.state.robot.x === 2 && result.state.robot.y === 2;
      return { passed, message: passed ? 'Maze escaped! 🚩' : 'The robot needs to reach the flag at the bottom-right corner.' };
    },
    xpReward: 55,
    badgeId: null,
    difficulty: 3,
  },

  // ----------------------------------------------------------------- LISTS
  {
    id: 'lvl-12-lists-index',
    order: 12,
    unit: 'Lists',
    title: 'Inventory',
    concept: 'lists & indexing',
    visualType: 'console',
    unlockRequires: ['lvl-11-maze-1'],
    teachingContent: {
      explanation: 'A list holds multiple values in order. Access an item with square brackets — index 0 is the first item.',
      example: 'colors = ["red", "green", "blue"]\nprint(colors[0])  # red',
    },
    storyText: "Your robot's inventory holds 3 items. Grab the first one and print it.",
    apiTypes: [],
    starterCode: 'inventory = ["battery", "wrench", "map"]\n\n# TODO: store the first item of inventory in first_item, then print it\nfirst_item = ""\n',
    initialState: {},
    captureVars: ['first_item'],
    hints: [
      'The first item is at index 0: inventory[0]',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.vars.first_item === 'battery' && result.stdout.includes('battery');
      return { passed, message: passed ? 'Found it! 🔧' : 'first_item should be inventory[0], which is "battery".' };
    },
    xpReward: 40,
    badgeId: null,
    difficulty: 2,
  },
  {
    id: 'lvl-13-for-in-list',
    order: 13,
    unit: 'Lists',
    title: 'Waypoint Tour',
    concept: 'for x in list',
    visualType: 'grid',
    unlockRequires: ['lvl-12-lists-index'],
    teachingContent: {
      explanation: 'You can loop directly over a list\'s items with for item in my_list — no range() or index needed.',
      example: 'waypoints = [1, 2, 3, 4]\nfor w in waypoints:\n    print(w)',
    },
    storyText: 'This list marks 4 waypoints ahead. Loop over it to move the robot forward once per waypoint.',
    apiTypes: ['robot'],
    commandsUsed: ['forward'],
    starterCode: 'waypoints = [1, 2, 3, 4]\n\n# TODO: for each item in waypoints, move the robot forward once\n',
    initialState: { gridSize: [5, 1], robot: { x: 0, y: 0, dir: 'E' }, walls: [], goal: { x: 4, y: 0 } },
    captureVars: [],
    hints: [
      'for step in waypoints:\n    robot.forward()',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.state.robot.x === 4 && result.state.robot.y === 0;
      return { passed, message: passed ? 'Tour complete! 🗺️' : 'The robot should end up 4 steps forward — one per waypoint.' };
    },
    xpReward: 45,
    badgeId: null,
    difficulty: 2,
  },
  {
    id: 'lvl-14-coin-collector',
    order: 14,
    unit: 'Lists',
    title: 'Coin Collector',
    concept: 'growing a list (append-like behavior)',
    visualType: 'grid',
    unlockRequires: ['lvl-13-for-in-list'],
    teachingContent: {
      explanation: "Your robot automatically picks up any coin it moves onto — each one gets added to its collected list, just like calling .append() on a list.",
      example: 'collected = []\ncollected.append("coin")\nprint(len(collected))  # 1',
    },
    storyText: 'Two coins are scattered along this corridor. Drive over both to collect them!',
    apiTypes: ['robot'],
    commandsUsed: ['forward'],
    starterCode: '# TODO: move the robot forward enough times to pass over both coins\n',
    initialState: { gridSize: [5, 1], robot: { x: 0, y: 0, dir: 'E' }, walls: [], coins: [[1, 0], [3, 0]] },
    captureVars: [],
    hints: [
      'The coins are 2 and 4 steps ahead — moving forward 4 times will pass over both.',
    ],
    checkSolution: (result) => {
      const collected = (result.state.collected || []).length;
      const passed = noError(result) && collected === 2;
      return { passed, message: passed ? 'Cha-ching! 🪙🪙' : `Collected ${collected}/2 coins — keep driving forward.` };
    },
    xpReward: 45,
    badgeId: null,
    difficulty: 2,
  },

  // ------------------------------------------------------------- FUNCTIONS
  {
    id: 'lvl-15-functions-def',
    order: 15,
    unit: 'Functions',
    title: "Teach the Robot a Trick",
    concept: 'def — defining functions',
    visualType: 'grid',
    unlockRequires: ['lvl-14-coin-collector'],
    teachingContent: {
      explanation: 'def lets you name a reusable block of code. Define it once, then call it by name whenever you need it — instead of repeating the same lines.',
      example: 'def wave():\n    print("👋")\n\nwave()\nwave()',
    },
    storyText: 'Define a function that moves forward twice and turns right, then call it 4 times to trace a full loop back to the start.',
    apiTypes: ['robot'],
    commandsUsed: ['forward', 'turn_right'],
    starterCode: '# TODO: def a function that moves forward twice, then turns right\n# then call your function 4 times\n\ndef move_and_turn():\n    pass\n',
    initialState: { gridSize: [5, 5], robot: { x: 0, y: 0, dir: 'E' }, walls: [], goal: { x: 0, y: 0 } },
    captureVars: [],
    hints: [
      'def move_and_turn():\n    robot.forward()\n    robot.forward()\n    robot.turn_right()',
      'Call it 4 times: move_and_turn() written 4 times, or use a for loop.',
    ],
    checkSolution: (result) => {
      const moveCount = result.actions.filter((a) => a.type === 'move').length;
      const back = result.state.robot.x === 0 && result.state.robot.y === 0 && result.state.robot.dir === 'E';
      const passed = noError(result) && back && moveCount >= 8;
      return { passed, message: passed ? 'Trick learned! 🎉' : 'Move forward twice and turn right, 4 times, to trace a full loop back to start.' };
    },
    xpReward: 55,
    badgeId: null,
    difficulty: 3,
  },
  {
    id: 'lvl-16-functions-params',
    order: 16,
    unit: 'Functions',
    title: 'Custom Commands',
    concept: 'parameters & return values',
    visualType: 'console',
    unlockRequires: ['lvl-15-functions-def'],
    teachingContent: {
      explanation: 'Functions can take parameters (inputs) and give back an answer with return.',
      example: 'def double(n):\n    return n * 2\n\nresult = double(5)\nprint(result)  # 10',
    },
    storyText: 'Write a function battery_after(current, used) that returns how much battery is left, then use it to figure out what remains after using 37 out of 100.',
    apiTypes: [],
    starterCode: '# TODO: def battery_after(current, used): return current - used\n\n# TODO: call battery_after(100, 37), store it in "remaining", then print it\nremaining = 0\n',
    initialState: {},
    captureVars: ['remaining'],
    hints: [
      'def battery_after(current, used):\n    return current - used',
      'remaining = battery_after(100, 37)',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.vars.remaining === 63 && result.stdout.includes('63');
      return { passed, message: passed ? 'Function works perfectly! 🔋' : 'remaining should be 100 - 37 = 63, printed to the console.' };
    },
    xpReward: 55,
    badgeId: null,
    difficulty: 3,
  },
  {
    id: 'lvl-17-multiroom-maze',
    order: 17,
    unit: 'Functions',
    title: 'Multi-Room Maze',
    concept: 'reusing code (DRY)',
    visualType: 'grid',
    unlockRequires: ['lvl-16-functions-params'],
    teachingContent: {
      explanation: "This maze has a winding path. Try writing a function for a move you'll repeat, so you don't have to write the same lines over and over.",
      example: 'def zigzag():\n    robot.forward()\n    robot.turn_left()',
    },
    storyText: 'A twisting corridor separates your robot from the exit. Find the way through!',
    apiTypes: ['robot'],
    commandsUsed: ['forward', 'turn_left', 'turn_right'],
    starterCode: '# TODO: navigate the robot through the maze to the flag\n',
    initialState: {
      gridSize: [5, 5],
      robot: { x: 0, y: 0, dir: 'E' },
      walls: [[1, 0], [1, 1], [3, 2], [3, 3], [3, 4]],
      goal: { x: 4, y: 4 },
    },
    captureVars: [],
    hints: [
      'From the start, go down first (the way right is blocked), then look for gaps in the walls to zig-zag across.',
      'Solution shape: down, right, up, right, down — like an S.',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.state.robot.x === 4 && result.state.robot.y === 4;
      return { passed, message: passed ? 'Through the maze! 🌀' : 'The robot needs to reach the flag in the far corner.' };
    },
    xpReward: 60,
    badgeId: null,
    difficulty: 3,
  },

  // ------------------------------------------------------------ DICTIONARIES
  {
    id: 'lvl-18-dict-basics',
    order: 18,
    unit: 'Dictionaries',
    title: "Robot's Backpack",
    concept: 'dictionaries',
    visualType: 'console',
    unlockRequires: ['lvl-17-multiroom-maze'],
    teachingContent: {
      explanation: 'A dictionary stores key/value pairs — like a labeled backpack. Look things up by name instead of by position.',
      example: 'pet = {"type": "cat", "age": 3}\nprint(pet["type"])  # cat',
    },
    storyText: 'Pack your robot\'s backpack: a dictionary with a "tool" (text) and a "count" (number).',
    apiTypes: [],
    starterCode: '# TODO: create a dictionary called backpack with keys "tool" and "count"\n# e.g. {"tool": "wrench", "count": 3}\nbackpack = {}\n',
    initialState: {},
    captureVars: ['backpack'],
    hints: [
      'backpack = {"tool": "wrench", "count": 3}',
    ],
    checkSolution: (result) => {
      const b = result.vars.backpack;
      const passed = noError(result) && b && typeof b === 'object' && typeof b.tool === 'string' && typeof b.count === 'number';
      return { passed, message: passed ? 'Backpack packed! 🎒' : 'backpack needs a text "tool" key and a number "count" key.' };
    },
    xpReward: 50,
    badgeId: null,
    difficulty: 2,
  },
  {
    id: 'lvl-19-dict-lookup',
    order: 19,
    unit: 'Dictionaries',
    title: 'Item Shop',
    concept: 'dictionary lookups & updates',
    visualType: 'console',
    unlockRequires: ['lvl-18-dict-basics'],
    teachingContent: {
      explanation: 'Look up a value with dict[key]. Add or update an entry the same way you\'d set a variable: dict[key] = value.',
      example: 'prices = {"apple": 2}\nprint(prices["apple"])\nprices["banana"] = 1',
    },
    storyText: 'Print the price of a "map" from the shop, then add a new item: a "torch" for 6 coins.',
    apiTypes: [],
    starterCode: 'prices = {"battery": 12, "wrench": 8, "map": 5}\n\n# TODO: print the price of "map"\n# TODO: add a new item "torch" priced at 6\n',
    initialState: {},
    captureVars: ['prices'],
    hints: [
      'print(prices["map"])',
      'prices["torch"] = 6',
    ],
    checkSolution: (result) => {
      const p = result.vars.prices;
      const passed = noError(result) && p && p.torch === 6 && result.stdout.includes('5');
      return { passed, message: passed ? 'Shop updated! 🛒' : 'Print prices["map"] (5), and add prices["torch"] = 6.' };
    },
    xpReward: 55,
    badgeId: null,
    difficulty: 3,
  },

  // ------------------------------------------------------------------ OOP
  {
    id: 'lvl-20-oop-basics',
    order: 20,
    unit: 'Classes',
    title: 'Build-a-Bot',
    concept: 'classes (intro)',
    visualType: 'console',
    unlockRequires: ['lvl-19-dict-lookup'],
    teachingContent: {
      explanation: "A class is like a cookie cutter, and each object you make from it is a cookie — same shape, but each can hold its own details. def __init__(self, name) runs automatically when you create a new object, and stores the name you gave it onto self. Later, self.name lets any method on that specific object read that stored name back.",
      example: 'class Dog:\n    def __init__(self, name):\n        self.name = name  # store the name on this dog\n\n    def bark(self):\n        return f"{self.name} says woof!"\n\nrex = Dog("Rex")\nprint(rex.bark())  # Rex says woof!',
    },
    storyText: "Finish the Bot class so it can greet you by name, then build one called \"Rusty\" and print its greeting.",
    apiTypes: [],
    starterCode: 'class Bot:\n    def __init__(self, name):\n        self.name = name\n\n    def greet(self):\n        # TODO: return a greeting string that includes self.name\n        pass\n\nmy_bot = Bot("Rusty")\nprint(my_bot.greet())\n',
    initialState: {},
    captureVars: [],
    hints: [
      'return f"Beep boop, I\'m {self.name}!"',
    ],
    checkSolution: (result) => {
      const passed = noError(result) && result.stdout.includes('Rusty');
      return { passed, message: passed ? 'Your first robot class! 🎓' : 'greet() should return a string that includes self.name ("Rusty").' };
    },
    xpReward: 65,
    badgeId: null,
    difficulty: 3,
  },

  // ------------------------------------------------------------------ BOSS
  {
    id: 'lvl-boss-great-escape',
    order: 21,
    unit: 'Boss',
    title: 'The Great Escape',
    concept: 'everything, combined',
    visualType: 'grid',
    unlockRequires: ['lvl-20-oop-basics'],
    teachingContent: {
      explanation: "This is it — the final challenge. Use whatever combination of loops, conditionals, and functions you like to collect all 3 coins and reach the exit.",
      example: 'def leg(steps):\n    for i in range(steps):\n        robot.forward()',
    },
    storyText: 'The final room! Grab all 3 power cells scattered around, then reach the exit to complete Code Quest.',
    apiTypes: ['robot'],
    commandsUsed: ['forward', 'turn_left', 'turn_right', 'is_blocked_ahead', 'collect'],
    starterCode: "# TODO: collect all 3 coins and reach the flag at the bottom-right\n# Tip: you can define a helper function to move several steps at once\n",
    initialState: {
      gridSize: [6, 6],
      robot: { x: 0, y: 0, dir: 'E' },
      walls: [],
      goal: { x: 5, y: 5 },
      coins: [[2, 0], [5, 3], [5, 5]],
    },
    captureVars: [],
    hints: [
      'Go right 5 times along the top row (passing over the coin at x=2), then turn right and go down 5 times (passing the other two coins).',
      'A function like def leg(n): for i in range(n): robot.forward() can save you typing.',
    ],
    checkSolution: (result) => {
      const collected = (result.state.collected || []).length;
      const atGoal = result.state.robot.x === 5 && result.state.robot.y === 5;
      const passed = noError(result) && collected === 3 && atGoal;
      return {
        passed,
        message: passed
          ? "You did it! Code Quest complete! 🏆"
          : `${collected}/3 power cells collected${atGoal ? '' : ', and not at the exit yet'}.`,
      };
    },
    xpReward: 150,
    badgeId: null,
    difficulty: 4,
  },
];

export function getLevelById(id) {
  return LEVELS.find((l) => l.id === id);
}
