import express from 'express';
import { cors } from './MiddleWares';

const PORT = 5000;

express()
  .use(cors)
  .listen(PORT, () => console.log(`Server running at PORT: ${PORT}`))