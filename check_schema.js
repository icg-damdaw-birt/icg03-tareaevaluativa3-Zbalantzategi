const prisma = require('./lib/prisma');
prisma.$queryRaw`PRAGMA table_info(Movie)`.then(console.log).catch(console.error);