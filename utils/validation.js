import db from "../connection.js"

export async function checkUserExists(userId, mustBeProvider = false) {
    const { rows } = await db.query(
        `SELECT is_provider FROM users WHERE user_id = $1;`, [userId]
    );
    if(rows.length === 0) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
    }
    if(mustBeProvider && !rows[0].is_provider) {
        const err = new Error("User is not provider");
        err.status = 400;
        throw err;
    }
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration(req, res, next) {
    const {
        email, password, firstname, lastname, addresss, city, postcode, about_me,
        avatar_url, is_provider, latitude, longitude
    } = req.body;
    if (!email || !password || !firstname || !lastname) {
        return res.status(400).json({ 
            status: 400,
            message: " Missing required field",
            detail: "Email, password, firstname, lastname are required"
        });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({ status: 400, message:"Invalid email format" });
    }
    if(password.length < 6) {
        return res.status(400).json({ 
            status: 400,
            message: "Password too short",
            detail: "Atleast 6 characters"
        });
    }
    if(typeof is_provider !== "boolean") {
        return res.status(400).json({ status: 400, message: "is_provider must be a boolean" });
    }

    if (
        latitude === undefined ||
        longitude === undefined ||
        latitude <-90 || latitude > 90 ||
        longitude <-180 || longitude > 180
    ) {
        return res.status(400).json({
            status: 400,
            message: "Invalid latitude/Longitude"
        });
    }
    next();
}

export function validateLogin(req, res, next) {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({ status: 400, message: "Email and password required" });
    }
    next();
}