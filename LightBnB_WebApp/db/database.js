const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

const properties = require("./json/properties.json");
const users = require("./json/users.json");

const db = require('./index');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const queryString = `
    SELECT *
    FROM users
    WHERE email = $1
  `;
  
  return db.query(queryString, [email])
    .then(result => {
      if (result.rowCount === 0) {
        return null;
      } else {
        return result.rows[0];
      }
    })
    .catch((err) => {
      console.error(err.message);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const queryString = `
    SELECT *
    FROM users
    WHERE id = $1
  `;

  return db.query(queryString, [id])
    .then(result => {
      return result.rows[0];
    })
    .catch((err) => {
      console.error(err.message);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {

  const queryString = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
  `;

  return db.query(queryString, [user.name, user.email, user.password])
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

  const queryString = `
    SELECT r.id AS id, p.title AS title, r.start_date AS start_date, 
         p.cost_per_night AS cost_per_night, avg(pr.rating) AS average_raing
    FROM reservations AS r
    INNER JOIN properties AS p ON p.id = r.property_id
    INNER JOIN property_reviews AS pr ON p.id = pr.property_id
    WHERE pr.guest_id = $1
    GROUP BY r.id, p.id
    ORDER BY r.start_date
    LIMIT $2;
  `;

  return db.query(queryString, [guest_id, limit])
    .then(result => {
      return result.rows;
    })
    .catch((err) => {
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
  const queryParams = [];

  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
  `;

  let isTheFirst = true;

  if (options.city) {
    isTheFirst = false;
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length}`;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    !isTheFirst ? queryString += ` AND properties.owner_id = $${queryParams.length}`
      : queryString += ` WHERE properties.owner_id = $${queryParams.length}`;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night / 100);
    !isTheFirst ? queryString += ` AND properties.minimum_price_per_night >= $${queryParams.length}`
      : queryString += ` WHERE properties.minimum_price_per_night >= $${queryParams.length}`;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night / 100);
    !isTheFirst ? queryString += ` AND properties.maximum_price_per_night <= $${queryParams.length}`
      : queryString += ` WHERE properties.maximum_price_per_night <= $${queryParams.length}`;
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    !isTheFirst ? queryString += ` AND property_reviews.rating >= $${queryParams.length}`
      : queryString += ` WHERE property_reviews.rating >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  return db.query(queryString, queryParams)
    .then(result => {
      return result.rows;
    })
    .catch((err) => {
      console.error(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryString = `
    INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, 
      cover_photo_url, cost_per_night, street, city, province, post_code, country,
        parking_spaces, number_of_bathrooms, number_of_bedrooms)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;
  return db.query(queryString,
    [property.owner_id, property.title, property.description, property.thumbnail_photo_url,
      property.cover_photo_url, property.cost_per_night * 100, property.street, property.city, property.province,
      property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms,
      property.number_of_bedrooms]
  )
    .then(result => {
      const insertedProperty = result.rows[0];

      return insertedProperty;
    })
    .catch((err) => {
      console.error('Error adding property: ', err.message);
      throw err;
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
