import client from './client';

export const getCards = () => client.get('/cards');
