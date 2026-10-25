const bcrypt = require('bcryptjs');
const { getDatabase } = require('./db');
const { initializeSchema } = require('./schema');

async function seed() {
  console.log('Seeding ConnectSphere database...');
  const db = getDatabase();
  initializeSchema(db);

  const defaultPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const now = new Date().toISOString();

  const users = [
    {
      name: 'Alex Morgan',
      username: 'alexmorgan',
      email: 'alex@connectsphere.com',
      password_hash: passwordHash,
      bio: 'Full-stack software developer & open-source enthusiast. Building real-time web applications with React & Node.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      created_at: '2026-01-10T09:00:00.000Z'
    },
    {
      name: 'Sarah Connor',
      username: 'sarah_dev',
      email: 'sarah@connectsphere.com',
      password_hash: passwordHash,
      bio: 'Machine learning researcher and UI/UX explorer. Always curious about the intersection of human and machine.',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      created_at: '2026-01-12T10:30:00.000Z'
    },
    {
      name: 'Marcus Chen',
      username: 'marcus_tech',
      email: 'marcus@connectsphere.com',
      password_hash: passwordHash,
      bio: 'Senior backend architect. Passionate about databases, distributed systems, and clean scalable APIs.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
      created_at: '2026-01-15T14:15:00.000Z'
    },
    {
      name: 'Elena Rostova',
      username: 'elena_codes',
      email: 'elena@connectsphere.com',
      password_hash: passwordHash,
      bio: 'Creative technologist & digital designer. Turning complex challenges into simple, elegant digital experiences.',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
      created_at: '2026-01-18T16:45:00.000Z'
    }
  ];

  const checkUserStmt = db.prepare('SELECT id FROM users WHERE username = ?');
  const insertUserStmt = db.prepare(`
    INSERT INTO users (name, username, email, password_hash, bio, avatar_url, cover_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const userIds = {};

  for (const user of users) {
    const existing = checkUserStmt.get(user.username);
    if (!existing) {
      const res = insertUserStmt.run(
        user.name,
        user.username,
        user.email,
        user.password_hash,
        user.bio,
        user.avatar_url,
        user.cover_url,
        user.created_at
      );
      userIds[user.username] = res.lastInsertRowid;
    } else {
      userIds[user.username] = existing.id;
    }
  }

  // Follows
  const followStmt = db.prepare(`
    INSERT OR IGNORE INTO follows (follower_id, following_id, created_at)
    VALUES (?, ?, ?)
  `);

  // Alex follows Sarah & Marcus
  if (userIds.alexmorgan && userIds.sarah_dev) followStmt.run(userIds.alexmorgan, userIds.sarah_dev, now);
  if (userIds.alexmorgan && userIds.marcus_tech) followStmt.run(userIds.alexmorgan, userIds.marcus_tech, now);
  // Sarah follows Alex & Elena
  if (userIds.sarah_dev && userIds.alexmorgan) followStmt.run(userIds.sarah_dev, userIds.alexmorgan, now);
  if (userIds.sarah_dev && userIds.elena_codes) followStmt.run(userIds.sarah_dev, userIds.elena_codes, now);
  // Marcus follows Alex
  if (userIds.marcus_tech && userIds.alexmorgan) followStmt.run(userIds.marcus_tech, userIds.alexmorgan, now);
  // Elena follows Alex & Sarah
  if (userIds.elena_codes && userIds.alexmorgan) followStmt.run(userIds.elena_codes, userIds.alexmorgan, now);
  if (userIds.elena_codes && userIds.sarah_dev) followStmt.run(userIds.elena_codes, userIds.sarah_dev, now);

  // Posts
  const checkPostsStmt = db.prepare('SELECT COUNT(*) as count FROM posts');
  const postCount = checkPostsStmt.get().count;

  if (postCount === 0) {
    const insertPostStmt = db.prepare(`
      INSERT INTO posts (user_id, content, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const p1 = insertPostStmt.run(
      userIds.alexmorgan,
      'Welcome to ConnectSphere! 🚀 Built with React, Vite, Node.js, Express, and SQLite for the CodeAlpha Full Stack Internship. Seamless real-time social networking designed for performance and clean UI.',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      '2026-01-20T11:00:00.000Z',
      '2026-01-20T11:00:00.000Z'
    ).lastInsertRowid;

    const p2 = insertPostStmt.run(
      userIds.sarah_dev,
      'Exploring generative AI interfaces and micro-interactions today. What design patterns do you think make social feeds truly engaging without being overwhelming? Share your thoughts below! 💡✨',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      '2026-01-21T13:20:00.000Z',
      '2026-01-21T13:20:00.000Z'
    ).lastInsertRowid;

    const p3 = insertPostStmt.run(
      userIds.marcus_tech,
      'Architecture tip of the day: Keeping database queries parameterized and foreign-key enforced ensures data integrity at the lowest level. SQLite with WAL mode gives incredible concurrent read performance for social feeds.',
      null,
      '2026-01-22T08:45:00.000Z',
      '2026-01-22T08:45:00.000Z'
    ).lastInsertRowid;

    const p4 = insertPostStmt.run(
      userIds.elena_codes,
      'Just published a new design system guide! Loving the clean aesthetics and subtle rounded cards in modern web apps. ConnectSphere feel is so refreshing.',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      '2026-01-22T15:10:00.000Z',
      '2026-01-22T15:10:00.000Z'
    ).lastInsertRowid;

    // Comments
    const insertCommentStmt = db.prepare(`
      INSERT INTO comments (post_id, user_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    const c1 = insertCommentStmt.run(
      p1,
      userIds.sarah_dev,
      'Fantastic work Alex! The architecture and responsiveness look super crisp.',
      '2026-01-20T11:15:00.000Z',
      '2026-01-20T11:15:00.000Z'
    ).lastInsertRowid;

    const c2 = insertCommentStmt.run(
      p1,
      userIds.marcus_tech,
      'Great choice with SQLite and Express. Rock solid.',
      '2026-01-20T12:00:00.000Z',
      '2026-01-20T12:00:00.000Z'
    ).lastInsertRowid;

    const c3 = insertCommentStmt.run(
      p2,
      userIds.alexmorgan,
      'Agreed! Clean spacing and subtle shadows help users focus on genuine conversation rather than visual noise.',
      '2026-01-21T14:00:00.000Z',
      '2026-01-21T14:00:00.000Z'
    ).lastInsertRowid;

    // Likes
    const insertLikeStmt = db.prepare(`
      INSERT OR IGNORE INTO likes (post_id, user_id, created_at)
      VALUES (?, ?, ?)
    `);

    insertLikeStmt.run(p1, userIds.sarah_dev, now);
    insertLikeStmt.run(p1, userIds.marcus_tech, now);
    insertLikeStmt.run(p1, userIds.elena_codes, now);
    insertLikeStmt.run(p2, userIds.alexmorgan, now);
    insertLikeStmt.run(p2, userIds.elena_codes, now);
    insertLikeStmt.run(p3, userIds.alexmorgan, now);
    insertLikeStmt.run(p4, userIds.sarah_dev, now);

    // Notifications
    const insertNotificationStmt = db.prepare(`
      INSERT INTO notifications (recipient_id, actor_id, type, post_id, comment_id, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertNotificationStmt.run(userIds.alexmorgan, userIds.sarah_dev, 'like', p1, null, 0, '2026-01-20T11:10:00.000Z');
    insertNotificationStmt.run(userIds.alexmorgan, userIds.sarah_dev, 'comment', p1, c1, 0, '2026-01-20T11:15:00.000Z');
    insertNotificationStmt.run(userIds.alexmorgan, userIds.marcus_tech, 'follow', null, null, 1, '2026-01-20T11:30:00.000Z');
    insertNotificationStmt.run(userIds.sarah_dev, userIds.alexmorgan, 'like', p2, null, 0, '2026-01-21T14:00:00.000Z');
  }

  console.log('Database seeded successfully!');
  console.log('Demo accounts available:');
  console.log('  Email: alex@connectsphere.com | Password: Password123! (Username: alexmorgan)');
  console.log('  Email: sarah@connectsphere.com | Password: Password123! (Username: sarah_dev)');
  console.log('  Email: marcus@connectsphere.com | Password: Password123! (Username: marcus_tech)');
  console.log('  Email: elena@connectsphere.com | Password: Password123! (Username: elena_codes)');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seed };
