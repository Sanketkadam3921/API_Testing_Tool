export const TestQueries = {
    createTest: `
    INSERT INTO tests (user_id, name, method, url, headers, body)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
    getTestsByUser: `
    SELECT * FROM tests WHERE user_id = $1 ORDER BY created_at DESC
  `,
    getTestById: `
    SELECT * FROM tests WHERE id = $1 AND user_id = $2
  `,
    updateTest: `
    UPDATE tests
    SET name = $1, method = $2, url = $3, headers = $4, body = $5, updated_at = NOW()
    WHERE id = $6 AND user_id = $7
    RETURNING *
  `,
    deleteTest: `
    DELETE FROM tests WHERE id = $1 AND user_id = $2 RETURNING *
  `
};
