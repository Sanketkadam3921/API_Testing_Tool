import pool from "../../config/db.js";
import { TestQueries } from "./tests.queries.js";
import { runApiTest } from "../../utils/apiRunner.js";

export const TestsService = {
    createTest: async (userId, name, method, url, headers, body) => {
        const result = await pool.query(TestQueries.createTest, [
            userId,
            name,
            method,
            url,
            headers,
            body,
        ]);
        return result.rows[0];
    },

    getAllTests: async (userId) => {
        const result = await pool.query(TestQueries.getTestsByUser, [userId]);
        return result.rows;
    },

    getTestById: async (id, userId) => {
        const result = await pool.query(TestQueries.getTestById, [id, userId]);
        return result.rows[0];
    },

    updateTest: async (id, userId, data) => {
        const { name, method, url, headers, body } = data;
        const result = await pool.query(TestQueries.updateTest, [
            name,
            method,
            url,
            headers,
            body,
            id,
            userId,
        ]);
        return result.rows[0];
    },

    deleteTest: async (id, userId) => {
        const result = await pool.query(TestQueries.deleteTest, [id, userId]);
        return result.rows[0];
    },

    runTest: async (id, userId) => {
        const result = await pool.query(TestQueries.getTestById, [id, userId]);
        const test = result.rows[0];
        if (!test) throw new Error("Test not found");

        // Use apiRunner utility to execute
        const runResult = await runApiTest(test);
        return { test, runResult };
    },
};
