function generateId() {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}

const DB_KEY = 'arisan_db';

function loadData() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : { arisans: [], members: [], payments: [], winners: [] };
  } catch {
    return { arisans: [], members: [], payments: [], winners: [] };
  }
}

function saveData(data) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save:', e);
  }
}

let nativeDb = null;
let isNative = false;

export async function initDatabase() {
  try {
    const { Platform } = require('react-native');
    if (Platform.OS === 'web') {
      isNative = false;
      return;
    }
  } catch {
    isNative = false;
    return;
  }

  try {
    const SQLite = require('expo-sqlite');
    nativeDb = await SQLite.openDatabaseAsync('arisan.db');
    isNative = true;

    await nativeDb.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS arisans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        amount INTEGER NOT NULL,
        maxMembers INTEGER DEFAULT 10,
        status TEXT DEFAULT 'active',
        createdAt TEXT DEFAULT (datetime('now','localtime'))
      );
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        arisanId TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT DEFAULT '',
        isActive INTEGER DEFAULT 1,
        joinDate TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (arisanId) REFERENCES arisans(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        arisanId TEXT NOT NULL,
        memberId TEXT NOT NULL,
        period INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT DEFAULT 'contribution',
        status TEXT DEFAULT 'paid',
        paidAt TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (arisanId) REFERENCES arisans(id) ON DELETE CASCADE,
        FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS winners (
        id TEXT PRIMARY KEY,
        arisanId TEXT NOT NULL,
        memberId TEXT NOT NULL,
        period INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        drawnAt TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (arisanId) REFERENCES arisans(id) ON DELETE CASCADE,
        FOREIGN KEY (memberId) REFERENCES members(id) ON DELETE CASCADE
      );
    `);
  } catch {
    isNative = false;
  }
}

function getNow() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export async function getArisans() {
  if (isNative && nativeDb) {
    return await nativeDb.getAllAsync('SELECT * FROM arisans ORDER BY createdAt DESC');
  }
  const data = loadData();
  return data.arisans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getArisan(id) {
  if (isNative && nativeDb) {
    const arisan = await nativeDb.getFirstAsync('SELECT * FROM arisans WHERE id = ?', [id]);
    if (!arisan) return null;
    const members = await nativeDb.getAllAsync('SELECT * FROM members WHERE arisanId = ? ORDER BY joinDate ASC', [id]);
    const payments = await nativeDb.getAllAsync(
      'SELECT p.*, m.name AS memberName FROM payments p LEFT JOIN members m ON p.memberId = m.id WHERE p.arisanId = ? ORDER BY p.period ASC, p.paidAt ASC', [id]
    );
    const winners = await nativeDb.getAllAsync(
      'SELECT w.*, m.name AS memberName FROM winners w LEFT JOIN members m ON w.memberId = m.id WHERE w.arisanId = ? ORDER BY w.period ASC', [id]
    );
    return { ...arisan, members, payments, winners };
  }

  const data = loadData();
  const arisan = data.arisans.find(a => a.id === id);
  if (!arisan) return null;
  const members = data.members.filter(m => m.arisanId === id).sort((a, b) => a.joinDate.localeCompare(b.joinDate));
  const payments = data.payments.filter(p => p.arisanId === id).sort((a, b) => a.period - b.period || a.paidAt.localeCompare(b.paidAt));
  const winners = data.winners.filter(w => w.arisanId === id).sort((a, b) => a.period - b.period);
  return { ...arisan, members, payments, winners };
}

export async function createArisan({ name, description, amount, maxMembers }) {
  const id = generateId();
  const now = getNow();
  const arisan = { id, name, description: description || '', amount, maxMembers: maxMembers || 10, status: 'active', createdAt: now };

  if (isNative && nativeDb) {
    await nativeDb.runAsync(
      'INSERT INTO arisans (id, name, description, amount, maxMembers) VALUES (?, ?, ?, ?, ?)',
      [id, name, description || '', amount, maxMembers || 10]
    );
    return arisan;
  }

  const data = loadData();
  data.arisans.push(arisan);
  saveData(data);
  return arisan;
}

export async function deleteArisan(id) {
  if (isNative && nativeDb) {
    await nativeDb.runAsync('DELETE FROM payments WHERE arisanId = ?', [id]);
    await nativeDb.runAsync('DELETE FROM winners WHERE arisanId = ?', [id]);
    await nativeDb.runAsync('DELETE FROM members WHERE arisanId = ?', [id]);
    await nativeDb.runAsync('DELETE FROM arisans WHERE id = ?', [id]);
    return;
  }

  const data = loadData();
  data.arisans = data.arisans.filter(a => a.id !== id);
  data.members = data.members.filter(m => m.arisanId !== id);
  data.payments = data.payments.filter(p => p.arisanId !== id);
  data.winners = data.winners.filter(w => w.arisanId !== id);
  saveData(data);
}

export async function getMembers(arisanId) {
  if (isNative && nativeDb) {
    return await nativeDb.getAllAsync('SELECT * FROM members WHERE arisanId = ? ORDER BY joinDate ASC', [arisanId]);
  }
  const data = loadData();
  return data.members.filter(m => m.arisanId === arisanId).sort((a, b) => a.joinDate.localeCompare(b.joinDate));
}

export async function joinArisan({ arisanId, name, phone }) {
  if (isNative && nativeDb) {
    const arisan = await nativeDb.getFirstAsync('SELECT * FROM arisans WHERE id = ?', [arisanId]);
    if (!arisan) throw new Error('Arisan tidak ditemukan');
    const count = await nativeDb.getFirstAsync('SELECT COUNT(*) AS count FROM members WHERE arisanId = ? AND isActive = 1', [arisanId]);
    if (count.count >= arisan.maxMembers) throw new Error('Arisan sudah penuh');
    const existing = await nativeDb.getFirstAsync('SELECT * FROM members WHERE arisanId = ? AND name = ?', [arisanId, name]);
    if (existing) throw new Error('Nama sudah terdaftar di arisan ini');
    const id = generateId();
    await nativeDb.runAsync('INSERT INTO members (id, arisanId, name, phone) VALUES (?, ?, ?, ?)', [id, arisanId, name, phone || '']);
    return { id, arisanId, name, phone: phone || '', isActive: 1 };
  }

  const data = loadData();
  const arisan = data.arisans.find(a => a.id === arisanId);
  if (!arisan) throw new Error('Arisan tidak ditemukan');
  const activeMembers = data.members.filter(m => m.arisanId === arisanId && m.isActive);
  if (activeMembers.length >= arisan.maxMembers) throw new Error('Arisan sudah penuh');
  if (data.members.find(m => m.arisanId === arisanId && m.name === name)) throw new Error('Nama sudah terdaftar di arisan ini');
  const id = generateId();
  const now = getNow();
  const member = { id, arisanId, name, phone: phone || '', isActive: 1, joinDate: now };
  data.members.push(member);
  saveData(data);
  return member;
}

export async function payContribution({ memberId, arisanId, period, amount }) {
  if (isNative && nativeDb) {
    const existing = await nativeDb.getFirstAsync(
      'SELECT * FROM payments WHERE memberId = ? AND arisanId = ? AND period = ? AND type = ?',
      [memberId, arisanId, period, 'contribution']
    );
    if (existing) throw new Error('Anggota ini sudah membayar untuk periode ini');
    const id = generateId();
    await nativeDb.runAsync(
      'INSERT INTO payments (id, arisanId, memberId, period, amount, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, arisanId, memberId, period, amount, 'contribution', 'paid']
    );
    return { id, arisanId, memberId, period, amount };
  }

  const data = loadData();
  const existing = data.payments.find(p => p.memberId === memberId && p.arisanId === arisanId && p.period === period && p.type === 'contribution');
  if (existing) throw new Error('Anggota ini sudah membayar untuk periode ini');
  const id = generateId();
  const now = getNow();
  const payment = { id, arisanId, memberId, period, amount, type: 'contribution', status: 'paid', paidAt: now };
  data.payments.push(payment);
  saveData(data);
  return payment;
}

export async function drawWinner(arisanId) {
  if (isNative && nativeDb) {
    const arisan = await nativeDb.getFirstAsync('SELECT * FROM arisans WHERE id = ?', [arisanId]);
    if (!arisan) throw new Error('Arisan tidak ditemukan');
    const activeMembers = await nativeDb.getAllAsync('SELECT * FROM members WHERE arisanId = ? AND isActive = 1', [arisanId]);
    if (activeMembers.length < 2) throw new Error('Minimal 2 anggota untuk melakukan undian');
    const lastWinner = await nativeDb.getFirstAsync('SELECT period FROM winners WHERE arisanId = ? ORDER BY period DESC', [arisanId]);
    const currentPeriod = (lastWinner?.period || 0) + 1;
    const totalCollected = arisan.amount * activeMembers.length;
    const winner = activeMembers[Math.floor(Math.random() * activeMembers.length)];
    const id = generateId();
    await nativeDb.runAsync('INSERT INTO winners (id, arisanId, memberId, period, amount) VALUES (?, ?, ?, ?, ?)', [id, arisanId, winner.id, currentPeriod, totalCollected]);
    return { id, winner: { id: winner.id, name: winner.name }, period: currentPeriod, totalAmount: totalCollected };
  }

  const data = loadData();
  const arisan = data.arisans.find(a => a.id === arisanId);
  if (!arisan) throw new Error('Arisan tidak ditemukan');
  const activeMembers = data.members.filter(m => m.arisanId === arisanId && m.isActive);
  if (activeMembers.length < 2) throw new Error('Minimal 2 anggota untuk melakukan undian');
  const lastWinner = data.winners.filter(w => w.arisanId === arisanId).sort((a, b) => b.period - a.period)[0];
  const currentPeriod = (lastWinner?.period || 0) + 1;
  const totalCollected = arisan.amount * activeMembers.length;
  const winner = activeMembers[Math.floor(Math.random() * activeMembers.length)];
  const id = generateId();
  const now = getNow();
  data.winners.push({ id, arisanId, memberId: winner.id, period: currentPeriod, amount: totalCollected, drawnAt: now });
  saveData(data);
  return { id, winner: { id: winner.id, name: winner.name }, period: currentPeriod, totalAmount: totalCollected };
}

export async function getPaymentSummary(arisanId) {
  if (isNative && nativeDb) {
    return await nativeDb.getAllAsync(
      'SELECT p.*, m.name AS memberName FROM payments p LEFT JOIN members m ON p.memberId = m.id WHERE p.arisanId = ? ORDER BY p.period ASC, p.paidAt ASC', [arisanId]
    );
  }
  const data = loadData();
  return data.payments.filter(p => p.arisanId === arisanId).sort((a, b) => a.period - b.period || a.paidAt.localeCompare(b.paidAt));
}
