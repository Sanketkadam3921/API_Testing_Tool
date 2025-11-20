export const AuthQueries = {
    createUser: `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at
  `,
    findUserByEmail: `
    SELECT * FROM users WHERE email = $1
  `,
    findUserById: `
    SELECT id, name, email, created_at, updated_at
    FROM users WHERE id = $1
  `
};
