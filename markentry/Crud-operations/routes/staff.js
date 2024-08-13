const express = require("express");
const router = express.Router();
const db = require("../db");
const utils = require("../utils");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const config = require("../config");
const verifyToken = require("../verifyToken");

// REGISTER API
router.post("/register", (request, response) => {

  const { course_name, staff_name, email, password } = request.body;

  // create a sql statement
  const statement = `INSERT INTO staff (course_name , staff_name, email, password) VALUES ( ?, ?, ?, ?)`;

  // encrypt the password
  const encryptedPassword = String(crypto.SHA256(password));

  db.execute(statement, [ course_name, staff_name, email, encryptedPassword], (error, result) => {
    if (error) {
      response.send(utils.createErrorResponse(error));
    } else {
      response.send(
        utils.createSuccessResponse("Staff registered successfully")
      );
    }
  });
});

router.post("/login", (request, response) => {
  const { email, password } = request.body;

  // First query to check if the email exists
  const emailCheckStatement = `SELECT employee_number, staff_name FROM STAFF WHERE email = ?`;

  db.execute(emailCheckStatement, [email], (error, staffs) => {
    if (error) {
      response.send(utils.createErrorResponse(error));
    } else {
      if (staffs.length === 0) {
        response.send(utils.createErrorResponse("Invalid email!"));
      } else {
        const staff = staffs[0];

        // Encrypt the provided password
        const encryptedPassword = String(crypto.SHA256(password));

        // Second query to check if the password matches
        const passwordCheckStatement = `SELECT role,employee_number, staff_name, email FROM STAFF WHERE email = ? AND password = ?`;

        db.execute(
          passwordCheckStatement,
          [email, encryptedPassword],
          (error, staffs) => {
            if (error) {
              response.send(utils.createErrorResponse(error));
            } else {
              if (staffs.length === 0) {
                response.send(utils.createErrorResponse("Invalid password!"));
              } else {
                const staff = staffs[0];

                // Creating a payload with user information for JWT token
                const payload = {
                  staff_id: staff.staff_id,
                  employee_number: staff.employee_number,
                  staff_name: staff.staff_name,
                  staff_email: staff.email,
                  staff_role: staff.role
                };

                // Generating a JWT token with the payload and a secret key
                const token = jwt.sign(payload, config.SECRET_KEY);

                console.log("====================================");
                console.log("token-", token);
                console.log("====================================");

                response.send(
                  utils.createSuccessResponse({
                    token,
                    staff_name: staff.name,
                  })
                );
              }
            }
          }
        );
      }
    }
  });
});

// Protected route example
router.get("/staffs", (req, res) => {
  // Query to fetch list of students from database
  console.log("staff");
  const query = "SELECT * FROM staff";

  db.execute(query, (error, students) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse(students));
    }
  });
});

// Create a new student
router.post("/students", (req, res) => {
  const { name, email } = req.body;

  console.log("body- ", req.body);

  const query = "INSERT INTO students (student_name, email) VALUES (?, ?)";
  db.execute(query, [name, email], (error, results) => {
    if (error) {
      console.error("Database error: ", error);
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(
        utils.createSuccessResponse({ id: results.insertId, name, email })
      );
    }
  });
});

// Update a student
router.put("/students/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const query = "UPDATE students SET student_name = ?, email = ? WHERE id = ?";
  db.execute(query, [name, email, id], (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse({ id, name, email }));
    }
  });
});

// Delete a student
router.delete("/students/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM students WHERE id = ?";
  db.execute(query, [id], (error, results) => {
    if (error) {
      res.status(500).json(utils.createErrorResponse("Database error"));
    } else {
      res.json(utils.createSuccessResponse({ id }));
    }
  });
});
module.exports = router;
