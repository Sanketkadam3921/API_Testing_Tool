import { EnvironmentsService } from './environments.service.js';

export const EnvironmentsController = {
    // Create environment
    createEnvironment: async (req, res, next) => {
        try {
            const { name, variables } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            if (!name || name.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Environment name is required',
                });
            }

            const environment = await EnvironmentsService.createEnvironment(
                userId,
                name.trim(),
                variables || {}
            );

            res.status(201).json({
                success: true,
                environment,
            });
        } catch (err) {
            next(err);
        }
    },

    // Get environments
    getEnvironments: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const environments = await EnvironmentsService.getEnvironments(userId);

            res.status(200).json({
                success: true,
                environments,
            });
        } catch (err) {
            next(err);
        }
    },

    // Get environment by ID
    getEnvironment: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const environment = await EnvironmentsService.getEnvironmentById(id, userId);
            
            if (!environment) {
                return res.status(404).json({
                    success: false,
                    message: 'Environment not found',
                });
            }

            res.status(200).json({
                success: true,
                environment,
            });
        } catch (err) {
            next(err);
        }
    },

    // Update environment
    updateEnvironment: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { name, variables } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const environment = await EnvironmentsService.updateEnvironment(id, userId, {
                name,
                variables,
            });
            
            if (!environment) {
                return res.status(404).json({
                    success: false,
                    message: 'Environment not found',
                });
            }

            res.status(200).json({
                success: true,
                environment,
            });
        } catch (err) {
            next(err);
        }
    },

    // Delete environment
    deleteEnvironment: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const environment = await EnvironmentsService.deleteEnvironment(id, userId);
            
            if (!environment) {
                return res.status(404).json({
                    success: false,
                    message: 'Environment not found',
                });
            }

            res.status(200).json({
                success: true,
                message: 'Environment deleted successfully',
            });
        } catch (err) {
            next(err);
        }
    },
};

