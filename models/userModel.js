const db = require('../connection.cjs');

module.exports = {
    async createUser(user) {
        const { 
            email, password, firstname, lastname, address, city, postcode, about_me, 
            avatar_url, is_provider, latitude, longitude } = user;
            
            const SQL = `
            INSERT INTO users
            (email, password, firstname, lastname, address, city, postcode, about_me, 
            avatar_url, is_provider, location)
            VALUES
            ($1, $2, $3, $4, $5,$6,$7,$8,$9,$10,ST_PointFromText($11,4326))
            RETURNING *;
            `;

            const point = `POINT(${longitude} ${latitude}`;
            const params = [
                email, password, firstname, lastname, address, city, postcode, about_me, 
            avatar_url, is_provider, point
        ];
        const { rows } = await db.query (SQL, params);
        return rows[0];
        },
        async getUserById(id) {
            const { rows } =await db.query(
                `SELECT * FROM users WHERE user_id = $1;`, [id]
            );
            return rows[0];
        },
        async getUserByEmail(email) {
            const { rows } = await db.query(
                `SELECT * FROM users WHERE email = $1;`, [email]
            );
            return rows[0];
        },
        async updateUser(id, updates) {
            //e.g updates = { firstnsme: 'new', city: 'x'}
            const keys = Object.keys(updates);
            const cols = keys.map((k,i) => `${k}=${i+2}`).join(', ');
            const vals = keys.map(k => updates[k]);

            const { rows } = await db.query(
                `UPDATE users SET ${cols} WHERE user_id = $1 RETURNING *;`, [id, ...vals]
            );
            return rows[0];
        },
        async deleteUser(id) {
               await db.query(`DELETE FROM users WHERE user_id = $1;`, [id]);
               return 
        }
};