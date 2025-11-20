import { Router } from "express";
import { CollectionsController } from "./collections.controller.js";

const router = Router();

// Collections routes
router.post("/", CollectionsController.createCollection);
router.get("/", CollectionsController.getCollections);
router.get("/:id", CollectionsController.getCollection);
router.put("/:id", CollectionsController.updateCollection);
router.delete("/:id", CollectionsController.deleteCollection);

// Collection structure
router.get("/:collectionId/structure", CollectionsController.getCollectionStructure);

// Folders routes
router.post("/:collectionId/folders", CollectionsController.createFolder);
router.get("/:collectionId/folders", CollectionsController.getFolders);
router.put("/folders/:id", CollectionsController.updateFolder);
router.delete("/folders/:id", CollectionsController.deleteFolder);

// Requests routes
router.post("/:collectionId/requests", CollectionsController.createRequest);
router.get("/:collectionId/requests", CollectionsController.getRequests);
router.get("/requests/:id", CollectionsController.getRequest);
router.put("/requests/:id", CollectionsController.updateRequest);
router.delete("/requests/:id", CollectionsController.deleteRequest);
router.post("/requests/:id/move", CollectionsController.moveRequest);

export default router;
