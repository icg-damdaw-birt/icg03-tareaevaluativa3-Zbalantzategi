const request = require('supertest');

// Mock de Prisma (antes de importar app)
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  movie: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

jest.mock('../lib/prisma', () => mockPrisma);

// Mock del middleware de auth (usuario autenticado siempre)
jest.mock('../middleware/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { userId: 'user-123' };
    next();
  };
});

const app = require('../server');
const prisma = require('../lib/prisma');

describe('PATCH /api/movies/:id/rating', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería actualizar el rating cuando el rating es válido', async () => {
    const updatedMovie = {
      id: 'movie-1',
      title: 'Inception',
      director: 'Christopher Nolan',
      year: 2010,
      posterUrl: 'https://example.com/inception.jpg',
      ownerId: 'user-123',
      isFavorite: false,
      rating: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.movie.updateMany.mockResolvedValue({ count: 1 });
    prisma.movie.findUnique.mockResolvedValue(updatedMovie);

    const response = await request(app)
      .patch('/api/movies/movie-1/rating')
      .set('Authorization', 'Bearer fake-token')
      .send({ rating: 4 });

    expect(response.status).toBe(200);
    expect(response.body.rating).toBe(4);
    expect(prisma.movie.updateMany).toHaveBeenCalledWith({
      where: { id: 'movie-1', ownerId: 'user-123' },
      data: { rating: 4 },
    });
  });

  it('debería devolver 400 si el rating es mayor que 5', async () => {
    const response = await request(app)
      .patch('/api/movies/movie-1/rating')
      .set('Authorization', 'Bearer fake-token')
      .send({ rating: 6 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('rating debe ser un número entre 0 y 5');
    expect(prisma.movie.updateMany).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si el rating es negativo', async () => {
    const response = await request(app)
      .patch('/api/movies/movie-1/rating')
      .set('Authorization', 'Bearer fake-token')
      .send({ rating: -1 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('rating debe ser un número entre 0 y 5');
    expect(prisma.movie.updateMany).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si no se envía rating en el body', async () => {
    const response = await request(app)
      .patch('/api/movies/movie-1/rating')
      .set('Authorization', 'Bearer fake-token')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('rating debe ser un número entre 0 y 5');
    expect(prisma.movie.updateMany).not.toHaveBeenCalled();
  });

  it('debería devolver 404 si la película no existe para el usuario', async () => {
    prisma.movie.updateMany.mockResolvedValue({ count: 0 });

    const response = await request(app)
      .patch('/api/movies/no-existe/rating')
      .set('Authorization', 'Bearer fake-token')
      .send({ rating: 3 });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Película no encontrada');
  });
});
