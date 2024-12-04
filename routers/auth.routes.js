const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middlewares/authMiddleware");
const verifyRole = require("../middlewares/verifyRoleMiddleware");
const {
  validateUserBody,
  validationMiddleware,
} = require("../utils/validationHelpers");
const { upload } = require("../data/multer");

router.post(
  "/register",
  authenticateToken,
  verifyRole(["admin"]),
  upload.single("image"),
  validateUserBody(),
  validationMiddleware,
  authController.register
);

router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.post("/refresh-token", authenticateToken, authController.refreshToken);

router.post("/request-otp", authController.requestOtp);

router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
