import express from 'express';

const PORT = 5000;

express()
  .listen(PORT, () => console.log(`Server running at PORT: ${PORT}`))