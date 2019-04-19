db.auth('admin', 'pass')

db = db.getSiblingDB('cbaas')

db.createUser({
  user: 'admin',
  pwd: 'pass',
  roles: [
    {
      role: 'root',
      db: 'admin',
    },
  ],
});