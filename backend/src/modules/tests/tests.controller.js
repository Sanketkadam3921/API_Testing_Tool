import { TestsService } from "./tests.service.js";

export const TestsController = {
    create: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { name, method, url, headers, body } = req.body;
            const test = await TestsService.createTest(
                userId,
                name,
                method,
                url,
                headers,
                body
            );
            res.status(201).json({ success: true, test });
        } catch (err) {
            next(err);
        }
    },

    getAll: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const tests = await TestsService.getAllTests(userId);
            res.status(200).json({ success: true, tests });
        } catch (err) {
            next(err);
        }
    },

    getById: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const test = await TestsService.getTestById(req.params.id, userId);
            if (!test) return res.status(404).json({ success: false, message: "Test not found" });
            res.status(200).json({ success: true, test });
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const test = await TestsService.updateTest(
                req.params.id,
                userId,
                req.body
            );
            if (!test) return res.status(404).json({ success: false, message: "Test not found" });
            res.status(200).json({ success: true, test });
        } catch (err) {
            next(err);
        }
    },

    remove: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const test = await TestsService.deleteTest(req.params.id, userId);
            if (!test) return res.status(404).json({ success: false, message: "Test not found" });
            res.status(200).json({ success: true, message: "Test deleted" });
        } catch (err) {
            next(err);
        }
    },

    run: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const result = await TestsService.runTest(req.params.id, userId);
            res.status(200).json({ success: true, ...result });
        } catch (err) {
            next(err);
        }
    },
};
