import express from 'express';
import Database from 'better-sqlite3';
import { cors } from './MiddleWares';
import * as fs from 'fs';

const PORT = 5000;
const geoData = new class GeoData extends Database {
  constructor() {
    super('./resources/geo_data.db');
  };

  private static SQL = {
    geoSearch: fs.readFileSync('./resources/search.sql', 'utf-8')
  }

  public search(lat: string, lng: string) {
    return this.prepare(GeoData.SQL.geoSearch).get({ lat, lng })
  }

  public prefectures(): string[] {
    return this
      .prepare<undefined[], { prefecture: string }>(`SELECT DISTINCT prefecture FROM 'geo_data';`)
      .all()
      .map(row => row.prefecture);
  }

express()
  .use(cors)
  .get('/api/geo', (req, res) => {
    const { lat, lng } = req.query;

    if (typeof lat !== 'string' || typeof lng !== 'string') {
      res.status(400).send({ error: 'Query Error' });
      return;
    }

    const result = geoData.search(lat, lng);

    if (result) res.send(result);
    else res.send(500).send({ error: 'not found' });
  })
  .get('/api/geo/prefectures', (req, res) => {
    res.send(geoData.prefectures());
  })
  .listen(PORT, () => console.log(`Server running at PORT: ${PORT}`))