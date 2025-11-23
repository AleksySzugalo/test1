import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}

const dbPath = path.join(process.cwd(), 'blog.db');
let db: Database.Database | null = null;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    initDatabase(db);
  }
  return db;
}

function initDatabase(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      tags TEXT,
      publishDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      postId TEXT NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
    )
  `);

  // Check if there are any posts
  const count = database.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
  
  if (count.count === 0) {
    // Add sample posts
    const samplePosts = [
      {
        id: uuidv4(),
        title: 'Getting Started with Next.js',
        content: 'Next.js is a powerful React framework that enables server-side rendering and static site generation. In this post, we\'ll explore the basics of Next.js and how it can help you build modern web applications.\n\nNext.js provides an excellent developer experience with features like:\n- File-based routing\n- API routes\n- Built-in CSS support\n- Fast refresh\n- Image optimization\n\nWhether you\'re building a simple blog or a complex web application, Next.js has the tools you need to succeed.',
        excerpt: 'Learn the basics of Next.js and how it can help you build modern web applications with server-side rendering.',
        tags: 'nextjs,react,web-development',
        publishDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        title: 'Understanding React Hooks',
        content: 'React Hooks revolutionized the way we write React components. They allow you to use state and other React features without writing a class.\n\nThe most commonly used hooks are:\n- useState: For managing component state\n- useEffect: For side effects\n- useContext: For consuming context\n- useCallback: For memoizing callbacks\n- useMemo: For memoizing values\n\nHooks make your code more readable and reusable, enabling better component composition and logic sharing.',
        excerpt: 'Discover how React Hooks have changed the way we write React components and improve code reusability.',
        tags: 'react,hooks,javascript',
        publishDate: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: uuidv4(),
        title: 'CSS Modules: Scoped Styling in React',
        content: 'CSS Modules provide a way to write CSS that is locally scoped to a component, preventing style conflicts and making your styles more maintainable.\n\nBenefits of CSS Modules:\n- No global namespace pollution\n- Automatic unique class names\n- Easy to delete unused styles\n- Works with any preprocessor\n\nWith CSS Modules, you can confidently style your components without worrying about affecting other parts of your application. They integrate seamlessly with Next.js and other modern frameworks.',
        excerpt: 'Learn how CSS Modules help you write maintainable, scoped styles for your React components.',
        tags: 'css,react,styling',
        publishDate: new Date(Date.now() - 172800000).toISOString(),
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    const insertPost = database.prepare(`
      INSERT INTO posts (id, title, content, excerpt, tags, publishDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const post of samplePosts) {
      insertPost.run(
        post.id,
        post.title,
        post.content,
        post.excerpt,
        post.tags,
        post.publishDate,
        post.createdAt,
        post.updatedAt
      );
    }
  }
}

export const dbOperations = {
  // Post operations
  getAllPosts: (): Post[] => {
    const db = getDb();
    return db.prepare('SELECT * FROM posts ORDER BY publishDate DESC').all() as Post[];
  },

  getPostById: (id: string): Post | undefined => {
    const db = getDb();
    return db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post | undefined;
  },

  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post => {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO posts (id, title, content, excerpt, tags, publishDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, post.title, post.content, post.excerpt, post.tags, post.publishDate, now, now);

    return { ...post, id, createdAt: now, updatedAt: now };
  },

  updatePost: (id: string, post: Partial<Post>): boolean => {
    const db = getDb();
    const now = new Date().toISOString();
    
    const fields: string[] = [];
    const values: any[] = [];

    if (post.title !== undefined) {
      fields.push('title = ?');
      values.push(post.title);
    }
    if (post.content !== undefined) {
      fields.push('content = ?');
      values.push(post.content);
    }
    if (post.excerpt !== undefined) {
      fields.push('excerpt = ?');
      values.push(post.excerpt);
    }
    if (post.tags !== undefined) {
      fields.push('tags = ?');
      values.push(post.tags);
    }
    if (post.publishDate !== undefined) {
      fields.push('publishDate = ?');
      values.push(post.publishDate);
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const result = db.prepare(`
      UPDATE posts SET ${fields.join(', ')} WHERE id = ?
    `).run(...values);

    return result.changes > 0;
  },

  deletePost: (id: string): boolean => {
    const db = getDb();
    const result = db.prepare('DELETE FROM posts WHERE id = ?').run(id);
    return result.changes > 0;
  },

  // Comment operations
  getCommentsByPostId: (postId: string): Comment[] => {
    const db = getDb();
    return db.prepare('SELECT * FROM comments WHERE postId = ? ORDER BY createdAt DESC').all(postId) as Comment[];
  },

  createComment: (comment: Omit<Comment, 'id' | 'createdAt'>): Comment => {
    const db = getDb();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO comments (id, postId, author, content, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, comment.postId, comment.author, comment.content, now);

    return { ...comment, id, createdAt: now };
  },

  deleteComment: (id: string): boolean => {
    const db = getDb();
    const result = db.prepare('DELETE FROM comments WHERE id = ?').run(id);
    return result.changes > 0;
  }
};

export default dbOperations;