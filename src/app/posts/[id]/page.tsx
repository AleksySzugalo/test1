import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbOperations from '@/lib/db';
import CommentsSection from '@/components/CommentsSection';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: {
    id: string;
  };
}

export default function PostPage({ params }: PostPageProps) {
  const post = dbOperations.getPostById(params.id);

  if (!post) {
    notFound();
  }

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
      <article className={styles.article}>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>

        <header className={styles.articleHeader}>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <div className={styles.articleMeta}>
            <time className={styles.articleDate}>{formatDate(post.publishDate)}</time>
            {post.tags && (
              <div className={styles.articleTags}>
                {post.tags.split(',').map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className={styles.articleContent}>
          {post.content.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <CommentsSection postId={params.id} />
    </div>
  );
}