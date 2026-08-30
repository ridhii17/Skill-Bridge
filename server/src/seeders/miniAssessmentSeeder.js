import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MiniAssessment from '../models/MiniAssessment.js';
import Skill from '../models/Skill.js';

dotenv.config();

const MINI_ASSESSMENTS = [
  {
    skillName: 'JavaScript',
    title: 'JavaScript — Check Your Understanding',
    description: 'Verify your JavaScript fundamentals',
    questions: [
      {
        questionText: 'What is the output of typeof null in JavaScript?',
        options: ['"null"', '"object"', '"undefined"', '"boolean"'],
        correctAnswer: 1,
        explanation: 'typeof null returns "object" — a known quirk in JavaScript.',
        difficulty: 'beginner',
      },
      {
        questionText: 'Which method adds an element to the end of an array?',
        options: ['unshift()', 'push()', 'pop()', 'shift()'],
        correctAnswer: 1,
        explanation: 'push() adds elements to the end of an array.',
        difficulty: 'beginner',
      },
      {
        questionText: 'What does the === operator check?',
        options: ['Value only', 'Type only', 'Value and type', 'Reference only'],
        correctAnswer: 2,
        explanation: '=== checks both value and type (strict equality).',
        difficulty: 'beginner',
      },
      {
        questionText: 'Which keyword creates a block-scoped variable?',
        options: ['var', 'let', 'function', 'global'],
        correctAnswer: 1,
        explanation: 'let and const are block-scoped; var is function-scoped.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'What is a closure in JavaScript?',
        options: [
          'A way to close browser windows',
          'A function that remembers its outer scope',
          'A loop termination condition',
          'A type of error handler',
        ],
        correctAnswer: 1,
        explanation: 'A closure is a function that retains access to its outer lexical scope.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'Which of these is NOT a valid way to create a promise?',
        options: [
          'new Promise((resolve, reject) => {})',
          'Promise.resolve(42)',
          'Promise.create(() => {})',
          'Promise.all([p1, p2])',
        ],
        correctAnswer: 2,
        explanation: 'Promise.create() does not exist. Promises are created with new Promise(), .resolve(), .reject(), .all(), .race().',
        difficulty: 'advanced',
      },
      {
        questionText: 'What is event delegation?',
        options: [
          'Removing all event listeners',
          'Attaching a single listener to a parent to handle events from children',
          'Delegating events to web workers',
          'Creating custom event types',
        ],
        correctAnswer: 1,
        explanation: 'Event delegation uses a single listener on a parent to handle events bubbling up from child elements.',
        difficulty: 'advanced',
      },
    ],
  },
  {
    skillName: 'Node.js',
    title: 'Node.js — Check Your Understanding',
    description: 'Verify your Node.js knowledge',
    questions: [
      {
        questionText: 'What runtime does Node.js use?',
        options: ['V8', 'SpiderMonkey', 'Chakra', 'JavaScriptCore'],
        correctAnswer: 0,
        explanation: 'Node.js uses Google V8 JavaScript engine.',
        difficulty: 'beginner',
      },
      {
        questionText: 'Which module is used to create an HTTP server in Node.js?',
        options: ['fs', 'http', 'path', 'url'],
        correctAnswer: 1,
        explanation: 'The http module provides HTTP server and client functionality.',
        difficulty: 'beginner',
      },
      {
        questionText: 'What does middleware do in Express.js?',
        options: [
          'Serves static files only',
          'Processes requests between receipt and response',
          'Compiles JavaScript',
          'Manages database connections',
        ],
        correctAnswer: 1,
        explanation: 'Middleware functions have access to request, response, and next function.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'Which is the correct way to read a file asynchronously in Node.js?',
        options: [
          'fs.readFileSync()',
          'fs.readFile()',
          'fs.openSync()',
          'process.file()',
        ],
        correctAnswer: 1,
        explanation: 'fs.readFile() reads file content asynchronously with a callback.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'What is the event loop in Node.js?',
        options: [
          'A for loop that processes events',
          'A mechanism that handles asynchronous callbacks',
          'A CSS animation handler',
          'A database polling mechanism',
        ],
        correctAnswer: 1,
        explanation: 'The event loop is the core mechanism that handles async operations via callbacks, promises, and microtasks.',
        difficulty: 'advanced',
      },
    ],
  },
  {
    skillName: 'React',
    title: 'React — Check Your Understanding',
    description: 'Verify your React knowledge',
    questions: [
      {
        questionText: 'What does JSX stand for?',
        options: [
          'JavaScript XML',
          'Java Syntax Extension',
          'JSON XML Syntax',
          'JavaScript Extension',
        ],
        correctAnswer: 0,
        explanation: 'JSX stands for JavaScript XML — a syntax extension for writing HTML-like code in JavaScript.',
        difficulty: 'beginner',
      },
      {
        questionText: 'Which hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
        explanation: 'useEffect handles side effects like data fetching, subscriptions, and DOM manipulation.',
        difficulty: 'beginner',
      },
      {
        questionText: 'What is the virtual DOM?',
        options: [
          'A lightweight copy of the real DOM',
          'The actual browser DOM',
          'A server-side rendering engine',
          'A CSS styling system',
        ],
        correctAnswer: 0,
        explanation: 'Virtual DOM is an in-memory representation of the real DOM for efficient diffing and updates.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'When does React re-render a component?',
        options: [
          'Only when state changes',
          'When state or props change',
          'Every second',
          'Only on page reload',
        ],
        correctAnswer: 1,
        explanation: 'React re-renders when state changes or when parent passes new props.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'What problem does useMemo solve?',
        options: [
          'Form validation',
          'Avoiding unnecessary re-renders by memoizing computed values',
          'HTTP request caching',
          'CSS-in-JS performance',
        ],
        correctAnswer: 1,
        explanation: 'useMemo memoizes expensive computations to avoid recalculating on every render.',
        difficulty: 'advanced',
      },
    ],
  },
  {
    skillName: 'MongoDB',
    title: 'MongoDB — Check Your Understanding',
    description: 'Verify your MongoDB knowledge',
    questions: [
      {
        questionText: 'What type of database is MongoDB?',
        options: ['Relational', 'Document-oriented NoSQL', 'Key-Value', 'Graph'],
        correctAnswer: 1,
        explanation: 'MongoDB is a document-oriented NoSQL database that stores data in BSON format.',
        difficulty: 'beginner',
      },
      {
        questionText: 'Which method finds a single document by ID?',
        options: ['find()', 'findById()', 'findOne()', 'get()'],
        correctAnswer: 1,
        explanation: 'findById() is a Mongoose method that finds a document by its _id.',
        difficulty: 'beginner',
      },
      {
        questionText: 'What is an index in MongoDB?',
        options: [
          'A table of contents',
          'A data structure that improves query performance',
          'A backup mechanism',
          'A data type',
        ],
        correctAnswer: 1,
        explanation: 'Indexes improve query performance by creating efficient lookup structures.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'What does populate() do in Mongoose?',
        options: [
          'Creates fake data',
          'Replaces referenced document IDs with actual documents',
          'Deletes documents',
          'Creates new collections',
        ],
        correctAnswer: 1,
        explanation: 'populate() replaces ObjectId references with the actual referenced documents.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'Which aggregation stage groups documents?',
        options: ['$match', '$group', '$sort', '$project'],
        correctAnswer: 1,
        explanation: '$group groups documents by a specified key and can perform accumulator operations.',
        difficulty: 'advanced',
      },
    ],
  },
  {
    skillName: 'Data Structures',
    title: 'Data Structures — Check Your Understanding',
    description: 'Verify your DSA fundamentals',
    questions: [
      {
        questionText: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'Binary search halves the search space each step, giving O(log n) time.',
        difficulty: 'beginner',
      },
      {
        questionText: 'Which data structure uses FIFO ordering?',
        options: ['Stack', 'Queue', 'Binary Tree', 'Hash Map'],
        correctAnswer: 1,
        explanation: 'Queue follows First-In-First-Out ordering.',
        difficulty: 'beginner',
      },
      {
        questionText: 'What is the average time complexity for hash map lookups?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
        correctAnswer: 2,
        explanation: 'Hash maps provide O(1) average case for insertions and lookups.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'Which sorting algorithm has worst-case O(n log n)?',
        options: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Selection Sort'],
        correctAnswer: 2,
        explanation: 'Merge sort guarantees O(n log n) in all cases. Quick sort is O(n²) worst case.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'What is a BST property?',
        options: [
          'All nodes are at the same level',
          'Left child < parent < right child',
          'Nodes have at most 2 children',
          'The tree is balanced',
        ],
        correctAnswer: 1,
        explanation: 'In a BST, left subtree values < node value < right subtree values.',
        difficulty: 'advanced',
      },
    ],
  },
  {
    skillName: 'System Design',
    title: 'System Design — Check Your Understanding',
    description: 'Verify your system design fundamentals',
    questions: [
      {
        questionText: 'What is horizontal scaling?',
        options: [
          'Adding more power to existing machines',
          'Adding more machines to distribute load',
          'Increasing disk space',
          'Upgrading the CPU',
        ],
        correctAnswer: 1,
        explanation: 'Horizontal scaling (scaling out) adds more machines rather than upgrading existing ones.',
        difficulty: 'beginner',
      },
      {
        questionText: 'What does a load balancer do?',
        options: [
          'Stores data',
          'Distributes incoming traffic across multiple servers',
          'Compiles code',
          'Manages user authentication',
        ],
        correctAnswer: 1,
        explanation: 'A load balancer distributes incoming network requests across multiple backend servers.',
        difficulty: 'beginner',
      },
      {
        questionText: 'What is database sharding?',
        options: [
          'Deleting old data',
          'Splitting a database across multiple servers by a shard key',
          'Creating database backups',
          'Encrypting data',
        ],
        correctAnswer: 1,
        explanation: 'Sharding partitions data across multiple database instances using a shard key.',
        difficulty: 'intermediate',
      },
      {
        questionText: 'What is eventual consistency?',
        options: [
          'Data is always immediately consistent',
          'Data will become consistent after some time without new updates',
          'Data is never consistent',
          'Data consistency is guaranteed by locks',
        ],
        correctAnswer: 1,
        explanation: 'Eventual consistency guarantees that all replicas will converge to the same value eventually.',
        difficulty: 'advanced',
      },
      {
        questionText: 'What is the purpose of a CDN?',
        options: [
          'Database management',
          'Serving static content from edge locations closer to users',
          'Running server-side code',
          'Managing DNS records',
        ],
        correctAnswer: 1,
        explanation: 'A CDN caches and serves static content from geographically distributed edge servers.',
        difficulty: 'intermediate',
      },
    ],
  },
];

async function seedMiniAssessments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge');
    console.log('Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const ma of MINI_ASSESSMENTS) {
      const skill = await Skill.findOne({ name: ma.skillName });
      if (!skill) {
        console.log(`Skill "${ma.skillName}" not found — skipping`);
        skipped++;
        continue;
      }

      const existing = await MiniAssessment.findOne({ skill: skill._id });
      if (existing) {
        console.log(`Mini assessment for "${ma.skillName}" exists — skipping`);
        skipped++;
        continue;
      }

      await MiniAssessment.create({
        skill: skill._id,
        skillName: ma.skillName,
        title: ma.title,
        description: ma.description,
        questions: ma.questions,
        difficulty: 'intermediate',
        isActive: true,
      });

      console.log(`Created mini assessment: ${ma.title} (${ma.questions.length} questions)`);
      created++;
    }

    console.log(`\nDone: ${created} created, ${skipped} skipped`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Mini assessment seed error:', err);
    process.exit(1);
  }
}

seedMiniAssessments();
