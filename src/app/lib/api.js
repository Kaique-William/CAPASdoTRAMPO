import Dexie from 'dexie';

export const db = new Dexie("layoutDB");

db.version(1).stores({
    layouts: '++id, nome, codigo, estilo'
})


// API mongoDb
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/registros',
})
