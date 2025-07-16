//const db = require('../connection.js');
import db from "../connection.js";


    export async function createUser({
            email, password, firstname, lastname, address, city, postcode, about_me, 
            avatar_url, is_provider, latitude, longitude }) {
                const point = `POINT(${longitude} ${latitude}`;
                const sql = `
            INSERT INTO users
            (email, password, firstname, lastname, address, city, postcode, about_me, 
            avatar_url, is_provider, location)
            VALUES
            ($1, $2, $3, $4, $5,$6,$7,$8,$9,$10,ST_PointFromText($11,4326))
            RETURNING *;
            `;
            
            const params = [
                email, password, firstname, lastname, address, city, postcode, about_me, 
            avatar_url, is_provider, point
        ];
        const { rows } = await db.query (sql, params);
        return rows[0];
        }
        export async function getUserByEmail(email) {
            const { rows } = await db.query(
                `SELECT * FROM users WHERE email = $1;`, [email]
            );
            return rows[0];
        }
        export async function getUserById(id) {
            const { rows } = await db.query(
                `SELECT * FROM users WHERE user_id = $1;`, [id]
            );
            return rows[0];
        }
        
        export async function updateUser(id, updates) {
            //e.g updates = { firstnsme: 'new', city: 'x'}
            const keys = Object.keys(updates);
            const cols = keys.map((k,i) => `${k}=${i+2}`).join(', ');
            const vals = keys.map(k => updates[k]);
            const sql = `UPDATE users SET ${cols} WHERE user_id = $1 RETURNING *;
            `;

            const { rows } = await db.query(
                `UPDATE users SET ${cols} WHERE user_id = $1 RETURNING *;`, [id, ...vals]
            );
            return rows[0];
        }
        export async function deleteUser(id) {
               await db.query(`DELETE FROM users WHERE user_id = $1;`, [id]);
               return 
        }
