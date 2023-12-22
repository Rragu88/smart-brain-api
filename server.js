import express from 'express';
import bcrypt from 'bcrypt-nodejs';
import cors from 'cors';
import knex from 'knex';

import { handleRegister } from './controllers/register.js';
import { handleSignIn } from './controllers/signin.js';
import { handleProfile } from './controllers/profile.js';
import { handleImage, handleApiCall } from './controllers/image.js';

const db = knex({
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  });

const app = express();

app.use(express.json());
app.use(cors());



app.get('/', (req, res) => { res.send('it is working!') });
app.post('/signin', (req, res) => { handleSignIn(req, res, db, bcrypt) });
app.post('/register', (req, res) => { handleRegister(req, res, db, bcrypt) });
app.get('/profile/:id', (req, res) => { handleProfile(req, res, db) });
app.put('/image', (req, res) => { handleImage(req, res, db) });
app.post('/imageurl', (req, res) => { handleApiCall(req, res)})

app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port ${process.env.PORT}`);
});