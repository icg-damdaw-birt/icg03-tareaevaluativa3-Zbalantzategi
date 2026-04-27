const prisma = require('./lib/prisma');
prisma.movie.updateMany({
  where: { id: 'cmoh0raxy0002xwmqz3qnfipn', ownerId: 'cmoh0oicl0000xwmqr8lry2qf' },
  data: { isFavorite: true }
}).then(r => console.log('Result:', r)).catch(e => console.error('Error:', e.message));