const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

const properties = require("./json/properties.json");
const users = require("./json/users.json");

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query(
    `
      SELECT * 
      FROM users
      WHERE email = $1
    `,
    [email]
  ).then(result => {
    if (result.rowCount === null) {
      return null;
    } else {
      return result.rows[0];
    }
  }).catch((err) => {
    console.error(err.message);
  });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(
    `
      SELECT *
      FROM users
      WHERE id = $1
    `,
    [id]
  ).then(result => {
    return result.rows[0];
  }).catch((err) => {
    console.error(err.message);
  });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  return pool.query(
    `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    `,
    [user.name, user.email, user.password]
  )
    .then(result => {
      const insertedUser = result.rows[0];

      return insertedUser;
    })
    .catch((err) => {
      console.error('Error adding user: ', err.message);
      throw err;
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(
    `
    SELECT r.id AS id, p.title AS title, r.start_date AS start_date, 
        p.cost_per_night AS cost_per_night, avg(pr.rating) AS average_raing
    FROM reservations AS r
    INNER JOIN properties AS p ON p.id = r.property_id
    INNER JOIN property_reviews AS pr ON p.id = pr.property_id
    WHERE pr.guest_id = $1
    GROUP BY r.id, p.id
    ORDER BY r.start_date
    LIMIT $2;
    `,
    [guest_id, limit]
  ).then(result => {
    return result.rows;
  }).catch((err) => {
    console.error(err.message);
  });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  return pool.query(
    `
    SELECT * FROM properties LIMIT $1;
    `,
    [limit]
  ).then(result => {
    return result.rows;
  })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
