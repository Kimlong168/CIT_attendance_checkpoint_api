const express = require("express");

const router = express.Router();

const clientVisitLogController = require("../controllers/clientVisitLog.controller");

const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");

const {
  validateClientVisitLogBody,
  validationMiddleware,
} = require("../utils/validationHelpers");

router.get(
  "/",
  authenticateToken,
  clientVisitLogController.getAllClientVisitLogs
);

router.get(
  "/:id",
  authenticateToken,
  clientVisitLogController.getClientVisitLogById
);

router.get(
  "/employee/:id",
  authenticateToken,
  clientVisitLogController.getClientVisitLogByEmployeeId
);

router.post(
  "/",
  authenticateToken,
  verifyRole(["user"]),
  validateClientVisitLogBody(),
  validationMiddleware,
  clientVisitLogController.createClientVisitLog
);

router.put(
  "/:id",
  authenticateToken,
  verifyRole(["user"]),
  validateClientVisitLogBody(),
  validationMiddleware,
  clientVisitLogController.updateClientVisitLog
);

router.delete(
  "/clear-all",
  authenticateToken,
  verifyRole(["admin", "manager"]),
  clientVisitLogController.clearAllClientVisitLogs
);

router.delete(
  "/:id",
  authenticateToken,
  verifyRole(["admin", "user"]),
  clientVisitLogController.deleteClientVisitLog
);

module.exports = router;
