import express from 'express';
import Database from 'better-sqlite3';
import { cors } from './MiddleWares';
import * as fs from 'fs';

const PORT = process.env.PORT;
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

  public municipalities(prefecture: string): string[] {
    return this
      .prepare<{ prefecture: string }[], { municipalities: string }>(`SELECT DISTINCT municipalities FROM 'geo_data' WHERE prefecture = @prefecture;`)
      .all({ prefecture })
      .map(row => row.municipalities);
  }

  public towns(prefecture: string, municipality: string) {
    return this
      .prepare<{ prefecture: string, municipality: string }[], { town: string }>(`SELECT DISTINCT town FROM 'geo_data' WHERE prefecture = @prefecture AND municipalities = @municipality;`)
      .all({ prefecture, municipality })
      .map(row => row.town);
  }
}

const storeData = new class StoreData extends Database {
  constructor() {
    super('./resources/store_data.db');
  };

  public allPin() {
    return this.prepare("SELECT * FROM 'store_data';").all();
  }
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
  .get('/api/geo/municipalities', (req, res) => {
    const { prefecture } = req.query;

    if (typeof prefecture !== 'string') {
      res.status(400).send({ error: 'Query Error' });
      return;
    }

    res.send(geoData.municipalities(prefecture))
  })
  .get('/api/geo/towns', (req, res) => {
    const { prefecture, municipality } = req.query;

    if (typeof prefecture !== 'string' || typeof municipality !== 'string') {
      res.status(400).send({ error: 'Query Error' });
      return;
    }

    res.send(geoData.towns(prefecture, municipality))
  })
  .get('/api/pin', (req, res) => {
    res.send(storeData.allPin())
  })
  .use(express.static(__dirname + '/Public'))
  .all("*", (_, res) => res.type('html').sendFile(__dirname + '/Public/index.html'))
  .listen(PORT, () => console.log(`Server running at PORT: ${PORT}`))