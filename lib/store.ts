import type { ExamSession } from './exam';
const KEY='ll-proctor-session'; const DB='ll-proctor';
function db(){ return new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('sessions');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);}); }
export async function saveSession(session:ExamSession) { localStorage.setItem(KEY,JSON.stringify(session)); try { const d=await db(); d.transaction('sessions','readwrite').objectStore('sessions').put(session,KEY); } catch {} return session; }
export async function getSession():Promise<ExamSession|null> { try { const d=await db(); const r=d.transaction('sessions').objectStore('sessions').get(KEY); return await new Promise(resolve=>{r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>resolve(null);}) as ExamSession|null; } catch { try {const x=localStorage.getItem(KEY);return x?JSON.parse(x):null;}catch{return null;} } }
export async function clearSession() { localStorage.removeItem(KEY); try { const d=await db();d.transaction('sessions','readwrite').objectStore('sessions').delete(KEY); }catch{} }
