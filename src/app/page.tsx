import Link from 'next/link';
import dbOperations from '@/lib/db';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const posts = dbOperations.getAllPosts();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container">
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Welcome to Our Blog</h1>
        <p className={styles.heroSubtitle}>
          Discover articles about web development, programming, and technology
        </p>
      </div>

      <div className={styles.postsGrid}>
        {posts.length === 0 ? (
          <div className={styles.noPosts}>
            <p>No blog posts available yet. Check back soon!</p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className={styles.postCard}>
              <Link href={`/posts/${post.id}`} className={styles.postLink}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postDate}>{formatDate(post.publishDate)}</p>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
                {post.tags && (
                  <div className={styles.postTags}>
                    {post.tags.split(',').map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <span className={styles.readMore}>Read more →</span>
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}